import {
  resolveAudienceLabel,
  resolveProfileDisplayName,
  resolveProfileNarrative
} from "../utils/market";

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
          <p className="eyebrow">Tu experiencia</p>
          <h3>{resolveProfileDisplayName(currentProfile) || "Elige una vista"}</h3>
        </div>
        <span className="pill">{resolveAudienceLabel(currentProfile)}</span>
      </div>
      <p className="helper-text">{resolveProfileNarrative(currentProfile)}</p>
      <div className="profile-switcher__row">
        {profiles.length > 1 ? (
          <label className="profile-switcher__field">
            Como quieres ver la app
            <select value={currentProfileKey} onChange={(event) => onSelectProfile(event.target.value)}>
              {profiles.map((profile) => (
                <option key={profile.profileKey} value={profile.profileKey}>
                  {resolveProfileDisplayName(profile)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="profile-switcher__field profile-switcher__field-readonly">
            <span>Tipo de cuenta</span>
            <strong>{resolveProfileDisplayName(currentProfile)}</strong>
            <small>Esta experiencia esta ligada a tu cuenta.</small>
          </div>
        )}
        <div className="profile-switcher__meta">
          <strong>{roleCount}</strong>
          <span>accesos activos</span>
        </div>
      </div>
      {objective ? (
        <div className="profile-objective">
          <strong>Sugerencia inteligente: {objective.displayName}</strong>
          <p>{objective.description}</p>
        </div>
      ) : null}
    </section>
  );
}
