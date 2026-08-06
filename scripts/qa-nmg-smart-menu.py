import base64
import json
import subprocess
import tempfile
import time
from pathlib import Path

import requests
from websockets.sync.client import connect

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE = "http://127.0.0.1:3218"
SIZES = [(1920, 1080), (2048, 1152), (3840, 2160)]
WINDOW_MS = 30 * 60 * 1000


def regular_window(products, capacity, bucket):
    if not products or capacity == 0:
        return []
    count = (len(products) + capacity - 1) // capacity
    index = bucket % count
    cycle = bucket // count
    window = products[index * capacity:(index + 1) * capacity]
    if len(window) < 2:
        return window
    offset = cycle % len(window)
    return window[offset:] + window[:offset]


def expected_skus(envelope, bucket):
    expected = []
    for data in envelope["lineup"]["tiers"].values():
        visible = data["lockedProducts"] + regular_window(data["regularProducts"], data["regularCapacity"], bucket)
        expected.extend(product["sku"] for product in visible)
    return expected


class Cdp:
    def __init__(self, websocket_url):
        self.socket = connect(websocket_url, max_size=64 * 1024 * 1024)
        self.message_id = 0

    def call(self, method, params=None):
        self.message_id += 1
        target = self.message_id
        self.socket.send(json.dumps({"id": target, "method": method, "params": params or {}}))
        while True:
            message = json.loads(self.socket.recv())
            if message.get("id") == target:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})

    def evaluate(self, expression, await_promise=False):
        result = self.call("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": await_promise,
        })
        return result["result"].get("value")


def wait_until(cdp, expression, timeout=45):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if cdp.evaluate(expression):
            return
        time.sleep(0.5)
    raise TimeoutError(expression)


def metrics(cdp):
    return cdp.evaluate("""(() => {
      const doc = document.documentElement;
      const ticker = [...document.querySelectorAll('*')]
        .filter((e) => e.children.length === 0 && /OPEN 24 HOURS|ALL SALES ARE FINAL/.test(e.textContent || ''))
        .map((e) => ({ text: e.textContent.trim(), opacity: getComputedStyle(e).opacity }));
      const cardSelectors = [['cardExotic','EXOTIC'],['cardPremium','PREMIUM'],['cardAaa','AAA+'],['cardAa','AA'],['cardBudget','BUDGET']];
      const featureChecks = cardSelectors.map(([name,tier]) => {
        const card = document.querySelector(`[data-smart-tier="${tier}"]`);
        if (!card) return { card: name, ok: false, feature: null };
        const image = [...card.querySelectorAll('img[alt]')].find((img) => img.alt);
        return { card: name, ok: Boolean(image && card.innerText.includes(image.alt)), feature: image?.alt || null };
      });
      const grid = [...document.querySelectorAll('div')].find((e) => String(e.className).includes('grid'));
      return {
        inner: [innerWidth, innerHeight],
        scroll: [doc.scrollWidth, doc.scrollHeight],
        overflowX: doc.scrollWidth > innerWidth,
        overflowY: doc.scrollHeight > innerHeight,
        bannerCount: document.querySelectorAll('[class*="menuBanner"]').length,
        gridCount: grid?.children.length || 0,
        ticker,
        featureChecks,
        flowerSkus: [...document.querySelectorAll('[data-flower-sku]')].map((e) => e.getAttribute('data-flower-sku')),
        visibleText: document.body.innerText,
      };
    })()""")


def main():
    artifact_dir = Path(tempfile.mkdtemp(prefix="nmg-smart-menu-qa-"))
    profile_dir = artifact_dir / "chrome-profile"
    process = subprocess.Popen([
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--remote-allow-origins=*",
        "--remote-debugging-port=9223",
        f"--user-data-dir={profile_dir}",
        "about:blank",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            try:
                requests.get("http://127.0.0.1:9223/json/version", timeout=1).raise_for_status()
                break
            except requests.RequestException:
                time.sleep(0.25)
        now_ms = int(time.time() * 1000)
        remaining_ms = ((now_ms // WINDOW_MS) + 1) * WINDOW_MS - now_ms
        if remaining_ms < 45_000:
            time.sleep((remaining_ms + 2_000) / 1000)
        target = requests.put(f"http://127.0.0.1:9223/json/new?{BASE}/tv", timeout=5).json()
        cdp = Cdp(target["webSocketDebuggerUrl"])
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        wait_until(cdp, "document.body && document.body.innerText.includes('OPEN 24 HOURS')")
        envelope = cdp.evaluate("fetch('/api/tv-data?type=flowers').then(r => r.json())", True)
        manifest = envelope["lineup"]["manifest"]
        stable_bucket = manifest["window"]["bucket"]
        stable_expected = expected_skus(envelope, stable_bucket)
        wait_until(cdp, f"Boolean(document.querySelector('[data-flower-sku=\"{stable_expected[0]}\"]'))")
        report = {"artifactDir": str(artifact_dir), "manifest": manifest, "tv": [], "tv2": []}
        for width, height in SIZES:
            cdp.call("Emulation.setDeviceMetricsOverride", {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": False})
            time.sleep(0.8)
            item = metrics(cdp)
            item["size"] = f"{width}x{height}"
            item.pop("visibleText", None)
            report["tv"].append(item)
            if width == 2048:
                shot = cdp.call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
                (artifact_dir / "tv-2048x1152.png").write_bytes(base64.b64decode(shot["data"]))
        before_skus = metrics(cdp)["flowerSkus"]
        time.sleep(31.5)
        after_skus = metrics(cdp)["flowerSkus"]
        report["windowStability"] = {
            "expectedSkus": stable_expected,
            "beforeSkus": before_skus,
            "afterSkus": after_skus,
            "stable": before_skus == stable_expected and after_skus == stable_expected,
            "seconds": 31.5,
        }
        boundary_bucket = stable_bucket
        boundary_before_expected = expected_skus(envelope, boundary_bucket)
        boundary_after_expected = expected_skus(envelope, boundary_bucket + 1)
        boundary_before_ms = (boundary_bucket + 1) * WINDOW_MS - 1000
        boundary_after_ms = (boundary_bucket + 1) * WINDOW_MS + 1000
        cdp.evaluate(f"dispatchEvent(new CustomEvent('nmg-smart-menu-qa-time', {{detail:{boundary_before_ms}}}))")
        time.sleep(0.3)
        boundary_before_skus = metrics(cdp)["flowerSkus"]
        cdp.evaluate(f"dispatchEvent(new CustomEvent('nmg-smart-menu-qa-time', {{detail:{boundary_after_ms}}}))")
        time.sleep(0.3)
        boundary_after_skus = metrics(cdp)["flowerSkus"]
        report["simulatedBoundary"] = {
            "from": "29:59",
            "to": "30:00",
            "beforeTimestampMs": boundary_before_ms,
            "afterTimestampMs": boundary_after_ms,
            "beforeSkus": boundary_before_skus,
            "afterSkus": boundary_after_skus,
            "beforeExpected": boundary_before_expected,
            "afterExpected": boundary_after_expected,
            "changed": boundary_before_skus != boundary_after_skus,
            "passed": boundary_before_skus == boundary_before_expected and boundary_after_skus == boundary_after_expected,
        }
        tv2_target = requests.put(f"http://127.0.0.1:9223/json/new?{BASE}/tv2", timeout=5).json()
        cdp = Cdp(tv2_target["webSocketDebuggerUrl"])
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        wait_until(cdp, "document.body && document.body.innerText.includes('OPEN 24 HOURS')")
        for width, height in SIZES:
            cdp.call("Emulation.setDeviceMetricsOverride", {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": False})
            time.sleep(0.8)
            item = metrics(cdp)
            item["size"] = f"{width}x{height}"
            item.pop("visibleText", None)
            report["tv2"].append(item)
            if width == 2048:
                shot = cdp.call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
                (artifact_dir / "tv2-2048x1152.png").write_bytes(base64.b64decode(shot["data"]))
        report["passed"] = (
            manifest["accepted"]
            and report["windowStability"]["stable"]
            and report["simulatedBoundary"]["passed"]
            and all(not row["overflowX"] and not row["overflowY"] and row["bannerCount"] == 0 and row["gridCount"] == 7 and all(check["ok"] for check in row["featureChecks"]) for row in report["tv"])
            and all(not row["overflowX"] and not row["overflowY"] and row["bannerCount"] == 0 and row["gridCount"] == 6 for row in report["tv2"])
        )
        (artifact_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))
        if not report["passed"]:
            raise SystemExit(1)
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


if __name__ == "__main__":
    main()
