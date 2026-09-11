'use client';

// Segmented Bell/Jessica/Carol/Todos control — same pill styling as the
// Mês/Semana/Dia switcher next to it, plus a colored dot per person so the
// same accent used on their appointment cards is recognizable here too.
export function StaffSwitcher({ staff, value, onChange, mobile }) {
  if (!staff.length) return null;
  return (
    <div style={{ display: mobile ? 'grid' : 'flex', gridTemplateColumns: mobile ? `repeat(${staff.length + 1}, 1fr)` : undefined,
      gap: '6px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-pill)', padding: '4px' }}>
      {staff.map((s) => (
        <button key={s.staffPhone} onClick={() => onChange(s.staffPhone)} style={{
          border: 0, cursor: 'pointer', padding: mobile ? '9px 10px' : '8px 16px', borderRadius: 'var(--radius-pill)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
          background: value === s.staffPhone ? 'var(--surface-card)' : 'transparent',
          color: value === s.staffPhone ? 'var(--text-heading)' : 'var(--text-muted)',
          boxShadow: value === s.staffPhone ? 'var(--shadow-xs)' : 'none' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.accent, flexShrink: 0 }} />
          {s.staffName}
        </button>
      ))}
      <button onClick={() => onChange(null)} style={{
        border: 0, cursor: 'pointer', padding: mobile ? '9px 10px' : '8px 16px', borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
        background: value === null ? 'var(--surface-card)' : 'transparent',
        color: value === null ? 'var(--text-heading)' : 'var(--text-muted)',
        boxShadow: value === null ? 'var(--shadow-xs)' : 'none' }}>Todos</button>
    </div>
  );
}
