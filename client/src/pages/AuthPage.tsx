import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useCaptcha() {
  const [image, setImage] = useState("");
  const refresh = useCallback(async () => {
    const response = await fetch(`/api/captcha?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load CAPTCHA");
    const data = await response.json() as { image?: string };
    if (!data.image) throw new Error("Unable to load CAPTCHA");
    setImage(data.image);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { image, refresh };
}

/* ── Shared components ──────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-white/80 mb-1.5">{children}</label>;
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement> & { "data-testid"?: string }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#171717] border border-[#3a3a3a] rounded-xl text-sm text-white px-3 py-3 outline-none focus:border-[#ff2939] transition-colors placeholder:text-white/35 ${props.className ?? ""}`}
    />
  );
}

function PasswordInput({ value, onChange, placeholder, disabled, testId }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; testId?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <FieldInput
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "password"}
        disabled={disabled}
        autoComplete="current-password"
        data-testid={testId}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function BlueButton({ children, disabled, type = "submit", onClick, className = "" }: {
  children: React.ReactNode; disabled?: boolean; type?: "submit" | "button"; onClick?: () => void; className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
       className={`w-full border border-[#ff5a66] bg-[#ff2939] hover:bg-[#e51f30] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Login form ─────────────────────────────────────────────── */
function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const { image: captchaImage, refresh: refreshCaptcha } = useCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    try {
      await login({ email: email.trim().toLowerCase(), password, captcha: captchaInput });
    } catch {
      await refreshCaptcha();
      setCaptchaInput("");
    }
  };

  return (
    <>
       <div className="mb-7 text-center">
         <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#ff5a66] bg-[#2a1114] text-sm font-extrabold text-[#ff6973]">T</div>
         <p className="text-sm font-bold tracking-tight text-white">TurtleCC</p>
         <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Login to your account</h1>
       </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <FieldInput type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="emai@service.com" disabled={isLoggingIn} autoComplete="email" data-testid="input-email" />
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <PasswordInput value={password} onChange={setPassword} disabled={isLoggingIn} testId="input-password" />
        </div>

        {/* Captcha */}
         <div className="bg-[#171717] border border-[#3a3a3a] rounded-xl overflow-hidden flex items-center px-3 py-2 gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
                 <div className="rounded-lg overflow-hidden border border-[#3a3a3a]">
                {captchaImage ? (
                  <img src={captchaImage} alt="CAPTCHA challenge" width={120} height={44} className="block" />
                ) : (
                  <div className="w-[120px] h-[44px] bg-[#f8f8f6]" aria-label="Loading CAPTCHA" />
                )}
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                placeholder="Enter code"
                disabled={isLoggingIn}
                autoComplete="off"
                 className="flex-1 text-sm text-white bg-transparent outline-none placeholder:text-white/35 tracking-widest"
                data-testid="input-captcha"
              />
            </div>
          </div>
          <button type="button" onClick={() => { void refreshCaptcha(); setCaptchaInput(""); }}
             className="text-white/40 hover:text-white transition-colors flex-shrink-0" data-testid="btn-refresh-captcha">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <BlueButton disabled={isLoggingIn || !email.trim() || !password || !captchaInput.trim() || !captchaImage} data-testid="btn-login">
          {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </BlueButton>
      </form>

      <div className="mt-5 text-center space-y-1">
        <p className="text-sm text-white/60">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-primary hover:underline font-medium">create one</button>
          {" "}now
        </p>
      </div>
    </>
  );
}

/* ── Register form ──────────────────────────────────────────── */
function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "Password too short", description: "At least 6 characters", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Registration failed", description: err.message || "Try again", variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      toast({ title: "Registration failed", description: "Try again", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <>
         <div className="mb-7 text-center">
           <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#ff5a66] bg-[#2a1114] text-sm font-extrabold text-[#ff6973]">T</div>
           <p className="text-sm font-bold tracking-tight text-white">TurtleCC</p>
           <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Create your account</h1>
         </div>
        <div className="text-center space-y-4 py-4">
          <div className="text-4xl">✓</div>
          <p className="text-sm font-bold text-white">Account created!</p>
          <p className="text-sm text-white/50 leading-relaxed">Sign in with your email and password.</p>
          <BlueButton type="button" onClick={onSwitchToLogin} data-testid="btn-go-login">Sign In</BlueButton>
        </div>
      </>
    );
  }

  return (
    <>
       <div className="mb-7 text-center">
         <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#ff5a66] bg-[#2a1114] text-sm font-extrabold text-[#ff6973]">T</div>
         <p className="text-sm font-bold tracking-tight text-white">TurtleCC</p>
         <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Create your account</h1>
       </div>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <FieldInput type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="emai@service.com" disabled={submitting} autoComplete="email" data-testid="input-reg-email" />
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <PasswordInput value={password} onChange={setPassword} placeholder="password" disabled={submitting} testId="input-reg-password" />
        </div>
        <div>
          <FieldLabel>Confirm Password</FieldLabel>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="repeat password" disabled={submitting} testId="input-reg-confirm" />
        </div>

        <BlueButton disabled={submitting || !email.trim() || !password || !confirm} data-testid="btn-register">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Signup"}
        </BlueButton>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-white/60">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">login</button>
        </p>
      </div>
    </>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function AuthPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  if (user) return <Redirect to="/" />;

  return (
    <div className="pixel-shell min-h-screen flex flex-col bg-[#050505]">
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
       <div className="w-full max-w-[420px] rounded-2xl border border-[#353535] bg-[#151515] p-6 shadow-none sm:p-8">
          {tab === "login"
            ? <LoginForm onSwitchToRegister={() => setTab("register")} />
            : <RegisterForm onSwitchToLogin={() => setTab("login")} />
          }
        </div>
      </div>
    </div>
  );
}
