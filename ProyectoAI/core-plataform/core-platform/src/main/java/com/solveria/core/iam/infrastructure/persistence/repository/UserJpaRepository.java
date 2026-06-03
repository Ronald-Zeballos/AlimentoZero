package com.solveria.core.iam.infrastructure.persistence.repository;

import com.solveria.core.iam.infrastructure.persistence.entity.UserJpaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserJpaRepository
        extends JpaRepository<UserJpaEntity, Long>, JpaSpecificationExecutor<UserJpaEntity> {

    List<UserJpaEntity> findAllByUsernameIgnoreCaseAndTenantIdOrderByIdAsc(
            String username, String tenantId);

    List<UserJpaEntity> findAllByTenantId(String tenantId);
}
