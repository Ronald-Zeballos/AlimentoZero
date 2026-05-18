package com.solveria.core.iam.domain.catalog;

import java.util.List;

public final class MarketplaceProfileCatalog {

    private static final List<MarketplaceProfileTemplate> DEFAULT_TEMPLATES = List.of(
            new MarketplaceProfileTemplate(
                    "BUYER_NEIGHBOR",
                    "Vecina compradora",
                    "Perfil orientado a descubrir packs cercanos y retirarlos rapidamente.",
                    "compradora.vecina",
                    "buyer+demo@solveria.local",
                    "USER_BUYER",
                    "BUYER",
                    "buyer-demo",
                    null,
                    "/market/discover",
                    "BUYER_DISCOVERY",
                    List.of("Explorar ofertas", "Reservar packs", "Seguir retiros")),
            new MarketplaceProfileTemplate(
                    "MERCHANT_BAKERY",
                    "Panaderia aliada",
                    "Negocio que publica excedentes, busca rotar stock y proteger margen.",
                    "panaderia.aliada",
                    "merchant+demo@solveria.local",
                    "MERCHANT",
                    "MERCHANT",
                    "merchant-la-paz",
                    "merchant-la-paz",
                    "/merchant/listings",
                    "MERCHANT_RECOVERY",
                    List.of("Publicar excedentes", "Gestionar stock", "Monitorear conversion")),
            new MarketplaceProfileTemplate(
                    "NGO_FOOD_BANK",
                    "Banco de alimentos",
                    "Organizacion social que enruta donaciones y confirma recepcion.",
                    "banco.alimentos",
                    "ngo+demo@solveria.local",
                    "NGO_RECEIVER",
                    "NGO",
                    "ngo-user-demo",
                    "fundacion-banco-alimentos",
                    "/ngo/requests",
                    "DONATION_ROUTING",
                    List.of("Solicitar donaciones", "Priorizar impacto", "Confirmar recepcion")),
            new MarketplaceProfileTemplate(
                    "TRANSPORT_LAST_MILE",
                    "Operador de ultima milla",
                    "Transportista que toma retiros urgentes y confirma entregas.",
                    "ultima.milla",
                    "transport+demo@solveria.local",
                    "TRANSPORTER",
                    "TRANSPORTER",
                    "transporter-demo",
                    "fleet-la-paz",
                    "/logistics/assignments",
                    "TRANSPORT_ASSIGNMENT",
                    List.of("Tomar retiros", "Confirmar entregas", "Reportar incidencias")),
            new MarketplaceProfileTemplate(
                    "COORDINATOR_CITY",
                    "Coordinacion operativa",
                    "Perfil transversal que supervisa urgencias, donaciones y capacidad logistica.",
                    "coordinacion.ciudad",
                    "coordinator+demo@solveria.local",
                    "COORDINATOR",
                    "COORDINATOR",
                    "coordinator-demo",
                    "ops-la-paz",
                    "/ops/board",
                    "COORDINATOR_PRIORITY",
                    List.of("Aprobar solicitudes", "Asignar capacidad", "Ver alertas")),
            new MarketplaceProfileTemplate(
                    "ADMIN_TENANT",
                    "Administracion del tenant",
                    "Perfil de gobierno que audita roles, usuarios y salud operativa del tenant.",
                    "admin.tenant",
                    "admin+demo@solveria.local",
                    "ADMIN",
                    "ADMIN",
                    "admin-demo",
                    "tenant-admin",
                    "/admin/overview",
                    "COORDINATOR_PRIORITY",
                    List.of("Gestionar perfiles", "Auditar accesos", "Monitorear operacion")));

    private MarketplaceProfileCatalog() {}

    public static List<MarketplaceProfileTemplate> defaultTemplates() {
        return DEFAULT_TEMPLATES;
    }
}
