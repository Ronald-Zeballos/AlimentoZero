package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.DonationRequestResult;
import java.util.UUID;

public interface ApproveDonationRequestUseCase {

    DonationRequestResult approve(UUID requestId);
}
