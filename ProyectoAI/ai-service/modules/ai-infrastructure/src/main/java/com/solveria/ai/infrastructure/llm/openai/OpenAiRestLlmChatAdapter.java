package com.solveria.ai.infrastructure.llm.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solveria.ai.application.dto.ChatResultDto;
import com.solveria.ai.application.port.out.LlmChatPort;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("openai")
public class OpenAiRestLlmChatAdapter implements LlmChatPort {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String model;

    public OpenAiRestLlmChatAdapter(
            @Value("${OPENAI_API_KEY:}") String apiKey,
            @Value("${OPENAI_MODEL:gpt-4o-mini}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public ChatResultDto chat(String prompt) {
        try {
            String body =
                    objectMapper.writeValueAsString(
                            java.util.Map.of(
                                    "model",
                                    model,
                                    "messages",
                                    java.util.List.of(
                                            java.util.Map.of("role", "user", "content", prompt)),
                                    "temperature",
                                    0.3));
            HttpRequest request =
                    HttpRequest.newBuilder(URI.create("https://api.openai.com/v1/chat/completions"))
                            .header("Authorization", "Bearer " + apiKey)
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                            .build();
            HttpResponse<String> response =
                    httpClient.send(
                            request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "OpenAI request failed with status " + response.statusCode());
            }
            JsonNode root = objectMapper.readTree(response.body());
            String answer = root.path("choices").path(0).path("message").path("content").asText("");
            JsonNode usage = root.path("usage");
            return new ChatResultDto(
                    answer,
                    usage.path("prompt_tokens").asInt(0),
                    usage.path("completion_tokens").asInt(0));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("OpenAI request interrupted", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("OpenAI request failed", ex);
        }
    }
}
