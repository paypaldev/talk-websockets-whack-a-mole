export type ActivityTone = "emerald" | "sky" | "amber" | "rose";

interface ActivityToastConfig {
  className: string;
  duration: number;
}

export const ACTIVITY_TOAST_CONFIG: Record<ActivityTone, ActivityToastConfig> = {
  emerald: {
    className:
      "rounded-xl border-2 border-emerald-300/55 !bg-emerald-900 !text-emerald-50 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-md",
    duration: 7000,
  },
  sky: {
    className:
      "rounded-xl border-2 border-sky-300/55 !bg-sky-900 !text-sky-50 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-md",
    duration: 7000,
  },
  amber: {
    className:
      "rounded-xl border-2 border-amber-300/60 !bg-amber-900 !text-amber-50 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-md",
    duration: 7000,
  },
  rose: {
    className:
      "rounded-xl border-2 border-rose-300/55 !bg-rose-900 !text-rose-50 shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-md",
    duration: 7000,
  },
};
