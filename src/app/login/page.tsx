"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if setup is needed
  useEffect(() => {
    fetch("/api/auth/setup-needed")
      .then((r) => r.json() as Promise<{ needed: boolean }>)
      .then(({ needed }) => {
        if (needed) router.replace("/setup");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !pin.trim()) {
      setError("Please enter your name and PIN.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin: pin.trim() }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#FAFAFA" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            boxShadow:
              "0 4px 6px rgba(15,23,42,0.04), 0 20px 60px rgba(15,23,42,0.08)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          {/* Header strip */}
          <div
            className="px-8 py-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)",
            }}
          >
            <h1
              className="text-4xl font-bold tracking-[0.18em] text-white mb-1"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              NEXUS
            </h1>
            <p
              className="text-[11px] tracking-widest uppercase"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Command Center
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{
                  color: "#64748B",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15,23,42,0.1)",
                  color: "#0F172A",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid #2563EB";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(37,99,235,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(15,23,42,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{
                  color: "#64748B",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  inputMode="numeric"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-11"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(15,23,42,0.1)",
                    color: "#0F172A",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #2563EB";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(37,99,235,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(15,23,42,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#94A3B8" }}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs rounded-lg px-3 py-2"
                style={{
                  color: "#B91C1C",
                  background: "#FEE2E2",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: loading ? "#93C5FD" : "#2563EB",
                color: "#FFFFFF",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[11px] mt-4"
          style={{
            color: "#94A3B8",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          Self-hosted · Secure · Private
        </p>
      </motion.div>
    </div>
  );
}
