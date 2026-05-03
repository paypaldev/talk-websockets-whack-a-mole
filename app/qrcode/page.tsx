import Image from 'next/image'
import Link from 'next/link'

export default function QrCodePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
              Scan To Play
            </span>

            <Link
              href="/leaderboard"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10"
            >
              Leaderboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">QR Code</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
              Scan this code to open the Whack-a-Mole experience on your phone.
            </p>
          </div>
        </header>

        <section className="w-full max-w-xl self-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 p-5 backdrop-blur-sm sm:p-8">
          <div className="rounded-xl border border-white/10 bg-white p-4 sm:p-6">
            <Image
              src="/whack-a-mole-qr-code.png"
              alt="Whack-a-Mole QR Code"
              width={1200}
              height={1200}
              className="h-auto w-full"
              priority
            />
          </div>
        </section>
      </div>
    </main>
  )
}