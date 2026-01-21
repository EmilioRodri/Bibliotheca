import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';

// Firebase
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    urlCapa: '',
    totalPaginas: '',
    classificacao: '',
    opiniao: '',
    status: 'lido',
    isbn: '',
    preco: ''
  });

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const docRef = doc(db, "livros", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (user && data.uid !== user.uid) {
            alert("Sem permissão.");
            navigate('/historico');
            return;
          }
          setFormData({
             ...data,
             status: data.status || 'lido',
             isbn: data.isbn || '',
             preco: data.preco || ''
          });
        } else {
          alert("Livro não encontrado!");
          navigate('/historico');
        }
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLivro();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, "livros", id);
      await updateDoc(docRef, {
        titulo: formData.titulo,
        autor: formData.autor,
        urlCapa: formData.urlCapa,
        totalPaginas: formData.totalPaginas,
        classificacao: formData.classificacao,
        opiniao: formData.opiniao,
        status: formData.status,
        isbn: formData.isbn,
        preco: formData.preco
      });
      
      navigate(`/livro/${id}`); // Volta para a página de detalhes
    } catch (error) {
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-antique-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-rich-charcoal text-antique-white p-6 md:p-12 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-muted-silver/20 pb-6 flex justify-between">
          <h1 className="font-serif-display text-4xl text-burnished-gold">Editar Obra</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
             <img src={formData.urlCapa} alt="Capa" className="w-full rounded-lg shadow-xl" onError={(e) => e.target.style.display = 'none'}/>
          </div>

          <div className="lg:col-span-2 bg-surface/50 p-8 rounded-xl border border-muted-silver/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-burnished-gold/10 p-4 rounded-lg border border-burnished-gold/30">
                <label className="text-burnished-gold text-sm font-bold block mb-2 uppercase">Status Atual</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-rich-charcoal border border-burnished-gold/50 text-white p-3 rounded cursor-pointer">
                  <option value="lendo">📖 Lendo Atualmente</option>
                  <option value="lido">✅ Concluído</option>
                  <option value="quero-ler">🌟 Quero Ler</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Título" name="titulo" value={formData.titulo} onChange={handleChange} />
                <Input label="Autor" name="autor" value={formData.autor} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="URL da Capa" name="urlCapa" value={formData.urlCapa} onChange={handleChange} />
                <Input label="Páginas" name="totalPaginas" type="number" value={formData.totalPaginas} onChange={handleChange} />
              </div>

              {/* NOVOS CAMPOS PARA EDIÇÃO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="ISBN" name="isbn" value={formData.isbn} onChange={handleChange} placeholder="Ex: 978-0000000000" />
                <Input label="Preço (R$)" name="preco" value={formData.preco} onChange={handleChange} placeholder="R$ 45,90" />
              </div>
              
              <div className="flex flex-col gap-2 font-sans-modern">
                <label className="text-muted-silver text-sm font-medium tracking-wide ml-1">Classificação</label>
                <select name="classificacao" value={formData.classificacao} onChange={handleChange} className="w-full bg-surface border border-muted-silver/20 text-antique-white p-3 rounded-md focus:border-burnished-gold">
                  <option value="" disabled>Nota...</option>
                  <option value="5">⭐⭐⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="1">⭐</option>
                </select>
              </div>

              <TextArea label="Resenha" name="opiniao" value={formData.opiniao} onChange={handleChange} />

              <div className="pt-6 flex gap-4 justify-end border-t border-muted-silver/10 mt-6">
                <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}