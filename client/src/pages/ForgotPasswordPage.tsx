import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      showToast('Reset link sent!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 shadow-2xl">
            <ShieldCheck className="w-8 h-8 text-zinc-100" />
          </div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight mb-2">Reset Password</h1>
          <p className="text-zinc-500 text-sm font-medium">Enter your email and we'll send you a link</p>
        </div>

        {submitted ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-zinc-100 font-bold mb-2">Link Sent!</h3>
            <p className="text-zinc-500 text-sm mb-6">Check your inbox for instructions to reset your password.</p>
            <Link to="/login" className="text-zinc-100 hover:underline font-bold transition-all text-sm uppercase tracking-widest">Return to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-100 text-zinc-950 font-bold py-4 rounded-2xl hover:bg-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6 shadow-xl shadow-zinc-950/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center mt-8 text-sm text-zinc-500 font-medium">
          Remember your password? {' '}
          <Link to="/login" className="text-zinc-100 hover:underline font-bold transition-all">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
