import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; 
import Logo from '../components/Logo';
import { Feather } from 'lucide-react';

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
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      
      console.log("Acesso concedido. Chave mestra registrada.");
      navigate('/home'); 

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Credenciais inválidas. Os arquivos permanecem selados.');
      } else if (err.code === 'auth/too-many-requests') {
         setError('Muitas tentativas ao portão. Aguarde antes de tentar novamente.');
      } else {
         setError('Ocorreu uma falha no selo de segurança. Verifique a conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS DE FORMULÁRIO EDITORIAIS (Ficha de Biblioteca)
  const inputStyle = "w-full bg-transparent border-b border-dark-gold/30 px-2 py-3 text-antique-white placeholder:text-muted-silver/30 focus:outline-none focus:border-burnished-gold transition-colors font-sans-modern text-sm";
  const labelStyle = "block text-[10px] font-bold text-muted-silver uppercase tracking-[0.2em]";

  return (
    <div className="min-h-screen w-full bg-transparent flex animate-fade-in relative z-10 selection:bg-burnished-gold selection:text-rich-charcoal">
      
      {/* LADO ESQUERDO: A Imersão Literária (Escondido em telas pequenas) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center border-r border-dark-gold/10 overflow-hidden">
        {/* Fundo de imagem escura (uma biblioteca antiga ou textura de nanquim) */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity filter grayscale"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')" }}
        ></div>
        {/* Gradiente para fundir com a textura de ruído global */}
        <div className="absolute inset-0 bg-gradient-to-t from-rich-charcoal via-rich-charcoal/80 to-transparent"></div>
        
        <div className="relative z-10 p-16 max-w-2xl">
            <Feather size={48} className="text-burnished-gold/50 mb-8" />
            <blockquote className="font-serif-display text-4xl text-antique-white leading-tight mb-6">
                "O mistério da existência humana não consiste apenas em permanecer vivo, mas em encontrar algo pelo qual viver."
            </blockquote>
            <p className="text-burnished-gold font-sans-modern uppercase tracking-[0.3em] text-sm font-bold">
                — Fiódor Dostoiévski
            </p>
        </div>
      </div>

      {/* LADO DIREITO: O Formulário de Acesso */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-16">
             {/* A NOVA LOGO COMO PORTA DE ENTRADA */}
             <div className="flex justify-center mb-8">
                 <Logo className="text-4xl sm:text-5xl" showSubtitle={true} />
             </div>
             <p className="text-muted-silver font-sans-modern font-light text-sm">Apresente suas credenciais para acessar os arquivos.</p>
          </div>
          
          {error && (
            <div className="bg-red-900/10 border-l-2 border-red-900/50 text-red-400/80 p-4 mb-8 text-sm font-sans-modern flex items-start gap-3">
              <span className="text-lg leading-none">♦</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="group">
              <label className={labelStyle}>Identificação (E-mail)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                placeholder="nome@dominio.com"
                required
              />
            </div>
            
            <div className="group">
              <label className={labelStyle}>Chave de Acesso (Senha)</label>
              <input 
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={inputStyle}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-burnished-gold text-rich-charcoal font-sans-modern uppercase tracking-widest font-bold py-4 px-4 rounded-sm hover:bg-antique-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(194,168,120,0.15)]"
              >
                {loading ? (
                   <span className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-rich-charcoal/30 border-t-rich-charcoal rounded-full animate-spin"></div>
                      Destrancando Arquivos...
                   </span>
                ) : 'Acessar Bibliotheca'}
              </button>
            </div>
          </form>
          
          <div className="mt-16 text-center border-t border-dark-gold/10 pt-8">
              <p className="text-muted-silver text-xs font-sans-modern uppercase tracking-widest">
                  Novo no Panteão? <Link to="/cadastro" className="text-burnished-gold hover:text-antique-white transition-colors ml-2 font-bold">Solicitar Registro</Link>
              </p>
          </div>

        </div>
      </div>
    </div>
  );
}