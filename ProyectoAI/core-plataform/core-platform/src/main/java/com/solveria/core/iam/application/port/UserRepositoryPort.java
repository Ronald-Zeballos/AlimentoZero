package com.solveria.core.iam.application.port;

import com.solveria.core.iam.domain.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    Optional<User> findById(Long id);

    Optional<User> findByUsernameIgnoreCaseAndTenantId(String username, String tenantId);

    List<User> findAllByTenantId(String tenantId);

    User save(User user);
}
