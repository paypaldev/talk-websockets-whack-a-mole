export function SandboxTestCards() {
  return (
    <section className="rounded-2xl border border-emerald-300/25 bg-linear-to-br from-emerald-300/10 via-sky-300/8 to-transparent p-5 shadow-[0_10px_40px_rgba(16,185,129,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/90">
        Sandbox Test Cards
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="w-full overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#1f8f7a_0%,#145f70_55%,#0f3f59_100%)] p-5 text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-100/80">
              Dummy Card
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
              American Express
            </span>
          </div>

          <p className="mt-6 text-2xl font-semibold tracking-[0.08em] text-white">
            3714 496353 98431
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
                CVV
              </p>
              <p className="mt-1 font-semibold text-white">1234</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
                Expiry
              </p>
              <p className="mt-1 font-semibold text-white">01/29</p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#2b2b66_0%,#1e3a8a_55%,#0f2557_100%)] p-5 text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-100/80">
              Dummy Card
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
              Mastercard
            </span>
          </div>

          <p className="mt-6 text-2xl font-semibold tracking-[0.08em] text-white">
            2223 0000 4840 0011
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
                CVV
              </p>
              <p className="mt-1 font-semibold text-white">123</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
                Expiry
              </p>
              <p className="mt-1 font-semibold text-white">01/29</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
