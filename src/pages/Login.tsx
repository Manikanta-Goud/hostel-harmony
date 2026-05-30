import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, CheckCircle, Shield, Zap, ArrowLeft, KeyRound
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';

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

  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


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

  // ── SIGNUP ──
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await signup(name, email, password);
    if (result.success) {
      toast({ title: '🎉 Account created!', description: 'Welcome to HostelHub!' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Signup failed', description: result.error, variant: 'destructive' });
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
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
  };


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

            {/* ══ SIGNUP ══ */}
            {mode === 'signup' && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                  <p className="text-gray-400 text-sm">Start managing your hostel today</p>
                </div>
                <div className="flex bg-white/[0.05] rounded-lg p-1 mb-6">
                  <button onClick={() => resetForm('login')} className="flex-1 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white transition-all">Sign In</button>
                  <button onClick={() => resetForm('signup')} className="flex-1 py-2 text-sm font-medium rounded-md bg-orange-500 text-white">Sign Up</button>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input id="signup-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
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
                      <input id="signup-confirm-password" type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
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
                  <button id="signup-submit" type="submit" disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 mt-2">
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
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
