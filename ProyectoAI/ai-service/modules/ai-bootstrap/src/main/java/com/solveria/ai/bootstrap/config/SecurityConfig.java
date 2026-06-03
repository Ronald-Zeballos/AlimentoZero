package com.solveria.ai.bootstrap.config;

import java.util.Arrays;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    @ConditionalOnProperty(name = "security.jwt.enabled", havingValue = "true")
    public SecurityFilterChain securedSecurityFilterChain(HttpSecurity http, Environment env)
            throws Exception {
        boolean localDocs =
                Arrays.stream(env.getActiveProfiles())
                        .anyMatch(profile -> profile.equals("dev") || profile.equals("demo"));

        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        a -> {
                            a.requestMatchers("/actuator/health/**", "/actuator/info/**")
                                    .permitAll();
                            if (localDocs) {
                                a.requestMatchers(
                                                "/v3/api-docs/**",
                                                "/swagger-ui/**",
                                                "/swagger-ui.html")
                                        .permitAll();
                            }
                            a.anyRequest().authenticated();
                        })
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .formLogin(AbstractHttpConfigurer::disable)
                .exceptionHandling(
                        e ->
                                e.authenticationEntryPoint(
                                                new BearerTokenAuthenticationEntryPoint())
                                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler()));

        return http.build();
    }

    @Bean
    @ConditionalOnProperty(
            name = "security.jwt.enabled",
            havingValue = "false",
            matchIfMissing = true)
    public SecurityFilterChain openSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a.anyRequest().permitAll())
                .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
