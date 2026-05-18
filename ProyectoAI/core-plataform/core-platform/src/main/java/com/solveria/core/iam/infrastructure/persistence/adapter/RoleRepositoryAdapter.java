package com.solveria.core.iam.infrastructure.persistence.adapter;

import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.iam.infrastructure.persistence.mapper.RoleJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.repository.RoleJpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class RoleRepositoryAdapter implements RoleRepositoryPort {

    private final RoleJpaRepository roleJpaRepository;
    private final RoleJpaMapper mapper;

    public RoleRepositoryAdapter(RoleJpaRepository roleJpaRepository, RoleJpaMapper mapper) {
        this.roleJpaRepository = roleJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Role save(Role role) {
        var entity =
                role.getId() == null
                        ? mapper.toEntity(role)
                        : roleJpaRepository.findById(role.getId()).orElseGet(() -> mapper.toEntity(role));
        mapper.updateEntity(role, entity);
        var saved = roleJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Role> findById(Long id) {
        return roleJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Set<Role> findByIds(Set<Long> ids) {
        return roleJpaRepository.findAllById(ids).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toSet());
    }

    @Override
    public List<Role> findAllByTenantId(String tenantId) {
        return roleJpaRepository.findAllByTenantIdOrderByNameAsc(tenantId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Role> findByNameIgnoreCaseAndTenantId(String name, String tenantId) {
        return roleJpaRepository.findByNameIgnoreCaseAndTenantId(name, tenantId).map(mapper::toDomain);
    }
}
