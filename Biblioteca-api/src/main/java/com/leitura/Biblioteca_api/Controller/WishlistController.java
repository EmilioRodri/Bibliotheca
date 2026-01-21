package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.model.LivroDesejado;
import com.leitura.Biblioteca_api.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/desejos") // A nossa nova URL base
public class WishlistController {

    private final WishlistService service;

    public WishlistController(WishlistService service) {
        this.service = service;
    }

    // GET /api/desejos -> Busca todos os livros da lista
    @GetMapping
    public List<LivroDesejado> getListaDesejos() {
        return service.buscarTodos();
    }

    // POST /api/desejos -> Adiciona um novo livro à lista
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LivroDesejado adicionarDesejo(@RequestBody LivroDesejado livroDesejado) {
        // Recebe JSON com { "titulo": "...", "autor": "...", "urlCapa": "...", "totalPaginas": ... }
        return service.adicionar(livroDesejado);
    }

    // DELETE /api/desejos/{id} -> Remove um livro da lista
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarDesejo(@PathVariable Long id) {
        service.deletar(id);
    }
}