package com.leitura.Biblioteca_api.service;

import com.leitura.Biblioteca_api.model.LivroDesejado;
import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.repository.LivroDesejadoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WishlistService {

    private final LivroDesejadoRepository repository;
    private final UsuarioService usuarioService;

    public WishlistService(LivroDesejadoRepository repository, UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    public List<LivroDesejado> buscarTodos() {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        return repository.findByUsuario(usuario);
    }

    public LivroDesejado adicionar(LivroDesejado livroDesejado) {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        livroDesejado.setUsuario(usuario);
        return repository.save(livroDesejado);
    }

    public void deletar(Long id) {
        Usuario usuario = usuarioService.getAuthenticatedUser();
        LivroDesejado livro = repository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new AccessDeniedException("Permissão negada: este livro não está na sua lista"));
        repository.delete(livro);
    }
}