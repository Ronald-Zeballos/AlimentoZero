package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.CreateDonationRequestCommand;
import com.solveria.market.application.dto.DonationRequestResult;

public interface CreateDonationRequestUseCase {

    DonationRequestResult create(CreateDonationRequestCommand command);
}
