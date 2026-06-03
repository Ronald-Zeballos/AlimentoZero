package com.solveria.core.iam.infrastructure.persistence.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.iam.infrastructure.persistence.entity.PermissionJpaEntity;
import com.solveria.core.iam.infrastructure.persistence.entity.RoleJpaEntity;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Maps between Role domain model and RoleJpaEntity.
 *
 * <p>This mapper ensures complete separation between domain and infrastructure layers.
 */
@Component
public class RoleJpaMapper {

    private final ObjectMapper objectMapper;

    public RoleJpaMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Role toDomain(RoleJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        Set<Long> permissionIds =
                entity.getPermissions() != null
                        ? entity.getPermissions().stream()
                                .map(PermissionJpaEntity::getId)
                                .collect(Collectors.toSet())
                        : Set.of();

        Role role =
                new Role(
                        entity.getId(),
                        entity.getName(),
                        entity.getDescription(),
                        permissionIds,
                        entity.getTenantId(),
                        entity.getVersion(),
                        entity.getCreatedAt(),
                        entity.getCreatedBy(),
                        entity.getLastModifiedAt(),
                        entity.getLastModifiedBy());
        role.setDisplayName(entity.getDisplayName());
        role.assignCapabilities(deserializeCapabilities(entity.getCapabilitiesJson()));
        return role;
    }

    public RoleJpaEntity toEntity(Role domain) {
        if (domain == null) {
            return null;
        }

        RoleJpaEntity entity = new RoleJpaEntity(domain.getName(), domain.getDescription());
        updateEntity(domain, entity);
        return entity;
    }

    public void updateEntity(Role domain, RoleJpaEntity entity) {
        if (domain == null || entity == null) {
            return;
        }

        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCapabilitiesJson(serializeCapabilities(domain.getCapabilities()));
        entity.setTenantId(domain.getTenantId());
    }

    private String serializeCapabilities(Set<String> capabilities) {
        try {
            return objectMapper.writeValueAsString(capabilities);
        } catch (Exception e) {
            return "[]";
        }
    }

    private Set<String> deserializeCapabilities(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptySet();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Set<String>>() {});
        } catch (Exception e) {
            return Collections.emptySet();
        }
    }
}
