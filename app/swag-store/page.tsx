import Link from 'next/link'
import Image from 'next/image'

interface SwagItem {
  id: string
  title: string
  description: string
  imageSrc: string
}

const swagItems: SwagItem[] = [
  {
    id: 'paypal-swag-notebook',
    title: 'PayPal Notebook',
    description:
      'A sleek, pocket-sized notebook with a pixel art cover featuring PayPal’s iconic blue and green colors.',
    imageSrc: '/paypal-swag1.png',
  },
  {
    id: 'paypal-swag-hoodie',
    title: 'PayPal Hoodie',
    description:
      'A comfortable hoodie featuring PayPal&quot;s branding and colors, perfect for casual wear.',
    imageSrc: '/paypal-swag2.png',
  },
  {
    id: 'paypal-swag-cap',
    title: 'PayPal Cap',
    description:
      'A stylish cap with PayPal&quot;s logo embroidered on the front, available in various colors.',
    imageSrc: '/paypal-swag3.png',
  },
]

export default function SwagStorePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
              Swag
            </span>

            <Link
              href="/leaderboard"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10"
            >
              Leaderboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Swag Store
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
              This page is ready for upcoming swag content and purchasing functionality.
            </p>
          </div>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {swagItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm"
            >
              <div className="relative aspect-4/3 w-full border-b border-white/10">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 p-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
