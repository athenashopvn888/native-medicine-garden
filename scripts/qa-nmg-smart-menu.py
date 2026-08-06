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
      const cardSelectors = ['cardExotic','cardPremium','cardAaa','cardAa','cardBudget'];
      const featureChecks = cardSelectors.map((needle) => {
        const card = [...document.querySelectorAll('div')].find((e) => String(e.className).split(/\s+/).some((token) => token.endsWith(`__${needle}`)));
        if (!card) return { card: needle, ok: false, feature: null };
        const image = [...card.querySelectorAll('img[alt]')].find((img) => img.alt);
        return { card: needle, ok: Boolean(image && card.innerText.includes(image.alt)), feature: image?.alt || null };
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
        target = requests.put(f"http://127.0.0.1:9223/json/new?{BASE}/tv", timeout=5).json()
        cdp = Cdp(target["webSocketDebuggerUrl"])
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        wait_until(cdp, "document.body && document.body.innerText.includes('OPEN 24 HOURS')")
        envelope = cdp.evaluate("fetch('/api/tv-data?type=flowers').then(r => r.json())", True)
        manifest = envelope["lineup"]["manifest"]
        initial_names = {
            tier: [product["name"] for product in data["pages"][0]["products"]]
            for tier, data in envelope["lineup"]["tiers"].items()
        }
        second_names = {
            tier: [product["name"] for product in data["pages"][1]["products"]]
            for tier, data in envelope["lineup"]["tiers"].items() if len(data["pages"]) > 1
        }
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
        before = metrics(cdp)["visibleText"]
        time.sleep(26.5)
        after = metrics(cdp)["visibleText"]
        report["pageCycle"] = {
            "initialPagesVisible": all(all(name in before for name in names) for names in initial_names.values()),
            "secondPagesVisible": all(all(name in after for name in names) for names in second_names.values()),
            "changed": before != after,
            "seconds": 26.5,
        }
        cdp.call("Page.navigate", {"url": f"{BASE}/tv2"})
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
            and report["pageCycle"]["initialPagesVisible"]
            and report["pageCycle"]["secondPagesVisible"]
            and report["pageCycle"]["changed"]
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
