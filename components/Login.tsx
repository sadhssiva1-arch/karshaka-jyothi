
import React, { useState } from 'react';
import { AppData, UserAccount } from '../types';
import { Layers, User, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface LoginProps {
  data: AppData;
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ data, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSumbit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Please verify your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-900 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-800 rounded-full translate-x-1/2 translate-y-1/2 opacity-20 blur-[100px]" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex bg-gradient-to-tr from-emerald-600 to-teal-500 p-4 rounded-3xl shadow-2xl mb-6 ring-8 ring-white/5">
            <Layers className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SmartTrade</h1>
          <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Professional Consignment Management
          </p>
        </div>

        <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-white/20">
          <form onSubmit={handleSumbit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 w-5 h-5" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-emerald-50 bg-emerald-50/30 text-emerald-950 font-bold focus:ring-4 focus:ring-emerald-100 border transition-all placeholder:text-emerald-200/50"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 w-5 h-5" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border-emerald-50 bg-emerald-50/30 text-emerald-950 font-bold focus:ring-4 focus:ring-emerald-100 border transition-all placeholder:text-emerald-200/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-relaxed border border-rose-100 animate-bounce">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="group w-full bg-emerald-600 hover:bg-emerald-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              Access Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
