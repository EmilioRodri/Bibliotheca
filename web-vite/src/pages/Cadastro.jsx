import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Importação da autenticação e funções do Firebase
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validação básica de senha
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // 2. Cria o usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 3. Atualiza o nome do usuário no perfil do Firebase
      await updateProfile(user, { displayName: nome });

      // 4. CRUCIAL: Pega o Token JWT imediatamente
      const token = await user.getIdToken();

      // 5. CRUCIAL: Salva o token para o Backend Java aceitar as requisições
      localStorage.setItem('token', token);
      
      console.log("Cadastro realizado e Token salvo!");

      // 6. Redireciona para a Home (já logado)
      navigate('/home');

    } catch (err) {
      console.error("Erro no cadastro:", err);
      
      // Tratamento de erros comuns do Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca.');
      } else if (err.code === 'auth/invalid-email') {
        setError('O e-mail digitado é inválido.');
      } else {
        setError('Erro ao criar conta: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS ATUALIZADOS (Padrão Home/Login) ---
  const labelStyle = "block text-xs font-bold text-muted-silver uppercase tracking-wider mb-1";
  const inputStyle = "flex h-10 w-full rounded-lg border border-muted-silver/20 bg-rich-charcoal/50 px-3 py-2 text-sm text-antique-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-burnished-gold focus:border-burnished-gold transition-all";
  const buttonStyle = "w-full bg-burnished-gold hover:bg-white hover:text-rich-charcoal text-rich-charcoal font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-burnished-gold/20 transform transition-all hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    // Fundo rich-charcoal
    <div className="min-h-screen w-full bg-rich-charcoal flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      
      {/* Background Decorativo Sutil */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1507842217153-e52879d2b466?q=80&w=1920')] bg-cover bg-center mix-blend-overlay pointer-events-none"></div>

      {/* Card surface */}
      <div className="relative z-10 w-full max-w-md bg-surface border border-muted-silver/10 p-8 md:p-10 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Efeito de brilho sutil no topo do card (igual ao Login) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-burnished-gold/50 to-transparent opacity-50"></div>

        <header className="text-center mb-8">
          <h1 className="text-3xl text-burnished-gold font-serif-display mb-2">
            Junte-se à Bibliotheca
          </h1>
          <p className="text-muted-silver text-sm font-light">
            Comece a catalogar sua jornada literária.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-5">
          <div>
            <label className={labelStyle}>Seu Nome</label>
            <input 
              type="text" 
              placeholder="Como quer ser chamado?" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputStyle}
            />
          </div>
          
          <div>
            <label className={labelStyle}>Senha</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Confirmar Senha</label>
            <input 
              type="password" 
              placeholder="Repita a senha" 
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div className="pt-2">
            <button type="submit" className={buttonStyle} disabled={loading}>
              {loading ? (
                 <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-rich-charcoal border-t-transparent rounded-full animate-spin"></div>
                    Criando conta...
                 </span>
              ) : 'Criar Conta'}
            </button>
          </div>
        </form>

        <footer className="mt-8 text-center border-t border-muted-silver/10 pt-6">
          <p className="text-muted-silver text-sm">
            Já possui um registro?{' '}
            <Link to="/login" className="text-burnished-gold hover:text-white transition-colors underline decoration-burnished-gold/30 underline-offset-4">
              Entrar agora
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}