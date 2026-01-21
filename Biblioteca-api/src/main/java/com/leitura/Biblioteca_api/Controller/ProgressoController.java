package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.dto.PlanilhaResponse;
import com.leitura.Biblioteca_api.model.ProgressoLeitura;
import com.leitura.Biblioteca_api.service.ProgressoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progresso")
@CrossOrigin(origins = "http://localhost:3000") 
public class ProgressoController {

    @Autowired
    private ProgressoService service;

    // Métodos que faltavam ou estavam com nome errado:
    
    // 1. Criar/Atualizar Progresso (Endpoint principal)
    @PostMapping("/")
    public ResponseEntity<ProgressoLeitura> adicionarOuAtualizar(@RequestBody ProgressoLeitura progresso) {
        ProgressoLeitura novoProgresso = service.criarOuAtualizarProgresso(progresso);
        return ResponseEntity.ok(novoProgresso);
    }
    
    // 2. Deletar Progresso
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id); // Este método precisa ser adicionado no ProgressoService
        return ResponseEntity.noContent().build();
    }
    
    // 3. Gerar Planilha (Calcula o progresso diário)
    // O erro anterior era que ele esperava dois argumentos. Agora é um só: o ID do Livro.
    @GetMapping("/planilha/{livroId}")
    public ResponseEntity<PlanilhaResponse> gerarPlanilha(@PathVariable Long livroId) {
        PlanilhaResponse planilha = service.gerarPlanilha(livroId); 
        return ResponseEntity.ok(planilha);
    }
    
    // 4. Atualizar Apenas a Página Lida
    @PutMapping("/{livroId}/pagina")
    public ResponseEntity<ProgressoLeitura> atualizarProgresso(
        @PathVariable Long livroId,
        @RequestBody ProgressoUpdateDto updateDto) 
    {
        // Este método precisa ser adicionado no ProgressoService
        ProgressoLeitura progresso = service.atualizarPaginasLidas(livroId, updateDto.paginasLidas); 
        return ResponseEntity.ok(progresso);
    }
    
    // DTO local para o corpo da requisição PUT
    public record ProgressoUpdateDto(int paginasLidas) {}
}