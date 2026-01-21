package com.leitura.Biblioteca_api.service;

import com.leitura.Biblioteca_api.config.JwtAuthFilter;
import com.leitura.Biblioteca_api.model.LivroHistorico;
import com.leitura.Biblioteca_api.repository.LivroHistoricoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final LivroHistoricoRepository historicoRepository;

    // Recupera o ID do usuário autenticado (que o filtro criou/carregou)
    private Long getUsuarioIdAtual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // Tenta pegar o ID do objeto seguro (SimpleUser) ou do UserDetails padrão
            if (auth != null && auth.getPrincipal() instanceof JwtAuthFilter.SimpleUser) {
                return ((JwtAuthFilter.SimpleUser) auth.getPrincipal()).getId();
            }
            // Fallback: se por algum motivo não for SimpleUser (ex: testes), tentamos buscar pelo repositório
            // Mas com o filtro atual, deve ser sempre SimpleUser.
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // Busca segura: Se não tiver usuário, retorna lista vazia em vez de erro
    private List<LivroHistorico> buscarLivrosDoUsuario() {
        try {
            Long userId = getUsuarioIdAtual();
            if (userId == null) return new ArrayList<>();
            
            // Usa o método findByUsuarioId que adicionamos ao repositório
            return historicoRepository.findByUsuarioId(userId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStatsMap() {
        Map<String, Object> response = new HashMap<>();
        try {
            int anoAtual = LocalDate.now().getYear();
            List<LivroHistorico> todos = buscarLivrosDoUsuario();
            
            // Filtra livros do ano atual
            List<LivroHistorico> filtrados = todos.stream()
                .filter(l -> l.getDataFim() != null && l.getDataFim().getYear() == anoAtual)
                .collect(Collectors.toList());

            // Cálculos
            long totalLivros = filtrados.size();
            long totalPaginas = filtrados.stream()
                .mapToLong(l -> l.getTotalPaginas() != null ? l.getTotalPaginas() : 0)
                .sum();
            
            double media = filtrados.stream()
                .mapToInt(l -> l.getClassificacao() != null ? l.getClassificacao() : 0)
                .filter(v -> v > 0)
                .average()
                .orElse(0.0);
            
            String genero = "N/A";
            if (!filtrados.isEmpty()) {
                genero = filtrados.stream()
                    .filter(l -> l.getGenero() != null)
                    .collect(Collectors.groupingBy(LivroHistorico::getGenero, Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");
            }

            // Monta resposta
            response.put("ano", anoAtual);
            response.put("totalLivros", totalLivros);
            response.put("totalPaginas", totalPaginas);
            response.put("mediaClassificacao", media);
            response.put("generoMaisLido", genero);
            
        } catch (Exception e) {
            // Fallback seguro
            response.put("ano", LocalDate.now().getYear());
            response.put("totalLivros", 0);
            response.put("totalPaginas", 0);
            response.put("mediaClassificacao", 0.0);
            response.put("generoMaisLido", "N/A");
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLivrosPorMesMap(Integer ano) {
        try {
            int anoAlvo = (ano != null) ? ano : LocalDate.now().getYear();
            List<LivroHistorico> todos = buscarLivrosDoUsuario();
            
            Map<Integer, Long> contagem = todos.stream()
                .filter(l -> l.getDataFim() != null && l.getDataFim().getYear() == anoAlvo)
                .collect(Collectors.groupingBy(l -> l.getDataFim().getMonthValue(), Collectors.counting()));
            
            List<Map<String, Object>> resultado = new ArrayList<>();
            String[] meses = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};
            
            for (int i = 1; i <= 12; i++) {
                Map<String, Object> item = new HashMap<>();
                item.put("mes", meses[i - 1]);
                item.put("quantidade", contagem.getOrDefault(i, 0L));
                resultado.add(item);
            }
            return resultado;
        } catch (Exception e) { 
            return new ArrayList<>(); 
        }
    }

    @Transactional(readOnly = true)
    public List<Integer> getAnosDisponiveis() {
        try {
            List<LivroHistorico> todos = buscarLivrosDoUsuario();
            List<Integer> anos = todos.stream()
                .filter(l -> l.getDataFim() != null)
                .map(l -> l.getDataFim().getYear())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());
            
            if (anos.isEmpty()) anos.add(LocalDate.now().getYear());
            return anos;
        } catch (Exception e) {
            List<Integer> f = new ArrayList<>(); f.add(LocalDate.now().getYear()); return f;
        }
    }
}