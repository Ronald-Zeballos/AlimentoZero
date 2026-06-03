package com.solveria.iamservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Business role template available for AlimentoZero Market")
public record MarketplaceRoleTemplateResponse(
        @Schema(description = "Template code", example = "USER_BUYER") String code,
        @Schema(description = "Display label", example = "Comprador") String displayName,
        @Schema(
                        description = "Template description",
                        example = "Puede explorar ofertas, reservar packs y seguir sus retiros")
                String description,
        @Schema(description = "Main capabilities for this role") List<String> capabilities) {}
