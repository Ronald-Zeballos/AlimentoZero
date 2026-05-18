package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.port.UserRepositoryPort;
import com.solveria.core.iam.domain.model.User;
import java.util.Comparator;
import java.util.List;

public class ListMarketplaceProfilesUseCase {

    private final UserRepositoryPort userRepository;

    public ListMarketplaceProfilesUseCase(UserRepositoryPort userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> execute(String tenantId) {
        return userRepository.findAllByTenantId(tenantId).stream()
                .filter(user -> user.getProfileKey() != null && !user.getProfileKey().isBlank())
                .sorted(Comparator.comparing(User::getDisplayName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
