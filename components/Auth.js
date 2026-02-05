
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService.js';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const email = emailInput.trim();

    if (!email.includes('@') || !email.includes('.')) {
      setMessage({ type: 'error', text: 'Por favor, insira um formato de e-mail válido.' });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setMessage({ type: 'success', text: `Bem-vindo! Login efetuado com sucesso.` });
        } else {
          setMessage({ type: 'success', text: `Conta criada! Por favor, faça login.` });
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro na autenticação' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-xl p-12 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Oral-Gen</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{isSignUp ? 'Nova Conta' : 'Portal de Acesso'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <input 
            type="email" required placeholder="E-mail" 
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold"
            value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required placeholder="Senha"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold pr-14"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          {message && <div className={`p-4 rounded-2xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{message.text}</div>}
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-xs">{loading ? 'Conectando...' : isSignUp ? 'Criar Cadastro' : 'Entrar'}</button>
        </form>
        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            {isSignUp ? 'Já tenho conta' : 'Criar nova conta'}
          </button>
        </div>
      </div>
    </div>
  );
};
