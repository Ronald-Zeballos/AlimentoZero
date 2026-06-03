package com.solveria.iamservice.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record CreateRoleRequest(
        @NotBlank(message = "{validation.role.name.required}")
                @Size(min = 3, max = 50, message = "{validation.role.name.size}")
                String name,
        @Size(max = 255, message = "{validation.role.description.size}") String description,
        @Size(max = 100, message = "{validation.role.displayName.size}") String displayName,
        Set<String> capabilities) {}
