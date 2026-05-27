import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import Stars from "../components/Stars";
import {
  FiUser, FiLock, FiEye, FiEyeOff, FiLogIn,
  FiUserPlus, FiCheckCircle, FiShield, FiTrendingUp,
  FiClipboard, FiArrowLeft, FiKey,
} from "react-icons/fi";
import { MdBuild } from "react-icons/md";

/* ── password strength ─────────────────────────────────────────────────────── */
function pwStr(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const SL = ["", "Weak", "Fair", "Good", "Strong"];
const SC = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
const ST = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400"];

/* ── feature cards ─────────────────────────────────────────────────────────── */
const FEATS = [
  { icon: MdBuild,      title: "Service Management", desc: "Record every repair job and track full service history." },
  { icon: FiTrendingUp, title: "Revenue & Reports",  desc: "Generate daily payment reports and service bills instantly." },
  { icon: FiClipboard,  title: "Full CRUD Records",  desc: "Create, update, delete and retrieve service records in real-time." },
  { icon: FiShield,     title: "Secure Access",      desc: "Session-based auth with bcrypt-encrypted passwords." },
];

/* ── reusable eye-toggle button ────────────────────────────────────────────── */
function EyeBtn({ show, toggle }) {
  return (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors">
      {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
    </button>
  );
}

/* ── strength bar ──────────────────────────────────────────────────────────── */
function StrengthBar({ pw }) {
  if (!pw) return null;
  const s = pwStr(pw);
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= s ? SC[s] : "bg-gray-600"}`} />
        ))}
      </div>
      <p className={`text-xs ${ST[s]}`}>{SL[s]}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* active tab: "login" | "register" | "forgot" */
  const [tab, setTab] = useState(searchParams.get("tab") || "login");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && ["login", "register", "forgot"].includes(t)) setTab(t);
  }, [searchParams]);

  /* ── login form ── */
  const [lf,  setLf]  = useState({ username: "", password: "" });
  const [le,  setLe]  = useState({});
  const [ll,  setLl]  = useState(false);
  const [lsp, setLsp] = useState(false);

  /* ── register form ── */
  const [rf,   setRf]   = useState({ username: "", password: "", confirm: "" });
  const [re,   setRe]   = useState({});
  const [rl,   setRl]   = useState(false);
  const [rsp,  setRsp]  = useState(false);
  const [rcsp, setRcsp] = useState(false);
  const [done, setDone] = useState(false);

  /* ── forgot-password form ── */
  const [ff,    setFf]    = useState({ username: "", newPassword: "", confirm: "" });
  const [fe,    setFe]    = useState({});
  const [fl,    setFl]    = useState(false);
  const [fsp,   setFsp]   = useState(false);
  const [fcsp,  setFcsp]  = useState(false);
  const [fdone, setFdone] = useState(false);

  /* ── helpers ── */
  const ic  = (err) =>
    "w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-gray-800 text-gray-200 placeholder-gray-500 text-sm outline-none transition-all " +
    (err ? "border-red-500" : "border-gray-600 focus:border-purple-500");
  const icR = (err) =>
    "w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-gray-800 text-gray-200 placeholder-gray-500 text-sm outline-none transition-all " +
    (err ? "border-red-500" : "border-gray-600 focus:border-purple-500");

  /* ── login ── */
  const vLogin = () => {
    const e = {};
    if (!lf.username.trim()) e.username = "Username is required";
    if (!lf.password)        e.password = "Password is required";
    setLe(e);
    return !Object.keys(e).length;
  };
  const hLogin = async (ev) => {
    ev.preventDefault();
    if (!vLogin()) return;
    setLl(true);
    try {
      await login(lf.username, lf.password);
      toast.success("Welcome back to SmartPark!");
      navigate("/app/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally { setLl(false); }
  };

  /* ── register ── */
  const vReg = () => {
    const e = {};
    if (!rf.username.trim())          e.username = "Required";
    else if (rf.username.length < 3)  e.username = "Min 3 characters";
    if (!rf.password)                 e.password = "Required";
    else if (rf.password.length < 6)  e.password = "Min 6 characters";
    if (!rf.confirm)                  e.confirm  = "Required";
    else if (rf.confirm !== rf.password) e.confirm = "Passwords do not match";
    setRe(e);
    return !Object.keys(e).length;
  };
  const hReg = async (ev) => {
    ev.preventDefault();
    if (!vReg()) return;
    setRl(true);
    try {
      await register(rf.username, rf.password);
      setDone(true);
      toast.success("Account created! You can now sign in.");
      setTimeout(() => {
        setDone(false);
        setLf(x => ({ ...x, username: rf.username }));
        setRf({ username: "", password: "", confirm: "" });
        setTab("login");
      }, 1800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally { setRl(false); }
  };

  /* ── forgot password ── */
  const vForgot = () => {
    const e = {};
    if (!ff.username.trim())              e.username    = "Username is required";
    if (!ff.newPassword)                  e.newPassword = "New password is required";
    else if (ff.newPassword.length < 6)   e.newPassword = "Min 6 characters";
    if (!ff.confirm)                      e.confirm     = "Please confirm your password";
    else if (ff.confirm !== ff.newPassword) e.confirm   = "Passwords do not match";
    setFe(e);
    return !Object.keys(e).length;
  };
  const hForgot = async (ev) => {
    ev.preventDefault();
    if (!vForgot()) return;
    setFl(true);
    try {
      await api.post("/auth/forgot-password", { username: ff.username, newPassword: ff.newPassword });
      setFdone(true);
      toast.success("Password reset! You can now sign in.");
      setTimeout(() => {
        setFdone(false);
        setLf(x => ({ ...x, username: ff.username }));
        setFf({ username: "", newPassword: "", confirm: "" });
        setTab("login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Check your username.");
    } finally { setFl(false); }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen flex bg-gray-950 overflow-hidden">
      <Stars count={100} speed={0.25} />

      {/* ── LEFT PANEL (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 border-r border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <MdBuild size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">SmartPark</h1>
              <p className="text-purple-400 text-xs">Car Repair Management</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
            Manage repairs<br />smarter, faster.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            A complete solution for SmartPark's car repair workshop — from service records to payment tracking and daily reports.
          </p>
        </div>

        <div className="space-y-4">
          {FEATS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-xs">© 2025 SmartPark · Rubavu District, Western Province</p>
      </div>

      {/* ── RIGHT PANEL (forms) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* logo (mobile only) */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <MdBuild size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">SmartPark CRPMS</span>
          </div>

          {/* ════════════════════════════════════════
              TAB: LOGIN
          ════════════════════════════════════════ */}
          {tab === "login" && (
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-1">Sign in</h2>
              <p className="text-gray-400 text-sm mb-7">Welcome back — enter your credentials to continue.</p>

              <form onSubmit={hLogin} className="space-y-5" noValidate>
                {/* username */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Username</label>
                  <div className="relative">
                    <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={lf.username}
                      onChange={e => { setLf(f => ({ ...f, username: e.target.value })); setLe(x => ({ ...x, username: "" })); }}
                      placeholder="Your username"
                      className={ic(le.username)}
                      autoComplete="username"
                    />
                  </div>
                  {le.username && <p className="text-red-400 text-xs mt-1">⚠ {le.username}</p>}
                </div>

                {/* password */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={lsp ? "text" : "password"}
                      value={lf.password}
                      onChange={e => { setLf(f => ({ ...f, password: e.target.value })); setLe(x => ({ ...x, password: "" })); }}
                      placeholder="Your password"
                      className={icR(le.password)}
                      autoComplete="current-password"
                    />
                    <EyeBtn show={lsp} toggle={() => setLsp(v => !v)} />
                  </div>
                  {le.password && <p className="text-red-400 text-xs mt-1">⚠ {le.password}</p>}
                </div>

                {/* forgot password link */}
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => { setTab("forgot"); setLe({}); }}
                    className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={ll}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  {ll ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiLogIn size={16} /> Sign In</>
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                No account?{" "}
                <button onClick={() => { setTab("register"); setLe({}); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB: REGISTER
          ════════════════════════════════════════ */}
          {tab === "register" && (
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              {done ? (
                <div className="text-center py-6">
                  <FiCheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <h3 className="text-white text-lg font-bold mb-1">Account Created!</h3>
                  <p className="text-gray-400 text-sm">Redirecting to sign in…</p>
                </div>
              ) : (
                <>
                  <h2 className="text-white text-2xl font-bold mb-1">Create account</h2>
                  <p className="text-gray-400 text-sm mb-7">Set up your SmartPark manager account.</p>

                  <form onSubmit={hReg} className="space-y-5" noValidate>
                    {/* username */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">Username</label>
                      <div className="relative">
                        <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={rf.username}
                          onChange={e => { setRf(f => ({ ...f, username: e.target.value })); setRe(x => ({ ...x, username: "" })); }}
                          placeholder="Choose a username"
                          className={ic(re.username)}
                          autoComplete="username"
                        />
                      </div>
                      {re.username && <p className="text-red-400 text-xs mt-1">⚠ {re.username}</p>}
                    </div>

                    {/* password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                      <div className="relative">
                        <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={rsp ? "text" : "password"}
                          value={rf.password}
                          onChange={e => { setRf(f => ({ ...f, password: e.target.value })); setRe(x => ({ ...x, password: "" })); }}
                          placeholder="Create a strong password"
                          className={icR(re.password)}
                          autoComplete="new-password"
                        />
                        <EyeBtn show={rsp} toggle={() => setRsp(v => !v)} />
                      </div>
                      {re.password && <p className="text-red-400 text-xs mt-1">⚠ {re.password}</p>}
                      <StrengthBar pw={rf.password} />
                    </div>

                    {/* confirm */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={rcsp ? "text" : "password"}
                          value={rf.confirm}
                          onChange={e => { setRf(f => ({ ...f, confirm: e.target.value })); setRe(x => ({ ...x, confirm: "" })); }}
                          placeholder="Repeat your password"
                          className={icR(re.confirm)}
                          autoComplete="new-password"
                        />
                        <EyeBtn show={rcsp} toggle={() => setRcsp(v => !v)} />
                      </div>
                      {re.confirm && <p className="text-red-400 text-xs mt-1">⚠ {re.confirm}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={rl}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      {rl ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><FiUserPlus size={16} /> Create Account</>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <button onClick={() => { setTab("login"); setRe({}); }} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB: FORGOT PASSWORD
          ════════════════════════════════════════ */}
          {tab === "forgot" && (
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              {fdone ? (
                <div className="text-center py-6">
                  <FiCheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <h3 className="text-white text-lg font-bold mb-1">Password Reset!</h3>
                  <p className="text-gray-400 text-sm">Redirecting to sign in…</p>
                </div>
              ) : (
                <>
                  {/* back button */}
                  <button
                    type="button"
                    onClick={() => { setTab("login"); setFe({}); setFf({ username: "", newPassword: "", confirm: "" }); }}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm mb-6 transition-colors"
                  >
                    <FiArrowLeft size={15} /> Back to Sign In
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center">
                      <FiKey size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold leading-none">Forgot Password</h2>
                      <p className="text-gray-400 text-xs mt-0.5">Reset your account password</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Enter your username and choose a new password. Your account will be updated immediately.
                  </p>

                  <form onSubmit={hForgot} className="space-y-5" noValidate>
                    {/* username */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">Username</label>
                      <div className="relative">
                        <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={ff.username}
                          onChange={e => { setFf(f => ({ ...f, username: e.target.value })); setFe(x => ({ ...x, username: "" })); }}
                          placeholder="Your account username"
                          className={ic(fe.username)}
                          autoComplete="username"
                        />
                      </div>
                      {fe.username && <p className="text-red-400 text-xs mt-1">⚠ {fe.username}</p>}
                    </div>

                    {/* new password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">New Password</label>
                      <div className="relative">
                        <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={fsp ? "text" : "password"}
                          value={ff.newPassword}
                          onChange={e => { setFf(f => ({ ...f, newPassword: e.target.value })); setFe(x => ({ ...x, newPassword: "" })); }}
                          placeholder="Enter new password"
                          className={icR(fe.newPassword)}
                          autoComplete="new-password"
                        />
                        <EyeBtn show={fsp} toggle={() => setFsp(v => !v)} />
                      </div>
                      {fe.newPassword && <p className="text-red-400 text-xs mt-1">⚠ {fe.newPassword}</p>}
                      <StrengthBar pw={ff.newPassword} />
                    </div>

                    {/* confirm new password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={fcsp ? "text" : "password"}
                          value={ff.confirm}
                          onChange={e => { setFf(f => ({ ...f, confirm: e.target.value })); setFe(x => ({ ...x, confirm: "" })); }}
                          placeholder="Repeat new password"
                          className={icR(fe.confirm)}
                          autoComplete="new-password"
                        />
                        <EyeBtn show={fcsp} toggle={() => setFcsp(v => !v)} />
                      </div>
                      {fe.confirm && <p className="text-red-400 text-xs mt-1">⚠ {fe.confirm}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={fl}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      {fl ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><FiKey size={16} /> Reset Password</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
