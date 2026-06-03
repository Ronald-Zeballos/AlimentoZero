package com.solveria.core.iam.infrastructure.persistence.entity;

import com.solveria.core.shared.base.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * JPA entity for Role persistence.
 *
 * <p>This class handles all JPA/database concerns, keeping the domain model pure.
 */
@Entity
@Table(name = "iam_role")
public class RoleJpaEntity extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column private String description;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "capabilities", length = 2000)
    private String capabilitiesJson;

    @ManyToMany(mappedBy = "roles")
    private Set<UserJpaEntity> users = new HashSet<>();

    @OneToMany(mappedBy = "role")
    private Set<PermissionJpaEntity> permissions = new HashSet<>();

    protected RoleJpaEntity() {
        // JPA required constructor
    }

    public RoleJpaEntity(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getCapabilitiesJson() {
        return capabilitiesJson;
    }

    public void setCapabilitiesJson(String capabilitiesJson) {
        this.capabilitiesJson = capabilitiesJson;
    }

    public Set<UserJpaEntity> getUsers() {
        return users;
    }

    public Set<PermissionJpaEntity> getPermissions() {
        return permissions;
    }

    public void assignPermissions(Set<PermissionJpaEntity> permissions) {
        this.permissions.clear();
        if (permissions != null) {
            this.permissions.addAll(permissions);
        }
    }
}
