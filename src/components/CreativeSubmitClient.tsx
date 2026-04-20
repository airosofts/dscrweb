"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const AD_TYPES = [
  { value: "banner", label: "Banner Ad" },
  { value: "popup", label: "Popup Ad" },
];

type Status = "loading" | "invalid" | "ready" | "submitting" | "success";

interface Subscription {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  status: string;
}

export function CreativeSubmitClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const sid = searchParams.get("sid") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [sub, setSub] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adType, setAdType] = useState("banner");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // File state
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [popupFiles, setPopupFiles] = useState<File[]>([]);
  const [logoFiles, setLogoFiles] = useState<File[]>([]);

  // Upload progress
  const [uploading, setUploading] = useState(false);

  const verify = useCallback(async () => {
    if (!token || !sid) {
      setStatus("invalid");
      return;
    }

    try {
      const res = await fetch(`/api/creative/verify?token=${encodeURIComponent(token)}&sid=${encodeURIComponent(sid)}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setStatus("invalid");
        return;
      }

      setSub(data.subscription);
      setCompanyName(data.subscription.company_name || "");
      setContactName(data.subscription.contact_name || "");
      setEmail(data.subscription.email || "");
      setPhone(data.subscription.phone || "");
      setStatus("ready");
    } catch {
      setStatus("invalid");
    }
  }, [token, sid]);

  useEffect(() => {
    verify();
  }, [verify]);

  async function uploadFiles(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const formData = new FormData();
    formData.append("subscription_id", sid);
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/creative/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    setUploading(true);

    try {
      // Upload all files
      const [bannerUrls, popupUrls, logoUrls] = await Promise.all([
        uploadFiles(bannerFiles),
        uploadFiles(popupFiles),
        uploadFiles(logoFiles),
      ]);

      setUploading(false);

      // Submit creative
      const res = await fetch("/api/creative/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: sid,
          token,
          company_name: companyName,
          contact_name: contactName,
          email,
          phone,
          ad_type: adType,
          description,
          notes,
          banner_images: bannerUrls,
          popup_images: popupUrls,
          logo_files: logoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setStatus("success");
    } catch (err) {
      setUploading(false);
      setStatus("ready");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  // ── LOADING ──
  if (status === "loading") {
    return (
      <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Verifying your link...
        </div>
      </div>
    );
  }

  // ── INVALID ──
  if (status === "invalid") {
    return (
      <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8">
        <div className="mb-2 flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brass">
          <span className="h-px w-7 bg-brass" aria-hidden />
          Invalid Link
        </div>
        <h3 className="mb-3 text-[24px] font-extrabold tracking-[-0.01em] text-ink">
          Invalid or expired link
        </h3>
        <p className="max-w-[440px] text-[15px] leading-[1.65] text-slate">
          This creative submission link is invalid, expired, or has already been used. If you
          believe this is an error, please contact us at{" "}
          <a href="mailto:hamza@airosofts.com" className="text-brass underline">
            hamza@airosofts.com
          </a>
          .
        </p>
      </div>
    );
  }

  // ── SUCCESS ──
  if (status === "success") {
    return (
      <div className="border border-rule border-l-[4px] border-l-brass bg-card p-8">
        <div className="mb-2 flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brass">
          <span className="h-px w-7 bg-brass" aria-hidden />
          Submitted
        </div>
        <h3 className="mb-3 text-[24px] font-extrabold tracking-[-0.01em] text-ink">
          Creative submitted successfully.
        </h3>
        <p className="mb-5 max-w-[440px] text-[15px] leading-[1.65] text-slate">
          Creative submitted. We&rsquo;ll review and get back to you within 1-2 business days.
          You&rsquo;ll receive an email once your ad is approved and goes live.
        </p>
        <div className="flex items-center gap-2 border border-rule bg-card-alt px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
          Next step: wait for approval email
        </div>
      </div>
    );
  }

  // ── FORM ──
  const submitting = status === "submitting";

  return (
    <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8 max-[600px]:p-5">
      {sub?.status === "creative_submitted" && (
        <div className="mb-6 border border-rule border-l-[3px] border-l-brass bg-card-alt px-4 py-3 text-[13px] text-slate">
          You&rsquo;ve already submitted creative. Submitting again will update your submission.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* SECTION — Company */}
        <Section title="Company & Contact">
          <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
            <Field label="Company Name" required>
              <input
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={submitting}
                placeholder="Acme Capital"
              />
            </Field>
            <Field label="Contact Name" required>
              <input
                className="input"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={submitting}
                placeholder="Jane Investor"
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                placeholder="jane@acme.com"
              />
            </Field>
            <Field label="Phone">
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                placeholder="(555) 123-4567"
              />
            </Field>
          </div>
        </Section>

        {/* SECTION — Ad Type */}
        <Section title="Ad Details">
          <div className="flex flex-col gap-5">
            <Field label="Ad Type" required>
              <PillGroup
                options={AD_TYPES}
                value={adType}
                onChange={setAdType}
                disabled={submitting}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="input resize-y"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                placeholder="Brief description of your ad campaign and messaging"
              />
            </Field>
          </div>
        </Section>

        {/* SECTION — Files */}
        <Section title="Creative Assets">
          <div className="flex flex-col gap-5">
            <Field label="Banner Images (up to 5)">
              <FileUploadZone
                files={bannerFiles}
                setFiles={setBannerFiles}
                maxFiles={5}
                disabled={submitting}
                id="banner"
              />
            </Field>
            <Field label="Popup Images (up to 5)">
              <FileUploadZone
                files={popupFiles}
                setFiles={setPopupFiles}
                maxFiles={5}
                disabled={submitting}
                id="popup"
              />
            </Field>
            <Field label="Logo Files (up to 3)">
              <FileUploadZone
                files={logoFiles}
                setFiles={setLogoFiles}
                maxFiles={3}
                disabled={submitting}
                id="logo"
              />
            </Field>
          </div>
        </Section>

        {/* SECTION — Notes */}
        <Section title="Additional Notes">
          <Field label="Notes">
            <textarea
              className="input resize-y"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              placeholder="Any additional instructions, brand guidelines, or specifications"
            />
          </Field>
        </Section>

        {error && (
          <div className="border border-red-200 border-l-[3px] border-l-red-500 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-rule pt-6 max-[600px]:flex-col max-[600px]:items-stretch">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            We review creative within 1-2 business days.
          </p>
          <button type="submit" disabled={submitting} className="btn-brass inline-flex">
            {uploading ? "Uploading files..." : submitting ? "Submitting..." : "Submit Creative →"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────── Parts ─────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 flex items-center gap-3 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="h-px w-7 bg-brass" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
        {label}
        {required && <span className="text-brass-pale">•</span>}
      </label>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={
            "border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-60 " +
            (value === o.value
              ? "border-ink bg-ink text-cream"
              : "border-rule bg-card text-slate hover:border-brass hover:text-ink")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FileUploadZone({
  files,
  setFiles,
  maxFiles,
  disabled,
  id,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles: number;
  disabled?: boolean;
  id: string;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, maxFiles);
    setFiles(combined);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    const combined = [...files, ...dropped].slice(0, maxFiles);
    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-rule bg-card-alt px-4 py-6 transition-colors hover:border-brass"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={disabled || files.length >= maxFiles}
          className="absolute inset-0 cursor-pointer opacity-0"
          id={`file-${id}`}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {files.length >= maxFiles
            ? `Maximum ${maxFiles} files reached`
            : "Drop files here or click to browse"}
        </div>
        <div className="mt-1 text-[11px] text-slate">
          PNG, JPEG, WebP, GIF, SVG — max 10 MB each
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 border border-rule bg-card px-3 py-1.5"
            >
              <span className="max-w-[140px] truncate text-[12px] text-ink">{file.name}</span>
              <span className="font-mono text-[9px] text-muted">
                {(file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={disabled}
                className="text-[14px] leading-none text-slate hover:text-ink disabled:opacity-50"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
