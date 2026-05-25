package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.dto.RoteiroYoutubeDTO;
import com.leitura.Biblioteca_api.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/youtube")
@CrossOrigin(origins = "*")
public class YoutubeHelperController {

    private final GeminiService geminiService;

    public YoutubeHelperController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/gerar-roteiro")
    public ResponseEntity<String> gerarRoteiro(@RequestBody RoteiroYoutubeDTO dto) {
        
        // Prompt cirúrgico moldado para a estética do Cânone das Sombras
        String prompt = String.format(
            "Atue como um roteirista literário sênior e cientista humano. Crie um roteiro de vídeo denso e profundo para o canal 'Cânone das Sombras'.\n\n" +
            "Obra: '%s' de %s\n" +
            "Gênero: %s\n" +
            "Foco de Investigação: %s\n" +
            "Tom da Narrativa: %s\n" +
            "Notas de Leitura do Apresentador: \"%s\"\n\n" +
            "Estruture o roteiro com marcações de cena contendo:\n" +
            "1. INTRODUÇÃO (Gancho psicológico forte, quebrando o senso comum)\n" +
            "2. DESENVOLVIMENTO (Análise profunda baseada no foco de investigação, conectando com dilemas existenciais)\n" +
            "3. DIÁLOGO COM O LEITOR (Provocações filosóficas baseadas nas notas de leitura)\n" +
            "4. CONCLUSÃO (Fechamento marcante e reflexivo, sem jargões comerciais).",
            dto.titulo(), dto.autor(), dto.genero(), 
            dto.focoAnalise(), dto.tomVideo(), dto.opiniaoPessoal()
        );

        try {
            String roteiro = geminiService.consultarIA(prompt);
            return ResponseEntity.ok(roteiro);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao gerar roteiro nos bastidores: " + e.getMessage());
        }
    }
}