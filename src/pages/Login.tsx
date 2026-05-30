import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, CheckCircle, Shield, Zap, ArrowLeft, KeyRound
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'otp' | 'setpassword' | 'forgot';

const features = [
  { icon: Shield, text: 'Secure & private — your data stays yours' },
  { icon: Zap, text: 'One account manages one hostel completely' },
  { icon: CheckCircle, text: 'Real-time fee tracking & alerts' },
];

const Login = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── OTP input handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 7) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (pasted.length === 8) {
      setOtp(pasted.split(''));
      setTimeout(() => otpRefs.current[7]?.focus(), 0);
    }
  };

  // ── LOGIN ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast({ title: '👋 Welcome back!', description: 'Redirecting to your dashboard...' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Login failed', description: result.error || 'Invalid email or password.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // ── STEP 1: Send OTP to email ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { name },
      },
    });
    if (!error) {
      toast({ title: '📧 Code sent!', description: `Check your inbox at ${email}` });
      setMode('otp');
    } else {
      toast({ title: 'Failed to send code', description: error.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // ── STEP 2: Verify OTP → move to set password ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 8) {
      toast({ title: 'Enter the 8-digit code', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (!error) {
      toast({ title: '✅ Email verified!', description: 'Now set your password.' });
      setMode('setpassword');
    } else {
      toast({ title: 'Invalid code', description: 'The code is wrong or expired.', variant: 'destructive' });
      setOtp(['', '', '', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  // ── STEP 3: Set password ──
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { name },
    });
    if (!error) {
      toast({ title: '🎉 Account ready!', description: 'Welcome to HostelHub!' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Failed to set password', description: error.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (!error) {
      toast({ title: '📧 Code resent!', description: 'Check your inbox.' });
    } else {
      toast({ title: 'Failed to resend', description: error.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // ── Forgot password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await resetPassword(email);
    if (result.success) setForgotSent(true);
    else toast({ title: 'Failed to send email', description: result.error, variant: 'destructive' });
    setIsLoading(false);
  };

  const resetForm = (newMode: Mode) => {
    setMode(newMode);
    setForgotSent(false);
    setOtp(['', '', '', '', '', '', '', '']);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  // ── Step indicator (signup flow) ──
  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step < current ? 'bg-orange-500 text-white' :
            step === current ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' :
            'bg-white/[0.08] text-gray-500'
          }`}>
            {step < current ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step < current ? 'bg-orange-500' : 'bg-white/[0.08]'}`} />}
        </div>
      ))}
      <span className="text-xs text-gray-500 ml-1">Step {current} of 3</span>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#080f1e]">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">HostelHub</span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs text-orange-300 font-medium">Trusted by hostel owners</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Manage your hostel<br />
            <span className="text-orange-500">smarter, faster.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-md">
            One account. One hostel. Complete control over students, rooms, fees and staff — all in one place.
          </p>
          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/5 pt-6">
          <p className="text-gray-500 text-sm italic">"Finally a tool that makes hostel management actually simple."</p>
          <p className="text-gray-600 text-xs mt-1">— A happy hostel owner</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">HostelHub</span>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-black/40">

            {/* ══ LOGIN ══ */}
            {mode === 'login' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                  <p className="text-gray-400 text-sm">Sign in to manage your hostel</p>
                </div>
                <div className="flex bg-white/[0.05] rounded-lg p-1 mb-6">
                  <button onClick={() => resetForm('login')} className="flex-1 py-2 text-sm font-medium rounded-md bg-orange-500 text-white">Sign In</button>
                  <button onClick={() => resetForm('signup')} className="flex-1 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white transition-all">Sign Up</button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-300">Password</label>
                      <button type="button" onClick={() => resetForm('forgot')} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="login-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button id="login-submit" type="submit" disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 mt-2">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}

            {/* ══ STEP 1: Name + Email ══ */}
            {mode === 'signup' && (
              <>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                  <p className="text-gray-400 text-sm mb-5">Start managing your hostel today</p>
                  <StepIndicator current={1} />
                </div>
                <div className="flex bg-white/[0.05] rounded-lg p-1 mb-6">
                  <button onClick={() => resetForm('login')} className="flex-1 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white transition-all">Sign In</button>
                  <button onClick={() => resetForm('signup')} className="flex-1 py-2 text-sm font-medium rounded-md bg-orange-500 text-white">Sign Up</button>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="signup-name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="signup-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                    </div>
                  </div>
                  <button id="send-otp-submit" type="submit" disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 mt-2">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Verification Code <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}

            {/* ══ STEP 2: OTP Verify ══ */}
            {mode === 'otp' && (
              <>
                <button onClick={() => resetForm('signup')} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Check your email</h2>
                  <p className="text-gray-400 text-sm mb-5">
                    We sent an 8-digit code to <span className="text-white font-medium">{email}</span>
                  </p>
                  <StepIndicator current={2} />
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                      <KeyRound className="w-6 h-6 text-orange-400" />
                    </div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Enter verification code</label>
                    <div className="flex gap-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-full text-center text-xl font-bold bg-white/[0.05] border border-white/[0.15] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all py-3"
                        />
                      ))}
                    </div>
                  </div>
                  <button id="otp-submit" type="submit" disabled={isLoading || otp.join('').length < 8}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Code <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="mt-4 text-center space-y-1">
                  <p className="text-gray-500 text-sm">Didn't receive it?</p>
                  <button onClick={handleResendOtp} disabled={isLoading} className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
                    Resend code
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: Set Password ══ */}
            {mode === 'setpassword' && (
              <>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-white mb-1">Set your password</h2>
                  <p className="text-gray-400 text-sm mb-5">Almost done! Create a secure password for your account.</p>
                  <StepIndicator current={3} />
                </div>
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="set-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="set-confirm-password" type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                        className={`w-full bg-white/[0.05] border text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                          confirmPassword && password !== confirmPassword
                            ? 'border-red-500/50 focus:ring-red-500/30'
                            : 'border-white/[0.1] focus:ring-orange-500/50 focus:border-orange-500/50'
                        }`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                    )}
                  </div>
                  <button id="set-password-submit" type="submit" disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 mt-2">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}

            {/* ══ FORGOT PASSWORD ══ */}
            {mode === 'forgot' && (
              <>
                <button onClick={() => resetForm('login')} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
                {!forgotSent ? (
                  <>
                    <div className="mb-8">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-orange-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
                      <p className="text-gray-400 text-sm">Enter your email and we'll send a reset link.</p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input id="forgot-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                            className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
                        </div>
                      </div>
                      <button id="forgot-submit" type="submit" disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Check your inbox!</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      We've sent a reset link to<br />
                      <span className="text-white font-medium">{email}</span>
                    </p>
                    <button onClick={() => resetForm('login')} className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
                      Back to sign in →
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
          <p className="text-center text-gray-600 text-xs mt-6">
            By using HostelHub you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
