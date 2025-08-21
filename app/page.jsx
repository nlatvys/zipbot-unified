import Link from "next/link"

export default function Home() {
  return (
    <main className="grid md:grid-cols-2 gap-6 items-center">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">One app, two modes</h1>
        <p className="text-neutral-600">Consumer: Schools, Utilities, DMV, Taxes, Parks. Pro: ListCast tools for real estate.</p>
        <div className="flex gap-3">
          <Link href="/consumer" className="btn btn-primary">Use Consumer Mode</Link>
          <Link href="/pro" className="btn">Go to Pro Mode</Link>
        </div>
      </section>
      <aside className="card p-6">
        <div className="aspect-video rounded-xl bg-[url('https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png')] bg-cover bg-center" />
        <p className="text-xs text-neutral-500 mt-2">Styled to match Blink’s map card.</p>
      </aside>
    </main>
  )
}
