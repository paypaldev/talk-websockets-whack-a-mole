import type { ReactElement } from "react";

export type RealtimeStatus = "live" | "connecting" | "offline";

interface RealtimeBadgeProps {
  status: RealtimeStatus;
}

export function RealtimeBadge({ status }: RealtimeBadgeProps): ReactElement {
  let statusLabel: string;
  let statusClasses: string;
  let dotClasses: string;

  switch (status) {
    case "live":
      statusLabel = "LIVE";
      statusClasses =
        "border-emerald-300/35 bg-emerald-400/10 text-emerald-200";
      dotClasses = "bg-emerald-300";
      break;
    case "connecting":
      statusLabel = "CONNECTING";
      statusClasses = "border-amber-300/35 bg-amber-400/10 text-amber-200";
      dotClasses = "bg-amber-300";
      break;
    case "offline":
      statusLabel = "OFFLINE";
      statusClasses = "border-rose-300/35 bg-rose-400/10 text-rose-200";
      dotClasses = "bg-rose-300";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses}`}
    >
      <span className={`size-1.5 rounded-full ${dotClasses}`} />
      {statusLabel}
    </span>
  );
}
