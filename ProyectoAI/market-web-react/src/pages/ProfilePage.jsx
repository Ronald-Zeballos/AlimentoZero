import { bootstrapMarketplaceProfiles, bootstrapMarketplaceRoles } from "../api";
import { InsightsPanel } from "../components/InsightsPanel";
import { MetricCard } from "../components/MetricCard";
import { ProfileSwitcher } from "../components/ProfileSwitcher";
import { SectionHeader } from "../components/SectionHeader";

export function ProfilePage({
  tenantId,
  session,
  market,
  activity,
  onToast
}) {
  async function handleBootstrapEverything() {
    try {
      const [profileResponse, roleResponse] = await Promise.all([
        bootstrapMarketplaceProfiles(tenantId),
        bootstrapMarketplaceRoles(tenantId)
      ]);
      await session.reloadSession();
      onToast(
        `IAM sincronizado: ${profileResponse.ensuredProfiles} perfiles y ${roleResponse.ensuredRoles} roles listos.`
      );
    } catch {
      onToast("No pudimos bootstrapear perfiles y roles del marketplace.");
    }
  }

  return (
    <div className="page-container">
      <SectionHeader
        eyebrow="Perfil y panel"
        title="Vista operativa por perfil"
        subtitle="Este panel ya mezcla IAM, market y AI segun el perfil seleccionado."
      />
      <ProfileSwitcher
        profiles={session.profiles}
        currentProfileKey={session.currentProfileKey}
        onSelectProfile={session.selectProfile}
        roles={session.roles}
        objectives={session.objectives}
      />
      <div className="metrics-grid">
        <MetricCard label="Publicaciones activas" value={market.summary?.activeListings ?? 0} />
        <MetricCard label="Casos criticos" value={market.summary?.criticalListings ?? 0} />
        <MetricCard label="Pedidos visibles" value={activity.orders.length} />
        <MetricCard label="Solicitudes visibles" value={activity.donationRequests.length} />
      </div>
      <InsightsPanel aiMode={market.aiMode} briefing={market.briefing} summary={market.summary} />
      <div className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="eyebrow">Roles y catalogo</p>
            <h3>Marketplace IAM</h3>
          </div>
          <button type="button" className="ghost-button" onClick={handleBootstrapEverything}>
            Re-sincronizar IAM
          </button>
        </div>
        <div className="role-grid">
          {session.roles.map((role) => (
            <article className="role-card" key={role.id ?? role.code ?? role.name}>
              <strong>{role.displayName ?? role.name}</strong>
              <p>{role.description}</p>
              <small>
                {Array.isArray(role.capabilities)
                  ? role.capabilities.slice(0, 2).join(" | ")
                  : `Tenant: ${role.tenantId}`}
              </small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
