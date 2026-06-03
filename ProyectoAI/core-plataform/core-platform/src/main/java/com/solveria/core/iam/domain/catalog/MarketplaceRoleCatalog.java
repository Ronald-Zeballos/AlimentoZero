package com.solveria.core.iam.domain.catalog;

import java.util.List;

public final class MarketplaceRoleCatalog {

    private static final List<MarketplaceRoleTemplate> DEFAULT_TEMPLATES =
            List.of(
                    new MarketplaceRoleTemplate(
                            "USER_BUYER",
                            "Comprador",
                            "Puede explorar ofertas, reservar packs y seguir sus retiros.",
                            List.of(
                                    "Explorar ofertas",
                                    "Reservar packs",
                                    "Ver pedidos",
                                    "Confirmar retiro")),
                    new MarketplaceRoleTemplate(
                            "MERCHANT",
                            "Negocio",
                            "Puede publicar excedentes, vender packs y monitorear su impacto.",
                            List.of(
                                    "Publicar ofertas",
                                    "Editar publicaciones",
                                    "Ver metricas",
                                    "Gestionar stock")),
                    new MarketplaceRoleTemplate(
                            "NGO_RECEIVER",
                            "Receptor social",
                            "Puede solicitar donaciones y coordinar recepcion con trazabilidad.",
                            List.of(
                                    "Solicitar donaciones",
                                    "Ver aprobaciones",
                                    "Confirmar recepcion")),
                    new MarketplaceRoleTemplate(
                            "TRANSPORTER",
                            "Transportista",
                            "Puede ejecutar retiros, entregas e informar incidencias logisticas.",
                            List.of(
                                    "Ver asignaciones",
                                    "Confirmar retiro",
                                    "Confirmar entrega",
                                    "Reportar incidencias")),
                    new MarketplaceRoleTemplate(
                            "COORDINATOR",
                            "Coordinador",
                            "Puede priorizar casos criticos, aprobar solicitudes y supervisar operaciones.",
                            List.of(
                                    "Aprobar solicitudes",
                                    "Asignar receptores",
                                    "Supervisar logistica",
                                    "Ver alertas")),
                    new MarketplaceRoleTemplate(
                            "ADMIN",
                            "Administrador",
                            "Puede gestionar la configuracion transversal del tenant y todos los flujos.",
                            List.of(
                                    "Gestionar usuarios",
                                    "Gestionar roles",
                                    "Ver todo el tenant",
                                    "Administrar catalogos")));

    private MarketplaceRoleCatalog() {}

    public static List<MarketplaceRoleTemplate> defaultTemplates() {
        return DEFAULT_TEMPLATES;
    }
}
