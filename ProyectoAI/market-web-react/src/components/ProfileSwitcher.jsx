import { resolveProfileNarrative } from "../utils/market";

export function ProfileSwitcher({
  profiles,
  currentProfileKey,
  onSelectProfile,
  roles,
  objectives
}) {
  const currentProfile = profiles.find((profile) => profile.profileKey === currentProfileKey);
  const roleCount = currentProfile
    ? roles.filter((role) =>
        currentProfile.roleIds?.includes(role.id) || currentProfile.roleIds?.includes(role.roleId)
      ).length
    : 0;
  const objective = objectives.find(
    (item) => item.code === currentProfile?.suggestedObjective
  );

  return (
    <section className="panel-card session-card">
      <div className="panel-card__header">
        <div>
          <p className="eyebrow">Sesion operativa</p>
          <h3>{currentProfile?.displayName || "Selecciona un perfil"}</h3>
        </div>
        <span className="pill">{currentProfile?.actorType || "Sin actor"}</span>
      </div>
      <p className="helper-text">{resolveProfileNarrative(currentProfile)}</p>
      <div className="profile-switcher__row">
        <label className="profile-switcher__field">
          Perfil activo
          <select value={currentProfileKey} onChange={(event) => onSelectProfile(event.target.value)}>
            {profiles.map((profile) => (
              <option key={profile.profileKey} value={profile.profileKey}>
                {profile.displayName}
              </option>
            ))}
          </select>
        </label>
        <div className="profile-switcher__meta">
          <strong>{roleCount}</strong>
          <span>roles vinculados</span>
        </div>
      </div>
      {objective ? (
        <div className="profile-objective">
          <strong>{objective.displayName}</strong>
          <p>{objective.description}</p>
        </div>
      ) : null}
    </section>
  );
}
