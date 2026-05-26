import { bootstrapMarketplaceProfiles, bootstrapMarketplaceRoles } from "../api";
import { AppTopBar } from "../components/AppTopBar";
import { InsightsPanel } from "../components/InsightsPanel";
import { MetricCard } from "../components/MetricCard";
import { ProfileSwitcher } from "../components/ProfileSwitcher";
import { SectionHeader } from "../components/SectionHeader";
import { resolveRoleDisplayName, resolveRoleHint } from "../utils/market";

export function ProfilePage({
  tenantId,
  session,
  market,
  activity,
  onToast,
  onLogout,
  availableProfiles
}) {
  async function handleBootstrapEverything() {
    try {
      const [profileResponse, roleResponse] = await Promise.all([
        bootstrapMarketplaceProfiles(tenantId),
        bootstrapMarketplaceRoles(tenantId)
      ]);
      await session.reloadSession();
      onToast(
        `Experiencia actualizada: ${profileResponse.ensuredProfiles} vistas y ${roleResponse.ensuredRoles} accesos disponibles.`
      );
    } catch {
      onToast("No pudimos actualizar las vistas disponibles en este momento.");
    }
  }

  return (
    <div className="page-container">
      <AppTopBar
        currentProfile={session.currentProfile}
        eyebrow="Personaliza la experiencia"
        title="Elige como quieres recorrer la app"
        subtitle="Cambia entre cliente, tienda, organizacion o panel de operaciones para ver una experiencia distinta y mucho mas real."
        accent="default"
      />
      <ProfileSwitcher
        profiles={availableProfiles}
        currentProfileKey={session.currentProfileKey}
        onSelectProfile={session.selectProfile}
        roles={session.roles}
        objectives={session.objectives}
      />
      <div className="auth-cta-strip">
        <button type="button" className="ghost-button" onClick={onLogout}>
          Cerrar sesion
        </button>
      </div>
      <div className="metrics-grid">
        <MetricCard label="Vistas disponibles" value={session.profiles.length} />
        <MetricCard label="Accesos cargados" value={session.roles.length} />
        <MetricCard label="Pedidos en pantalla" value={activity.orders.length} />
        <MetricCard label="Solicitudes visibles" value={activity.donationRequests.length} />
      </div>
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="eyebrow">Accesos del panel</p>
            <h3>Permisos y capacidades</h3>
          </div>
          <button type="button" className="ghost-button" onClick={handleBootstrapEverything}>
            Actualizar vistas
          </button>
        </div>
        <div className="role-grid">
          {session.roles.map((role) => (
            <article className="role-card" key={role.id ?? role.code ?? role.name}>
              <strong>{resolveRoleDisplayName(role)}</strong>
              <p>{role.description}</p>
              <small>{resolveRoleHint(role)}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="panel-card">
        <SectionHeader
          eyebrow="Que cambia"
          title="Cada vista tiene su propio estilo"
          subtitle="La idea no es mostrar tecnicismos, sino adaptar la app segun la persona que la esta usando."
        />
        <div className="compact-stack">
          <article className="mini-row">
            <strong>Comprador</strong>
            <span>Promos, categorias y pedidos</span>
          </article>
          <article className="mini-row">
            <strong>Tienda aliada</strong>
            <span>Control de packs, ingresos y publicacion</span>
          </article>
          <article className="mini-row">
            <strong>Organizacion social</strong>
            <span>Recepcion solidaria y solicitudes</span>
          </article>
          <article className="mini-row">
            <strong>Operaciones y backoffice</strong>
            <span>Monitoreo, rutas y control avanzado</span>
          </article>
        </div>
      </section>
    </div>
  );
}
