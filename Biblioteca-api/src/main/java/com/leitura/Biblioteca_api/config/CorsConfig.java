package com.leitura.Biblioteca_api.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Permite credenciais (cookies/tokens)
        config.setAllowCredentials(true);
        
        // 2. Permite o seu Frontend específico
        // (Não use "*" com setAllowCredentials=true, tem de ser explícito)
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        
        // 3. Permite todos os cabeçalhos
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization"));
        
        // 4. Permite todos os métodos
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        source.registerCorsConfiguration("/**", config);
        
        // 5. CRUCIAL: Regista o filtro com a PRIORIDADE MÁXIMA
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); // Executa antes do Spring Security
        return bean;
    }
}