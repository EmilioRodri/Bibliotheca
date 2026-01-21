package com.leitura.Biblioteca_api.service;

import com.leitura.Biblioteca_api.model.ProgressoLeitura;
import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.model.LivroHistorico;
import com.leitura.Biblioteca_api.dto.PlanilhaResponse; 

import com.leitura.Biblioteca_api.repository.ProgressoLeituraRepository;
import com.leitura.Biblioteca_api.repository.LivroHistoricoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProgressoService {

    private final ProgressoLeituraRepository progressoRepository;
    private final LivroHistoricoRepository livroHistoricoRepository;
    private final UsuarioService usuarioService;
    
    private Usuario getUsuarioAtual() {
        return usuarioService.getAuthenticatedUser();
    }
    
    // --- MÉTODOS REQUERIDOS PELO ProgressoController (Implementações completas) ---
    
    /** * [NOVO] Retorna todos os progressos do usuário. 
     */
    public List<ProgressoLeitura> buscarTodos() {
        Usuario usuario = getUsuarioAtual();
        // REQUER: um método findAllByUsuario no seu ProgressoLeituraRepository
        return progressoRepository.findAllByUsuario(usuario); 
    }
    
    /** * [NOVO] Deleta um progresso pelo ID. 
     */
    public void deletar(Long id) {
        Usuario usuario = getUsuarioAtual();
        // Busca o progresso garantindo que ele pertence ao usuário logado
        ProgressoLeitura progresso = progressoRepository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new AccessDeniedException("Progresso não encontrado ou você não tem permissão para deletá-lo."));

        progressoRepository.delete(progresso);
    }

    /** * [NOVO] Atualiza a quantidade de páginas lidas. 
     */
    public ProgressoLeitura atualizarPaginasLidas(Long livroId, int paginasLidas) {
        Usuario usuario = getUsuarioAtual();
        
        // REQUER: findByLivroHistorico_IdAndUsuario no Repositório
        ProgressoLeitura progresso = progressoRepository.findByLivroHistorico_IdAndUsuario(livroId, usuario)
            .orElseThrow(() -> new IllegalArgumentException("Progresso não encontrado."));
            
        // REQUER: setPaginasLidasAteAgora no ProgressoLeitura
        progresso.setPaginasLidasAteAgora(paginasLidas);
        
        return progressoRepository.save(progresso);
    }
    
    /**
     * [NOVO] Move o progresso para o histórico (Concluir Leitura).
     */
    public LivroHistorico concluirLeitura(Long livroId) {
        Usuario usuario = getUsuarioAtual();

        // 1. Encontra o progresso de leitura
        ProgressoLeitura progresso = progressoRepository.findByLivroHistorico_IdAndUsuario(livroId, usuario)
                .orElseThrow(() -> new IllegalArgumentException("Progresso de leitura não encontrado para este livro."));

        // 2. Pega o livro associado
        LivroHistorico livro = progresso.getLivroHistorico();

        // 3. Atualiza o status e a data de fim do livro no histórico
        livro.setStatus("lido");
        livro.setDataFim(LocalDate.now());
        livroHistoricoRepository.save(livro);

        // 4. Remove o registro de progresso, pois a leitura foi concluída
        progressoRepository.delete(progresso);

        return livro;
    }
    
    // --- MÉTODOS DE MANIPULAÇÃO (JÁ EXISTENTES) ---
    
    public ProgressoLeitura criarOuAtualizarProgresso(ProgressoLeitura novoProgresso) {
        Usuario usuario = getUsuarioAtual();
        
        LivroHistorico livro = novoProgresso.getLivroHistorico(); // REQUER: getLivroHistorico()

        if (livro == null || livro.getId() == null) {
            throw new IllegalArgumentException("O progresso deve estar associado a um LivroHistórico existente.");
        }

        Optional<LivroHistorico> livroOpt = livroHistoricoRepository.findByIdAndUsuario(livro.getId(), usuario); // REQUER: getId()
        if (livroOpt.isEmpty()) {
            throw new AccessDeniedException("Livro não encontrado ou não pertence a este usuário.");
        }
        
        Optional<ProgressoLeitura> progressoExistenteOpt = progressoRepository.findByLivroHistorico_IdAndUsuario(livro.getId(), usuario);
        
        if (progressoExistenteOpt.isPresent()) {
            ProgressoLeitura progressoExistente = progressoExistenteOpt.get();
            
            // REQUER: set/get PaginasLidasAteAgora, TotalPaginas, PrazoDias em ProgressoLeitura
            progressoExistente.setPaginasLidasAteAgora(novoProgresso.getPaginasLidasAteAgora());
            progressoExistente.setTotalPaginas(novoProgresso.getTotalPaginas()); 
            progressoExistente.setPrazoDias(novoProgresso.getPrazoDias());
            
            return progressoRepository.save(progressoExistente);
            
        } else {
            // REQUER: setUsuario, setLivroHistorico, setDataInicioPlano em ProgressoLeitura
            novoProgresso.setUsuario(usuario); 
            novoProgresso.setLivroHistorico(livroOpt.get()); 
            novoProgresso.setDataInicioPlano(LocalDate.now()); 
            
            return progressoRepository.save(novoProgresso);
        }
    }

    /**
     * Gera a planilha de leitura e calcula as métricas de progresso.
     */
    public PlanilhaResponse gerarPlanilha(Long livroId) {
        Usuario usuario = getUsuarioAtual();
        
        // REQUER: findByLivroHistorico_IdAndUsuario no Repositório
        ProgressoLeitura progresso = progressoRepository.findByLivroHistorico_IdAndUsuario(livroId, usuario)
            .orElseThrow(() -> new IllegalArgumentException("Progresso de leitura não configurado para este livro."));
            
        // Métrica: Páginas
        long totalPaginas = progresso.getTotalPaginas();
        int paginasLidas = progresso.getPaginasLidasAteAgora();
        long prazoDias = progresso.getPrazoDias();
        
        long paginasRestantes = totalPaginas - paginasLidas;
        if (paginasRestantes < 0) paginasRestantes = 0;

        // Métrica: Dias restantes
        LocalDate dataFimDesejada = progresso.getDataInicioPlano().plusDays(prazoDias);
        long diasRestantes = Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), dataFimDesejada));
        
        // Métrica: Meta diária
        int metaPaginasDiaria = 0;
        if (diasRestantes > 0) {
            metaPaginasDiaria = (int) Math.ceil((double) paginasRestantes / diasRestantes);
        } else if (paginasRestantes > 0) {
            metaPaginasDiaria = (int) paginasRestantes; 
        }
        
        // REQUER: getLivroHistorico() e getTitulo() aninhado
        return new PlanilhaResponse(
            progresso.getLivroHistorico().getTitulo(),
            (int) totalPaginas,
            paginasLidas,
            (int) paginasRestantes,
            diasRestantes,
            metaPaginasDiaria
        );
    }
}