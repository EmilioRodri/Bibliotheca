package com.leitura.Biblioteca_api.service;

import com.leitura.Biblioteca_api.model.LivroHistorico;
import com.leitura.Biblioteca_api.model.Nota;
import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.repository.LivroHistoricoRepository;
import com.leitura.Biblioteca_api.repository.NotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricoService {

    private final LivroHistoricoRepository historicoRepository;
    private final NotaRepository notaRepository; 
    private final UsuarioService usuarioService;

    // --- Métodos Básicos (CRUD) ---

    public List<LivroHistorico> listarPorUsuario(String uid) {
        // CORREÇÃO: O nome da variável é 'historicoRepository', não 'repository'
        return historicoRepository.findByUid(uid);
    }

    public List<LivroHistorico> listarTodos() {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        return historicoRepository.findAllByUsuario(usuario);
    }

    public LivroHistorico salvar(LivroHistorico livro) {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        livro.setUsuario(usuario);
        return historicoRepository.save(livro);
    }

    public LivroHistorico atualizar(Long id, LivroHistorico livroAtualizado) {
        LivroHistorico livroExistente = buscarPorId(id);
        
        // Atualiza apenas os campos permitidos
        livroExistente.setTitulo(livroAtualizado.getTitulo());
        livroExistente.setAutor(livroAtualizado.getAutor());
        livroExistente.setGenero(livroAtualizado.getGenero());
        livroExistente.setTotalPaginas(livroAtualizado.getTotalPaginas());
        livroExistente.setDataInicio(livroAtualizado.getDataInicio());
        livroExistente.setDataFim(livroAtualizado.getDataFim());
        livroExistente.setClassificacao(livroAtualizado.getClassificacao());
        livroExistente.setStatus(livroAtualizado.getStatus());
        livroExistente.setUrlCapa(livroAtualizado.getUrlCapa());
        livroExistente.setOpiniao(livroAtualizado.getOpiniao());

        return historicoRepository.save(livroExistente);
    }

    public void deletar(Long id) {
        LivroHistorico livro = buscarPorId(id);
        historicoRepository.delete(livro);
    }

    // --- Métodos Auxiliares ---

    public LivroHistorico buscarPorId(Long id) {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        // Garante que o usuário só acesse seus próprios livros
        return historicoRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new RuntimeException("Livro não encontrado ou não pertence ao usuário."));
    }

    // --- Funcionalidade de Notas ---

    @Transactional
    public Nota adicionarNota(Long idLivro, Nota nota) {
        LivroHistorico livro = buscarPorId(idLivro);
        
        // Vincula a nota ao livro
        nota.setLivroHistorico(livro);
        
        // Salva a nota
        return notaRepository.save(nota);
    }
}