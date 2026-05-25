export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name:
    | "home"
    | "calendar"
    | "qr"
    | "history"
    | "user"
    | "bell"
    | "clock"
    | "pin"
    | "logout"
    | "profile"
    | "chevron";
  className?: string;
}) {
  const p = {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...p}>
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
      );

    case "qr":
      return (
        <svg {...p}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2" />
        </svg>
      );

    case "history":
      return (
        <svg {...p}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "user":
    case "profile":
      return (
        <svg {...p}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );

    case "bell":
      return (
        <svg {...p}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );

    case "clock":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "pin":
      return (
        <svg {...p}>
          <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "logout":
      return (
        <svg {...p}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...p}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
  }
}