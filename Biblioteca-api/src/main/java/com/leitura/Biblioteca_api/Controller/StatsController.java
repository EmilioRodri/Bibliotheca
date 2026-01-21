package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estatisticas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            return ResponseEntity.ok(statsService.getDashboardStatsMap());
        } catch (Exception e) {
            // Resposta segura em caso de erro extremo
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("ano", LocalDate.now().getYear());
            fallback.put("totalLivros", 0);
            return ResponseEntity.ok(fallback);
        }
    }

    @GetMapping("/livros-por-mes")
    public ResponseEntity<List<Map<String, Object>>> getLivrosPorMes(@RequestParam(required = false) Integer ano) {
        return ResponseEntity.ok(statsService.getLivrosPorMesMap(ano));
    }

    @GetMapping("/anos")
    public ResponseEntity<List<Integer>> getAnos() {
        return ResponseEntity.ok(statsService.getAnosDisponiveis());
    }
}