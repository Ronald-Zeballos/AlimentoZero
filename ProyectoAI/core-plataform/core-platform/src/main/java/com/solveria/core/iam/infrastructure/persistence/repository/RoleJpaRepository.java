package com.solveria.core.iam.infrastructure.persistence.repository;

import com.solveria.core.iam.infrastructure.persistence.entity.RoleJpaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RoleJpaRepository
        extends JpaRepository<RoleJpaEntity, Long>, JpaSpecificationExecutor<RoleJpaEntity> {

    List<RoleJpaEntity> findAllByTenantIdOrderByNameAsc(String tenantId);

    List<RoleJpaEntity> findAllByNameIgnoreCaseAndTenantIdOrderByIdAsc(
            String name, String tenantId);
}
