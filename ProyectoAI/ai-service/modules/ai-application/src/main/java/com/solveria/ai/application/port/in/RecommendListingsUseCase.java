package com.solveria.ai.application.port.in;

import com.solveria.ai.application.dto.RecommendListingsCommandDto;
import com.solveria.ai.application.dto.RecommendationResultDto;

public interface RecommendListingsUseCase {

    RecommendationResultDto recommend(RecommendListingsCommandDto command);
}
