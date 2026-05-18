package com.solveria.ai.application.port.in;

import com.solveria.ai.application.dto.MarketBriefingCommandDto;
import com.solveria.ai.application.dto.MarketBriefingResultDto;

public interface GenerateMarketBriefingUseCase {

    MarketBriefingResultDto generate(MarketBriefingCommandDto command);
}
