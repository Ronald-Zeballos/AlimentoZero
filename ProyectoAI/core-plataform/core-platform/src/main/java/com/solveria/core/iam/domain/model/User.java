package com.solveria.core.iam.domain.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Pure domain model for User - no persistence framework dependencies.
 *
 * <p>Represents a user in the system with their roles and permissions.
 */
public class User {

    private final Long id;
    private String username;
    private String email;
    private String displayName;
    private boolean active;
    private Set<Long> roleIds = new HashSet<>();
    private String tenantId;
    private String profileKey;
    private String actorType;
    private String actorId;
    private String organizationId;
    private String landingRoute;
    private String suggestedObjective;
    private Long version;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;

    protected User() {
        this.id = null;
    }

    public User(String username, String email, boolean active) {
        this.id = null;
        this.username = username;
        this.email = email;
        this.displayName = username;
        this.active = active;
    }

    public User(
            Long id,
            String username,
            String email,
            String displayName,
            boolean active,
            Set<Long> roleIds,
            String tenantId,
            String profileKey,
            String actorType,
            String actorId,
            String organizationId,
            String landingRoute,
            String suggestedObjective,
            Long version,
            LocalDateTime createdAt,
            String createdBy,
            LocalDateTime lastModifiedAt,
            String lastModifiedBy) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.active = active;
        this.roleIds = roleIds != null ? new HashSet<>(roleIds) : new HashSet<>();
        this.tenantId = tenantId;
        this.profileKey = profileKey;
        this.actorType = actorType;
        this.actorId = actorId;
        this.organizationId = organizationId;
        this.landingRoute = landingRoute;
        this.suggestedObjective = suggestedObjective;
        this.version = version;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.lastModifiedAt = lastModifiedAt;
        this.lastModifiedBy = lastModifiedBy;
    }

    public void assignRoleIds(Set<Long> roleIds) {
        this.roleIds.clear();
        if (roleIds != null) {
            this.roleIds.addAll(roleIds);
        }
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Set<Long> getRoleIds() {
        return new HashSet<>(roleIds);
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getProfileKey() {
        return profileKey;
    }

    public void setProfileKey(String profileKey) {
        this.profileKey = profileKey;
    }

    public String getActorType() {
        return actorType;
    }

    public void setActorType(String actorType) {
        this.actorType = actorType;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getLandingRoute() {
        return landingRoute;
    }

    public void setLandingRoute(String landingRoute) {
        this.landingRoute = landingRoute;
    }

    public String getSuggestedObjective() {
        return suggestedObjective;
    }

    public void setSuggestedObjective(String suggestedObjective) {
        this.suggestedObjective = suggestedObjective;
    }

    public Long getVersion() {
        return version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getLastModifiedAt() {
        return lastModifiedAt;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }
}
