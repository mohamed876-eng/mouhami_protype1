"use client";

// Carte d'authentification — nouveau design #F4F0E8.
// Seul le visuel change : les champs, validations et appels API sont
// strictement identiques à l'ancienne carte (logique métier intacte).

import { useEffect, useRef, useState } from "react";

export type AuthFormMode = "login" | "register";

interface AuthCardProps {
  mode: AuthFormMode;
  /** true → la carte devient interactive + focus sur le premier champ. */
  revealed: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  onToggleMode: () => void;
}

const inputCls =
  "w-full rounded-xl bg-white/70 px-4 py-3 text-sm text-[#073B82] " +
  "placeholder:text-[#073B82]/40 shadow-[inset_0_1px_2px_rgba(7,59,130,0.06)] " +
  "border border-[#073B82]/10 focus:bg-white focus:border-transparent " +
  "focus:ring-2 focus:ring-[#F9B000]/60 outline-none transition-all duration-300";

const labelCls = "mb-1.5 block text-xs font-semibold text-[#073B82]/75";

export function AuthCard({
  mode,
  revealed,
  login,
  register,
  onToggleMode,
}: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(() => firstInputRef.current?.focus(), 350);
    return () => window.clearTimeout(id);
  }, [revealed]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.message || "حدث خطأ");
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    setLoading(true);
    const result = await register({
      email,
      password,
      nom,
      prenom,
      telephone: telephone || undefined,
    });
    if (!result.success) setError(result.message || "حدث خطأ");
    setLoading(false);
  }

  return (
    <div
      dir="rtl"
      className="w-full rounded-[28px] bg-[#F4F0E8] p-5 sm:p-8 md:p-10 text-right shadow-[0_30px_80px_-24px_rgba(7,59,130,0.35)]"
    >
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold tracking-tight text-[#073B82]">
            مُحامي
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#F9B000]" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#073B82]">
          {mode === "login" ? "مرحبًا بعودتك" : "أنشئ حسابك الجديد"}
        </h2>
        <p className="mt-2 text-sm text-[#073B82]/60">
          {mode === "login"
            ? "سجّل الدخول للوصول إلى مساحة العمل الخاصة بك"
            : "انضمّ إلى منصة محامي وابدأ في إدارة ملفاتك"}
        </p>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-5">
        {/* Champs inscription */}
        {mode === "register" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>الاسم الشخصي</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="أحمد"
                />
              </div>
              <div>
                <label className={labelCls}>اسم العائلة</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="العلوي"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>الهاتف</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className={inputCls}
                placeholder="0612345678"
              />
            </div>
          </>
        )}

        {/* Email */}
        <div>
          <label className={labelCls}>البريد الإلكتروني</label>
          <input
            ref={mode === "login" ? firstInputRef : undefined}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
            placeholder="email@exemple.com"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className={labelCls}>كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`${inputCls} pl-12`}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#073B82]/50 transition-colors hover:text-[#073B82]"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation (inscription) */}
        {mode === "register" && (
          <div>
            <label className={labelCls}>تأكيد كلمة المرور</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={inputCls}
              placeholder="********"
            />
          </div>
        )}

        {/* Se souvenir (connexion) */}
        {mode === "login" && (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-[#073B82]"
              />
              <span className="text-sm text-[#073B82]/70">تذكرني</span>
            </label>
            <span className="text-sm text-[#073B82]/40">نسيت كلمة المرور؟</span>
          </div>
        )}

        {/* Bouton principal */}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border border-[#F9B000]/40 bg-gradient-to-l from-[#073B82] to-[#0F3D91] py-3.5 text-base font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_14px_34px_-10px_rgba(7,59,130,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "جاري المعالجة..."
            : mode === "login"
              ? "تسجيل الدخول"
              : "إنشاء الحساب"}
        </button>
      </form>

      {/* Séparateur */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#073B82]/10" />
        <span className="text-sm text-[#073B82]/45">أو</span>
        <span className="h-px flex-1 bg-[#073B82]/10" />
      </div>

      {/* Basculer le mode */}
      <div className="text-center text-sm">
        <button
          onClick={onToggleMode}
          className="cursor-pointer font-medium text-[#073B82] transition-colors hover:text-[#0F3D91]"
        >
          {mode === "login"
            ? "ليس لديك حساب؟ إنشاء حساب"
            : "لدي حساب — تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}