import { useState, useEffect, useCallback } from 'react';

// ─── Initials helper ──────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last  = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

// ─── Avatar with initials fallback ───────────────────────────────────────────

interface AvatarProps {
  src: string;
  name: string;
  size: number;
  borderRadius: number | string;
  border: string;
  boxShadow: string;
  loading?: 'lazy' | 'eager';
}

function AvatarWithFallback({ src, name, size, borderRadius, border, boxShadow, loading = 'lazy' }: AvatarProps) {
  const [imgMounted, setImgMounted] = useState(true);
  const initials = getInitials(name);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius,
        overflow: 'hidden',
        border,
        boxShadow,
        flexShrink: 0,
        // Background + initials are always the base layer — zero flash on error
        backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, white)',
      }}
    >
      {/* Initials tile — always rendered, sits beneath the image */}
      <span
        aria-label={name}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading, Georgia, serif)',
          fontSize: size * 0.28,
          fontWeight: 600,
          color: 'var(--brand-primary)',
          letterSpacing: '0.04em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {initials}
      </span>

      {/* Image — covers initials when it loads; hidden instantly on error via DOM + state */}
      {imgMounted && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          loading={loading}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            color: 'transparent', // suppress alt-text on broken img in all browsers
          }}
          onError={e => {
            // Immediate DOM hide prevents any flash of broken-image icon
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            setImgMounted(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardMember {
  id: string;
  name: string;
  title: string;
  badges: string[];
  photo: string;
  appointmentYear: number;
  independent: boolean;
  committees: string[];
  committeeLabels: Record<string, string>;
  bio: string;
  tenureLabel: string;
  linkedin?: string;
  twitter?: string;
}

interface Props {
  members: BoardMember[];
  lang: 'tr' | 'en';
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function GovernanceBoard({ members, lang }: Props) {
  const [active,    setActive]    = useState<BoardMember | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const ctaLabel   = lang === 'tr' ? 'Özgeçmişi İncele' : 'View Biography';
  const closeLabel = lang === 'tr' ? 'Kapat'             : 'Close';
  const indLabel   = lang === 'tr' ? 'Bağımsız Üye'      : 'Independent Member';
  const memberOfLabel = lang === 'tr' ? 'Komite Üyeliği'  : 'Committee Membership';

  const openModal = useCallback((member: BoardMember) => {
    setActive(member);
    // Double rAF — ensures React renders the hidden modal before triggering the transition
    requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)));
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setActive(null), 290);
  }, []);

  // Escape key dismiss
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, closeModal]);

  // Body scroll lock
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  return (
    <>
      {/* ─── Summary card grid ─── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map(member => (
          <BoardCard
            key={member.id}
            member={member}
            ctaLabel={ctaLabel}
            indLabel={indLabel}
            onOpen={openModal}
          />
        ))}
      </div>

      {/* ─── Modal overlay ─── */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{
            backgroundColor: isVisible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
            backdropFilter: isVisible ? 'blur(6px)' : 'blur(0px)',
            transition: 'background-color 290ms ease-out, backdrop-filter 290ms ease-out',
          }}
          onClick={closeModal}
        >
          <div
            className="relative w-full overflow-y-auto rounded-2xl bg-white shadow-2xl"
            style={{
              maxWidth: 680,
              maxHeight: '88vh',
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? 'scale(1) translateY(0px)'
                : 'scale(0.96) translateY(20px)',
              transition:
                'opacity 290ms ease-out, transform 290ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onClick={e => e.stopPropagation()}
          >

            {/* ── Modal banner — no portrait inside; overflow:hidden safely clips only the gradient ── */}
            <div className="relative overflow-hidden" style={{ height: 200 }}>
              {/* Brand gradient fill */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 60%, var(--brand-accent)) 100%)',
                }}
              />
              {/* Abstract geometry overlay */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 680 200"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <circle cx="590" cy="-20" r="170" fill="rgba(255,255,255,0.06)" />
                <circle cx="630" cy="90"  r="110" fill="rgba(255,255,255,0.04)" />
                <circle cx="50"  cy="230" r="190" fill="rgba(255,255,255,0.05)" />
                <circle cx="310" cy="190" r="130" fill="rgba(255,255,255,0.03)" />
                <line x1="0" y1="100" x2="680" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1="340" y1="0"  x2="340" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </svg>
            </div>

            {/* ── Circular portrait — outside overflow:hidden, floats over banner lower-left ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 20,
                marginTop: -48,
                paddingLeft: 28,
                lineHeight: 0,
              }}
            >
              <AvatarWithFallback
                src={active.photo}
                name={active.name}
                size={96}
                borderRadius="50%"
                border="4px solid white"
                boxShadow="0 8px 24px rgba(0,0,0,0.18)"
                loading="eager"
              />
            </div>

            {/* ── Modal content ── */}
            <div style={{ padding: '20px 32px 32px' }}>

              {/* Name + title */}
              <h2
                className="font-heading text-2xl font-semibold leading-snug"
                style={{ color: 'var(--brand-primary)' }}
              >
                {active.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{active.title}</p>

              {/* Role badges */}
              {active.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                  {active.independent && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: 'var(--brand-accent)' }}
                    >
                      {indLabel}
                    </span>
                  )}
                </div>
              )}

              {/* Committee memberships */}
              {active.committees.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.committees.map(id => (
                    <span
                      key={id}
                      className="rounded-full border px-2.5 py-0.5 text-[11px] text-gray-500"
                      style={{
                        borderColor:
                          'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                      }}
                    >
                      {active.committeeLabels[id] ?? id}
                    </span>
                  ))}
                </div>
              )}

              {/* Biography */}
              {active.bio && (
                <div className="mt-6 space-y-4 text-[0.9375rem] leading-[1.8] text-gray-600">
                  {active.bio.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {/* ── Footer: metadata left · social icons right ── */}
              <div
                className="mt-8 flex flex-wrap items-end justify-between gap-4"
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  paddingTop: 20,
                }}
              >
                {/* Tenure — sole metadata indicator */}
                <p
                  className="text-xs"
                  style={{ color: 'var(--brand-primary)', opacity: 0.45 }}
                >
                  {active.tenureLabel}
                </p>

                {/* Social links */}
                <div className="flex items-center gap-2">
                  {active.linkedin && (
                    <a
                      href={active.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
                      style={{
                        border:
                          '1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </a>
                  )}
                  {active.twitter && (
                    <a
                      href={active.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter / X"
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
                      style={{
                        border:
                          '1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Close button ── */}
            <button
              onClick={closeModal}
              aria-label={closeLabel}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-white/30"
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'white',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

          </div>
        </div>
      )}
    </>
  );
}

// ─── BoardCard sub-component ──────────────────────────────────────────────────

interface CardProps {
  member: BoardMember;
  ctaLabel: string;
  indLabel: string;
  onOpen: (m: BoardMember) => void;
}

function BoardCard({ member, ctaLabel, indLabel, onOpen }: CardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow duration-300 hover:shadow-md">

      {/* ── Cover banner ── */}
      <div className="relative overflow-hidden" style={{ height: 120 }}>
        {/* Brand gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 68%, var(--brand-accent)) 100%)',
          }}
        />
        {/* Abstract circles — decorative */}
        <div
          className="absolute rounded-full"
          style={{
            width: 130,
            height: 130,
            top: -42,
            right: -18,
            backgroundColor: 'rgba(255,255,255,0.07)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 76,
            height: 76,
            top: 24,
            right: 55,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
          aria-hidden="true"
        />
        {/* Independent badge on banner */}
        {member.independent && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {indLabel}
          </span>
        )}
      </div>

      {/* ── Squircle avatar — floats over banner bottom edge ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: -40,
          paddingLeft: 20,
          lineHeight: 0,
        }}
      >
        <AvatarWithFallback
          src={member.photo}
          name={member.name}
          size={80}
          borderRadius={20}
          border="3px solid white"
          boxShadow="0 4px 14px rgba(0,0,0,0.13)"
        />
      </div>

      {/* ── Identity + CTA ── */}
      <div className="flex flex-1 flex-col gap-3 p-5 pt-3">

        {/* Full name */}
        <h3
          className="font-heading text-base font-semibold leading-snug"
          style={{ color: 'var(--brand-primary)' }}
        >
          {member.name}
        </h3>

        {/* Title chips */}
        <div className="flex flex-wrap gap-1.5">
          {member.badges.map((badge, i) => (
            <span
              key={i}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--brand-primary) 9%, transparent)',
                color: 'var(--brand-primary)',
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Push CTA to bottom */}
        <div className="flex-1" />

        {/* Full-width CTA */}
        <button
          onClick={() => onOpen(member)}
          className="mt-1 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: 'var(--brand-primary)',
          }}
        >
          {ctaLabel}
        </button>

      </div>
    </article>
  );
}
