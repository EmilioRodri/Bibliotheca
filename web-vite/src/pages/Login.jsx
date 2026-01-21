import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
// Certifique-se que este caminho está correto (firebaseConfig ou firebase)
import { auth } from '../firebaseConfig'; 

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Faz o login no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. CRUCIAL: Pega o Token JWT do usuário
      const token = await user.getIdToken();

      // 3. CRUCIAL: Salva o token no navegador para usar nas requisições ao Java
      localStorage.setItem('token', token);
      
      console.log("Login realizado! Token salvo:", token.substring(0, 10) + "...");

      // 4. Redireciona para a Home
      navigate('/home'); 

    } catch (err) {
      console.error(err);
      // Tratamento de erros amigável
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/too-many-requests') {
         setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
         setError('Erro ao entrar. Verifique o console.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS ATUALIZADOS (Padrão Home/Histórico) ---
  const inputStyle = "flex h-10 w-full rounded-lg border border-muted-silver/20 bg-rich-charcoal/50 px-3 py-2 text-sm text-antique-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-burnished-gold focus:border-burnished-gold transition-all";
  
  // Rótulos em uppercase e dourado/prata
  const labelStyle = "block text-xs font-bold text-muted-silver uppercase tracking-wider mb-1";
  
  // Botão dourado com texto escuro
  const buttonStyle = "w-full bg-burnished-gold hover:bg-white hover:text-rich-charcoal text-rich-charcoal font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-burnished-gold/20 transform transition-all hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    // Fundo rich-charcoal
    <div className="min-h-screen w-full bg-rich-charcoal flex items-center justify-center p-4 animate-fade-in">
      
      {/* Card surface com borda sutil */}
      <div className="w-full max-w-md bg-surface p-8 rounded-xl border border-muted-silver/10 shadow-2xl relative overflow-hidden">
        
        {/* Efeito de brilho sutil no fundo do card */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-burnished-gold/50 to-transparent opacity-50"></div>

        <h1 className="text-3xl text-burnished-gold font-serif-display mb-2 text-center">Bibliotheca</h1>
        <p className="text-muted-silver text-center mb-8 font-light text-sm">Acesse sua coleção pessoal</p>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 mb-6 rounded-lg text-center text-sm flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={labelStyle}>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className={labelStyle}>Senha</label>
            <input 
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputStyle}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button type="submit" className={buttonStyle} disabled={loading}>
              {loading ? (
                 <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-rich-charcoal border-t-transparent rounded-full animate-spin"></div>
                    Acessando...
                 </span>
              ) : 'Entrar na Biblioteca'}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-muted-silver text-sm">
            Não tem conta? <Link to="/cadastro" className="text-burnished-gold hover:text-white transition-colors underline decoration-burnished-gold/30 underline-offset-4">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}