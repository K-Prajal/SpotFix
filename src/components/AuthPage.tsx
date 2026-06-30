import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError
} from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  ShieldAlert,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { setCurrentUser, setActiveTab } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const syncOrCreateUserProfile = async (uid: string, userEmail: string, displayName: string) => {
    const userRef = doc(db, 'users', uid);
    
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const profile = userSnap.data();
        setCurrentUser(profile as any);
      } else {
        // Create new profile with default gamification variables
        const newProfile = {
          userId: uid,
          name: displayName || userEmail.split('@')[0],
          email: userEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          role: 'citizen',
          reputationScore: 0,
          xp: 100,
          rank: 'Bronze',
          badges: ['first_report'],
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setCurrentUser(newProfile as any);
      }
    } catch (err) {
      console.warn('Error reading/creating profile, creating memory profile.', err);
      // Create memory fallback profile to prevent breaking
      setCurrentUser({
        userId: uid,
        name: displayName || userEmail.split('@')[0],
        email: userEmail,
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=120',
        role: 'citizen',
        reputationScore: 50,
        xp: 350,
        rank: 'Bronze',
        badges: ['first_report'],
        createdAt: new Date().toISOString()
      });
    }
  };

  // Google Sign In
  const handleGoogleLogin = async () => {
    setLoading(true);
    clearMessages();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncOrCreateUserProfile(
          result.user.uid,
          result.user.email || '',
          result.user.displayName || ''
        );
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) throw new Error('Please enter your email.');
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset link sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isRegister) {
        if (!email || !password || !name) throw new Error('Please fill in all fields.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        await syncOrCreateUserProfile(credentials.user.uid, email, name);
        setSuccess('Registration completed successfully!');
        setActiveTab('dashboard');
      } else {
        if (!email || !password) throw new Error('Please enter email and password.');
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        await syncOrCreateUserProfile(credentials.user.uid, email, '');
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      console.error(err);
      let clientMsg = err.message;
      if (err.code === 'auth/user-not-found') clientMsg = 'No account associated with this email.';
      if (err.code === 'auth/wrong-password') clientMsg = 'Incorrect password. Try again.';
      if (err.code === 'auth/email-already-in-use') clientMsg = 'Email is already registered.';
      setError(clientMsg || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Auth Light Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-100 p-8 sm:p-10 relative overflow-hidden">
          {/* Logo element */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 shadow-md shadow-blue-100 mb-3">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isForgotPassword ? 'Reset Password' : isRegister ? 'Join Indore SpotFix' : 'Citizen Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-semibold">
              {isForgotPassword
                ? 'Enter email to receive security link'
                : isRegister
                ? "Empower your neighborhood in India's cleanest city"
                : 'Access your rewards dashboard'}
            </p>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="flex gap-2.5 items-start p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-2.5 items-start p-3.5 mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && !isForgotPassword && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-bold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono text-slate-400 uppercase font-bold">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      clearMessages();
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-150 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {isForgotPassword ? 'Send Reset Link' : isRegister ? 'Complete Signup' : 'Authenticate'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          {!isForgotPassword && (
            <>
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-slate-100 w-full"></div>
                <span className="absolute bg-white px-3 text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Or Secure login
                </span>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm"
              >
                {/* Embedded custom Google SVG vector icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Toggle Register / Login */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  clearMessages();
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Return to Login
              </button>
            ) : (
              <p className="text-xs text-slate-400 font-semibold">
                {isRegister ? 'Already have an account?' : 'New to SpotFix?'}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    clearMessages();
                  }}
                  className="ml-1.5 text-blue-600 hover:text-blue-700 font-bold"
                >
                  {isRegister ? 'Login Here' : 'Create Account'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
