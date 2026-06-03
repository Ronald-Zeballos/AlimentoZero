package com.solveria.core.iam.infrastructure.persistence.adapter;

import com.solveria.core.iam.application.port.UserRepositoryPort;
import com.solveria.core.iam.domain.model.User;
import com.solveria.core.iam.infrastructure.persistence.entity.RoleJpaEntity;
import com.solveria.core.iam.infrastructure.persistence.mapper.UserJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.repository.RoleJpaRepository;
import com.solveria.core.iam.infrastructure.persistence.repository.UserJpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final RoleJpaRepository roleJpaRepository;
    private final UserJpaMapper mapper;

    public UserRepositoryAdapter(
            UserJpaRepository userJpaRepository,
            RoleJpaRepository roleJpaRepository,
            UserJpaMapper mapper) {
        this.userJpaRepository = userJpaRepository;
        this.roleJpaRepository = roleJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByUsernameIgnoreCaseAndTenantId(String username, String tenantId) {
        return userJpaRepository
                .findAllByUsernameIgnoreCaseAndTenantIdOrderByIdAsc(username, tenantId)
                .stream()
                .findFirst()
                .map(mapper::toDomain);
    }

    @Override
    public List<User> findAllByTenantId(String tenantId) {
        return userJpaRepository.findAllByTenantId(tenantId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public User save(User user) {
        Set<RoleJpaEntity> roles =
                user.getRoleIds().stream()
                        .map(
                                roleId ->
                                        roleJpaRepository
                                                .findById(roleId)
                                                .orElseThrow(
                                                        () ->
                                                                new IllegalArgumentException(
                                                                        "Role not found: "
                                                                                + roleId)))
                        .collect(Collectors.toSet());

        var entity =
                user.getId() != null
                        ? userJpaRepository
                                .findById(user.getId())
                                .orElseGet(() -> mapper.toEntity(user, roles))
                        : userJpaRepository
                                .findAllByUsernameIgnoreCaseAndTenantIdOrderByIdAsc(
                                        user.getUsername(), user.getTenantId())
                                .stream()
                                .findFirst()
                                .orElseGet(() -> mapper.toEntity(user, roles));

        mapper.updateEntity(entity, user, roles);
        if (entity.getTenantId() == null) {
            entity.setTenantId(user.getTenantId());
        }
        var saved = userJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
