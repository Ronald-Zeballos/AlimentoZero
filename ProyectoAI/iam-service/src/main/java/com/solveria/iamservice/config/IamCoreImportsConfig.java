package com.solveria.iamservice.config;

import com.solveria.core.iam.application.port.PermissionRepositoryPort;
import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.application.port.UserRepositoryPort;
import com.solveria.core.iam.infrastructure.persistence.adapter.PermissionRepositoryAdapter;
import com.solveria.core.iam.infrastructure.persistence.adapter.RoleRepositoryAdapter;
import com.solveria.core.iam.infrastructure.persistence.adapter.UserRepositoryAdapter;
import com.solveria.core.iam.infrastructure.persistence.mapper.PermissionJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.mapper.RoleJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.mapper.UserJpaMapper;
import com.solveria.core.iam.infrastructure.persistence.repository.PermissionJpaRepository;
import com.solveria.core.iam.infrastructure.persistence.repository.RoleJpaRepository;
import com.solveria.core.iam.infrastructure.persistence.repository.UserJpaRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration to explicitly create Port beans from core-platform adapters.
 *
 * <p>Creates beans of RoleRepositoryPort and PermissionRepositoryPort by instantiating the adapters
 * explicitly, rather than relying on @Component scan or @Import.
 *
 * <p>This approach: - Avoids scanning the entire core-platform package - Makes dependencies
 * explicit and visible - Facilitates gradual extraction: when IAM is extracted, only this config
 * needs to change - Allows easy override with @ConditionalOnMissingBean in future phases
 */
@Configuration
public class IamCoreImportsConfig {

    @Bean
    @ConditionalOnMissingBean
    public RoleJpaMapper roleJpaMapper() {
        return new RoleJpaMapper();
    }

    @Bean
    @ConditionalOnMissingBean
    public PermissionJpaMapper permissionJpaMapper() {
        return new PermissionJpaMapper();
    }

    @Bean
    @ConditionalOnMissingBean
    public UserJpaMapper userJpaMapper() {
        return new UserJpaMapper();
    }

    @Bean
    @ConditionalOnMissingBean(RoleRepositoryPort.class)
    public RoleRepositoryPort roleRepositoryPort(
            RoleJpaRepository roleJpaRepository, RoleJpaMapper roleJpaMapper) {
        return new RoleRepositoryAdapter(roleJpaRepository, roleJpaMapper);
    }

    @Bean
    @ConditionalOnMissingBean(PermissionRepositoryPort.class)
    public PermissionRepositoryPort permissionRepositoryPort(
            PermissionJpaRepository permissionJpaRepository, PermissionJpaMapper permissionJpaMapper) {
        return new PermissionRepositoryAdapter(permissionJpaRepository, permissionJpaMapper);
    }

    @Bean
    @ConditionalOnMissingBean(UserRepositoryPort.class)
    public UserRepositoryPort userRepositoryPort(
            UserJpaRepository userJpaRepository,
            RoleJpaRepository roleJpaRepository,
            UserJpaMapper userJpaMapper) {
        return new UserRepositoryAdapter(userJpaRepository, roleJpaRepository, userJpaMapper);
    }
}
