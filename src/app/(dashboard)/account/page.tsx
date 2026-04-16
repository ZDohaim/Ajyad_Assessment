"use client";

import { useEffect, useState } from "react";
import { AccountPageSkeleton } from "@/components/ui/page-skeletons";

export default function AccountPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => {
        setDisplayName(d.display_name ?? "");
        setEmail(d.email ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Failed to update. Please try again.");
    }
    setSaving(false);
  }

  if (loading) {
    return <AccountPageSkeleton />;
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Account</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Manage your profile</p>
      </div>

      <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--text-tertiary)",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              placeholder="Your name"
            />
          </div>

          {success && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(13,148,136,0.08)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.2)" }}>
              Name updated successfully
            </div>
          )}

          {error && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
