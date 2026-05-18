export function InsightsPanel({ aiMode, briefing, summary }) {
  return (
    <section className="panel-card insights-card">
      <div className="panel-card__header">
        <div>
          <p className="eyebrow">IA operativa</p>
          <h3>{briefing?.headline || "Sin briefing disponible"}</h3>
        </div>
        <span className={aiMode === "live" ? "pill live" : "pill"}>{aiMode}</span>
      </div>
      <p className="helper-text">
        {briefing?.summary ||
          "Todavia no hay un briefing en vivo; el ranking local sigue disponible."}
      </p>
      <div className="insights-grid">
        <article className="metric-card">
          <span>Publicaciones activas</span>
          <strong>{summary?.activeListings ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Casos criticos</span>
          <strong>{summary?.criticalListings ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Donaciones aprobadas</span>
          <strong>{summary?.approvedDonations ?? 0}</strong>
        </article>
      </div>
      {briefing?.priorityActions?.length ? (
        <div className="insight-list">
          <strong>Acciones sugeridas</strong>
          {briefing.priorityActions.map((action) => (
            <p key={action}>{action}</p>
          ))}
        </div>
      ) : null}
      {briefing?.alerts?.length ? (
        <div className="insight-list">
          <strong>Alertas</strong>
          {briefing.alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
