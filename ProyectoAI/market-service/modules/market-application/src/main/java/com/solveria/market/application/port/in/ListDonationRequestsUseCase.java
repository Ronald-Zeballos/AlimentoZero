package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.DonationRequestResult;
import java.util.List;

public interface ListDonationRequestsUseCase {

    List<DonationRequestResult> listByReceiver(String tenantId, String receiverOrgId);
}
