"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError("PIN must contain digits only.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create the admin user via seed-style insert
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Setup failed.");
        return;
      }

      // Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });

      if (loginRes.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
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
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            boxShadow:
              "0 4px 6px rgba(15,23,42,0.04), 0 20px 60px rgba(15,23,42,0.08)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          {/* Header */}
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
              First-time Setup
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            <p
              className="text-xs text-center"
              style={{
                color: "#64748B",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}
            >
              Create your admin account to get started.
            </p>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                style={{
                  color: "#64748B",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chandan"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15,23,42,0.1)",
                  color: "#0F172A",
                  fontFamily: "var(--font-dm-sans), sans-serif",
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
                Create PIN (4–12 digits)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter a PIN"
                inputMode="numeric"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15,23,42,0.1)",
                  color: "#0F172A",
                  fontFamily: "var(--font-dm-sans), sans-serif",
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
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Repeat PIN"
                inputMode="numeric"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(15,23,42,0.1)",
                  color: "#0F172A",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                }}
              />
            </div>

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
                  <UserPlus size={15} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
