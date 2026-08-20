import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "login" | "register";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ to: "/dashboard" });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        return;
      }
      if (password.length < 8) throw new Error("گذرواژه باید حداقل ۸ کاراکتر باشد.");
      if (!companyName.trim()) throw new Error("نام شرکت را وارد کنید.");
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { full_name: fullName.trim(), company_name: companyName.trim() } },
      });
      if (error) throw error;
      if (data.user) {
        const userId = data.user.id;
        await supabase.from("profiles").upsert({ user_id: userId, full_name: fullName.trim(), company_name: companyName.trim() }, { onConflict: "user_id" });
        if (data.session) {
          const { data: company, error: companyError } = await supabase.from("companies").insert({ owner_id: userId, name: companyName.trim() }).select("id").single();
          if (companyError) throw companyError;
          await supabase.from("company_members").insert({ company_id: company.id, user_id: userId, role: "ceo", accepted_at: new Date().toISOString() });
          await supabase.from("user_roles").insert({ user_id: userId, role: "ceo" });
          navigate({ to: "/dashboard" });
        } else {
          setMessage("حساب ایجاد شد. لطفاً ایمیل خود را تأیید کنید و سپس وارد شوید.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات ناموفق بود.");
    } finally { setBusy(false); }
  }

  async function resetPassword() {
    setError(""); setMessage("");
    if (!email.trim()) { setError("ابتدا ایمیل خود را وارد کنید."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth` });
    if (error) setError(error.message); else setMessage("لینک بازیابی گذرواژه ارسال شد.");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-12 text-foreground">
      <section className="mx-auto max-w-md">
        <Link to="/" className="text-sm font-semibold text-primary">پارسیان‌یار</Link>
        <h1 className="mt-6 text-3xl font-extrabold">{mode === "login" ? "ورود به حساب" : "ایجاد حساب پارسیان‌یار"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">حساب واقعی شما با Supabase مدیریت می‌شود.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border bg-card p-6 shadow-sm">
          {mode === "register" && <>
            <label className="grid gap-2 text-sm">نام و نام خانوادگی<input className="h-11 rounded-lg border px-3" value={fullName} onChange={e => setFullName(e.target.value)} /></label>
            <label className="grid gap-2 text-sm">نام شرکت<input className="h-11 rounded-lg border px-3" value={companyName} onChange={e => setCompanyName(e.target.value)} /></label>
          </>}
          <label className="grid gap-2 text-sm">ایمیل<input className="h-11 rounded-lg border px-3" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="grid gap-2 text-sm">گذرواژه<input className="h-11 rounded-lg border px-3" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div>}
          {message && <div className="rounded-lg border p-3 text-sm">{message}</div>}
          <button disabled={busy} className="h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">{busy ? "در حال انجام…" : mode === "login" ? "ورود" : "ثبت‌نام و ایجاد شرکت"}</button>
          {mode === "login" && <button type="button" onClick={resetPassword} className="text-sm text-primary">بازیابی گذرواژه</button>}
        </form>
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} className="mt-5 text-sm font-semibold text-primary">
          {mode === "login" ? "حساب ندارید؟ ثبت‌نام کنید" : "حساب دارید؟ وارد شوید"}
        </button>
        <p className="mt-6 text-xs text-muted-foreground">ارزیابی مهمان همچنان بدون ورود در دسترس است.</p>
      </section>
    </main>
  );
}
