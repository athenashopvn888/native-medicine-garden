"use client";
/* eslint-disable @next/next/no-img-element -- local blob previews cannot use the image optimizer */

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./staffPhoto.module.css";

type Prompt = { key: string; label: string };
type StaffStatus = {
  store: { code: string; name: string };
  dayKey: string;
  submissions: Array<{ id: string; slot: number; prompt_key: string; status: string }>;
  requiredComplete: boolean;
  optionalComplete: boolean;
  availablePrompts: Prompt[];
  randomCheck: null | { key: string; question: string; completed: boolean; result: string | null };
};
type StaffPhotoConfig = { storeCode: string; storeName: string; brandInitials: string };

const STAFF_NAME_KEY = "staff-photo-name";

function previewStatus(config: StaffPhotoConfig): StaffStatus {
  return {
    store: { code: config.storeCode, name: config.storeName },
    dayKey: new Date().toISOString().slice(0, 10),
    submissions: [],
    requiredComplete: false,
    optionalComplete: false,
    availablePrompts: [
      { key: "storefront-front", label: "Front storefront and sign" },
      { key: "interior-wide", label: "Wide interior view" },
      { key: "counter-clean", label: "Clean checkout area" },
    ],
    randomCheck: { key: "sign-visible", question: "Is the exterior sign clean and clearly visible?", completed: false, result: null },
  };
}

async function apiJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

async function redrawImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a photo or screenshot.");
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This photo could not be prepared.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
  if (!blob) throw new Error("This photo could not be prepared.");
  if (blob.size > 5 * 1024 * 1024) throw new Error("Photo is too large. Take it again at a lower resolution.");
  return new File([blob], "nmg-staff-photo.jpg", { type: "image/jpeg", lastModified: Date.now() });
}

export default function StaffPhotoApp({
  previewMode = null,
  config,
}: {
  previewMode?: "login" | "dashboard" | null;
  config: StaffPhotoConfig;
}) {
  const isPreview = previewMode !== null;
  const [authKnown, setAuthKnown] = useState(isPreview);
  const [authenticated, setAuthenticated] = useState(previewMode === "dashboard");
  const [status, setStatus] = useState<StaffStatus | null>(previewMode === "dashboard" ? previewStatus(config) : null);
  const [busy, setBusy] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [promptKey, setPromptKey] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForCheck, setIssueForCheck] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function loadStatus() {
    try {
      const response = await fetch("/api/staff-photo/status", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        setStatus(null);
        return;
      }
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not load today's task.");
      const savedName = window.sessionStorage.getItem(STAFF_NAME_KEY) || "";
      if (!savedName) {
        await apiJson("/api/staff-photo/auth", { method: "DELETE" });
        setAuthenticated(false);
        setStatus(null);
        return;
      }
      setStaffName(savedName);
      setStatus(result);
      setAuthenticated(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load today's task.");
    } finally {
      setAuthKnown(true);
    }
  }

  useEffect(() => {
    if (isPreview) return;
    const timer = window.setTimeout(() => { void loadStatus(); }, 0);
    return () => window.clearTimeout(timer);
  }, [isPreview]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const pin = String(data.get("pin") || "");
    const name = String(data.get("staffName") || "").trim().replace(/\s+/g, " ").slice(0, 60);
    setBusy(true);
    setError("");
    if (name.length < 2) {
      setError("Enter your name before continuing.");
      setBusy(false);
      return;
    }
    setStaffName(name);
    window.sessionStorage.setItem(STAFF_NAME_KEY, name);
    if (isPreview) {
      setAuthenticated(true);
      setStatus(previewStatus(config));
      setBusy(false);
      return;
    }
    try {
      await apiJson("/api/staff-photo/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      formElement.reset();
      await loadStatus();
    } catch (caught) {
      window.sessionStorage.removeItem(STAFF_NAME_KEY);
      setStaffName("");
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function choosePhoto(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("Preparing photo…");
    try {
      const prepared = await redrawImage(file);
      if (preview) URL.revokeObjectURL(preview);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared));
      setMessage("Photo ready. Check it, then submit.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare photo.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview("");
    setMessage("");
    if (cameraRef.current) cameraRef.current.value = "";
  }

  async function submitPhoto() {
    if (!photo || !promptKey) {
      setError("Choose a shot type and take a photo first.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("Submitting today's photo…");
    const form = new FormData();
    form.set("promptKey", promptKey);
    form.set("photo", photo);
    form.set("staffName", staffName);
    try {
      if (isPreview) {
        const nextSlot = (status?.submissions.length || 0) + 1;
        setStatus((current) => current ? {
          ...current,
          submissions: [...current.submissions, { id: `preview-${nextSlot}`, slot: nextSlot, prompt_key: promptKey, status: "pending" }],
          requiredComplete: true,
          optionalComplete: nextSlot === 2,
          availablePrompts: current.availablePrompts.filter((item) => item.key !== promptKey),
        } : current);
        clearPhoto();
        setPromptKey("");
        setMessage(nextSlot === 1 ? "Required photo submitted. Thank you!" : "Optional second photo submitted. Thank you!");
        return;
      }
      const result = await apiJson("/api/staff-photo/submissions", { method: "POST", body: form });
      clearPhoto();
      setPromptKey("");
      setMessage(result.slot === 1 ? "Required photo submitted. Thank you!" : "Optional second photo submitted. Thank you!");
      await loadStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit photo.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function completeCheckOk() {
    setBusy(true);
    setError("");
    try {
      if (!isPreview) {
        await apiJson("/api/staff-photo/random-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ result: "ok", staffName }),
        });
      }
      setStatus((current) => current?.randomCheck ? { ...current, randomCheck: { ...current.randomCheck, completed: true, result: "ok" } } : current);
      setMessage("Store check complete. Thank you!");
      if (!isPreview) await loadStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not complete the check.");
    } finally {
      setBusy(false);
    }
  }

  async function submitIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.set("staffName", staffName);
    setBusy(true);
    setError("");
    try {
      const attachment = form.get("attachment");
      if (attachment instanceof File && attachment.size > 0) form.set("attachment", await redrawImage(attachment));
      const result = isPreview ? { issueId: "preview-issue" } : await apiJson("/api/staff-photo/issues", { method: "POST", body: form });
      if (issueForCheck && !isPreview) {
        await apiJson("/api/staff-photo/random-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ result: "issue", issueId: result.issueId, staffName }),
        });
      }
      if (issueForCheck) {
        setStatus((current) => current?.randomCheck ? { ...current, randomCheck: { ...current.randomCheck, completed: true, result: "issue" } } : current);
      }
      formElement.reset();
      setIssueOpen(false);
      setIssueForCheck(false);
      setMessage(issueForCheck ? "Issue reported and store check complete." : "Store issue reported. Thank you!");
      if (!isPreview) await loadStatus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not report the issue.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    window.sessionStorage.removeItem(STAFF_NAME_KEY);
    setStaffName("");
    if (!isPreview) await apiJson("/api/staff-photo/auth", { method: "DELETE" });
    setAuthenticated(false);
    setStatus(null);
  }

  if (!authKnown) return <main className={styles.shell}><div className={styles.loading} role="status">Loading staff page…</div></main>;
  if (!authenticated) return (
    <main className={styles.shell}>
      <section className={styles.loginCard} aria-labelledby="login-title">
        <div className={styles.brandMark}>{config.brandInitials}</div>
        <p className={styles.eyebrow}>{config.storeCode} · Staff only</p>
        <h1 id="login-title">Ready for today&apos;s quick mission?</h1>
        <p className={styles.intro}>One useful photo. About 60 seconds. Enter the {config.storeName} staff PIN to begin.</p>
        <div className={styles.miniSteps} aria-label="Today's workflow">
          <span><b>1</b>Name + PIN</span><span><b>2</b>Snap</span><span><b>3</b>Done</span>
        </div>
        <form onSubmit={login} className={styles.loginForm}>
          <label htmlFor="staff-name">Your name</label>
          <input id="staff-name" className={styles.nameInput} name="staffName" type="text" autoComplete="name" placeholder="First name is okay" required minLength={2} maxLength={60} />
          <label htmlFor="staff-pin">Today&apos;s 4-digit PIN</label>
          <input id="staff-pin" name="pin" type="password" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" required minLength={4} maxLength={4} />
          <button className={styles.primaryButton} disabled={busy}>{busy ? "Checking…" : "Start today's mission →"}</button>
        </form>
        <p className={styles.privateNote}>🔒 Staff-only page. Photos stay private until reviewed.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    </main>
  );

  const count = status?.submissions.length || 0;
  const canSubmit = count < 2;
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>{config.storeCode} · {staffName}</p><h1>Today&apos;s mission</h1><p>{status?.dayKey}</p></div>
        <button className={styles.textButton} onClick={() => void signOut()}>Sign out</button>
      </header>

      {message && <div className={styles.success} role="status">✓ {message}</div>}
      {error && <div className={styles.error} role="alert">{error}</div>}

      <section className={styles.progressCard} aria-label="Daily mission progress">
        <div><span>{count >= 1 ? "Required photo complete" : "One quick photo"}</span><strong>{count >= 1 ? "100%" : "25%"}</strong></div>
        <i><b style={{ width: count >= 1 ? "100%" : "25%" }} /></i>
        <small>{count >= 1 ? "Nice work — today's required mission is done." : "Choose a view, snap it and submit."}</small>
      </section>

      <section className={styles.card} aria-labelledby="photo-title">
        <div className={styles.cardHeading}>
          <div className={styles.titleWithIcon}><span aria-hidden="true">📸</span><div><p className={styles.eyebrow}>Photo mission</p><h2 id="photo-title">{status?.requiredComplete ? "Required photo complete" : "Show us the store today"}</h2></div></div>
          <span className={status?.requiredComplete ? styles.doneBadge : styles.todoBadge}>{count} / 1 required</span>
        </div>
        {canSubmit ? <>
          {status?.requiredComplete && <p className={styles.optionalNote}>A second photo is optional.</p>}
          <label className={styles.field} htmlFor="shot-type"><span>Choose a shot type</span><select id="shot-type" value={promptKey} onChange={(event) => setPromptKey(event.target.value)}><option value="">Select one…</option>{status?.availablePrompts.map((prompt) => <option key={prompt.key} value={prompt.key}>{prompt.label}</option>)}</select></label>
          {!preview ? <>
            <input ref={cameraRef} className={styles.hiddenInput} id="daily-camera" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => void choosePhoto(event.target.files?.[0])} />
            <label className={`${styles.primaryButton} ${styles.cameraButton}`} htmlFor="daily-camera">📷 Open camera</label>
            <p className={styles.hint}>💡 <strong>Quick tip:</strong> Stand back, hold steady and avoid customers, IDs, paperwork, licence plates and security screens.</p>
          </> : <div className={styles.previewBlock}><img src={preview} alt="Preview of today's store photo" /><div className={styles.actionRow}><button className={styles.secondaryButton} type="button" onClick={clearPhoto}>Retake</button><button className={styles.primaryButton} type="button" disabled={busy} onClick={() => void submitPhoto()}>{busy ? "Submitting…" : "Submit photo"}</button></div></div>}
        </> : <div className={styles.celebration}><span aria-hidden="true">✓</span><h3>Mission complete!</h3><p>Today&apos;s required and optional photos are in.</p></div>}
      </section>

      {status?.randomCheck && <section className={styles.card} aria-labelledby="check-title"><p className={styles.eyebrow}>Random store check</p><h2 id="check-title">{status.randomCheck.question}</h2>{status.randomCheck.completed ? <p className={styles.completeText}>✓ Check complete</p> : <div className={styles.stack}><button className={styles.primaryButton} disabled={busy} onClick={() => void completeCheckOk()}>Yes — looks good</button><button className={styles.issueButton} disabled={busy} onClick={() => { setIssueForCheck(true); setIssueOpen(true); }}>No — report issue</button></div>}</section>}

      <section className={styles.card} aria-labelledby="issue-title">
        <p className={styles.eyebrow}>See something we should know?</p>
        <h2 id="issue-title">Send a quick note to the office</h2>
        {!issueOpen ? <button className={styles.secondaryButton} onClick={() => { setIssueForCheck(false); setIssueOpen(true); }}>Report an issue</button> : <form className={styles.issueForm} onSubmit={submitIssue}>
          <label className={styles.field}><span>Issue type</span><select name="category" required defaultValue=""><option value="" disabled>Select one…</option>{["Storefront or signage","Hours appear incorrect","Address or phone appears incorrect","Website problem","Menu problem","Google or Maps problem","Entrance, parking or access","Equipment or display","Cleanliness or maintenance","Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className={styles.field}><span>Short note <small>(optional)</small></span><textarea name="note" rows={3} maxLength={500} placeholder="What did you notice?" /></label>
          <label className={styles.field}><span>Photo or screenshot <small>(optional)</small></span><input name="attachment" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <div className={styles.actionRow}><button className={styles.secondaryButton} type="button" onClick={() => { setIssueOpen(false); setIssueForCheck(false); }}>Cancel</button><button className={styles.primaryButton} disabled={busy}>{busy ? "Sending…" : "Send to office"}</button></div>
        </form>}
      </section>
    </main>
  );
}
