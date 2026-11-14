// Small line icons. All use currentColor so they follow the text color.

const base = { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const BookIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
  </svg>
);

export const CaretIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const DotsIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="12" cy="19" r="1.9" />
  </svg>
);

export const PlayIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M7 4.5v15l12-7.5z" />
  </svg>
);

export const PauseIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} strokeWidth={2.6} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const SpeakerIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const ChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const ArrowLeft = (p) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const GuideIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6M12 17h.01" />
  </svg>
);

export const BugIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="8" width="10" height="12" rx="5" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8M3.5 13H7M17 13h3.5M4.5 8.5 7.5 10M19.5 8.5 16.5 10M4.5 18.5 7.5 17M19.5 18.5 16.5 17" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// One badge per learning rank.
export function RankIcon({ level, ...p }) {
  if (level === 'cadet') {
    return (
      <svg {...base} {...p}>
        <path d="M12 2.8 20 6v6c0 4.6-3.3 8.1-8 9.2C7.3 20.1 4 16.6 4 12V6z" />
        <path d="m8 12.5 4-3 4 3" />
      </svg>
    );
  }
  if (level === 'astronaut') {
    return (
      <svg {...base} {...p}>
        <path d="M12 2.5c3.2 2.4 4.8 6 4.6 10.3L14.5 16h-5l-2.1-3.2C7.2 8.5 8.8 4.9 12 2.5z" />
        <circle cx="12" cy="9.5" r="1.8" />
        <path d="M9.5 16 7 20.5l3-1.3M14.5 16l2.5 4.5-3-1.3M12 18v3.5" />
      </svg>
    );
  }
  return (
    <svg {...base} {...p}>
      <path d="M12 2.8 20 6v6c0 4.6-3.3 8.1-8 9.2C7.3 20.1 4 16.6 4 12V6z" />
      <path d="m12 7.5 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" />
    </svg>
  );
}
