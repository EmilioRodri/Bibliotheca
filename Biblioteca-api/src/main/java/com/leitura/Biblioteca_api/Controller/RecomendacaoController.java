package com.leitura.Biblioteca_api.Controller; // Mantive o 'C' maiúsculo para bater com a sua pasta!

import com.leitura.Biblioteca_api.dto.RecomendacaoRequest;
import com.leitura.Biblioteca_api.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RecomendacaoController {

    // 1. Criamos o Logger manualmente (Substitui o @Slf4j)
    private static final Logger log = LoggerFactory.getLogger(RecomendacaoController.class);

    private final GeminiService geminiService;

    // 2. Criamos o Construtor manualmente (Substitui o @RequiredArgsConstructor)
    public RecomendacaoController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping(value = "/recomendar", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> obterRecomendacao(@RequestBody RecomendacaoRequest request) throws Exception {
        
        log.info("Processando pedido de recomendação. Mood: {}", request.getMood());
        
        // Chama a IA
        String recomendacao = geminiService.getRecomendacao(request.getPerfil(), request.getMood());
        
        log.info("Recomendação gerada com sucesso!");
        return ResponseEntity.ok(recomendacao);
    }
}