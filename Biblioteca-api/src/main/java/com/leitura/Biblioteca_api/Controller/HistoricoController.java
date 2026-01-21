package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.model.LivroHistorico;
import com.leitura.Biblioteca_api.model.Nota;
import com.leitura.Biblioteca_api.service.HistoricoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historico")
@RequiredArgsConstructor
public class HistoricoController {

    private final HistoricoService historicoService;

    // ALTERAÇÃO AQUI: Aceita ?uid=... na URL
    @GetMapping
    public List<LivroHistorico> listar(@RequestParam(required = false) String uid) {
        if (uid != null && !uid.isEmpty()) {
            // Se veio o UID, filtra por usuário
            return historicoService.listarPorUsuario(uid);
        }
        // Se não veio UID, lista tudo (útil para admin) ou retorna vazio
        return historicoService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<LivroHistorico> adicionarLivro(@RequestBody LivroHistorico livro) {
        // O livro já deve vir com o campo "uid" preenchido pelo Frontend
        return ResponseEntity.ok(historicoService.salvar(livro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarLivro(@PathVariable Long id) {
        historicoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivroHistorico> buscarPorId(@PathVariable Long id) {
        // CORREÇÃO 2: O serviço já retorna o objeto ou erro, não Optional.
        // Removemos o .map() que estava causando erro.
        LivroHistorico livro = historicoService.buscarPorId(id);
        return ResponseEntity.ok(livro);
    }

    @PostMapping("/{id}/notas")
    public ResponseEntity<Nota> adicionarNota(@PathVariable Long id, @RequestBody Nota nota) {
        return ResponseEntity.ok(historicoService.adicionarNota(id, nota));
    }
    
}