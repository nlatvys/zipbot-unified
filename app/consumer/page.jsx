"use client"
import ZipSearch from "@/components/ZipSearch"

export default function Consumer() {
  const onSelectZip = (zip) => {
    window.location.href = `/zip/${zip}`
  }
  return (
    <main className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Left: hero + search */}
        <section className="card p-6 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-2">Your ZIP essentials in one place</h1>
          <p className="text-neutral-600 mb-4">Find schools, utilities, DMV/licensing, taxes, parks — and ask ZIPBOT for quick answers.</p>
          <ZipSearch onSelectZip={onSelectZip} />
          <div className="mt-3 text-sm text-neutral-500">Examples: 33606, 33701, 33511, 34655, 33813, 34609</div>
        </section>

        {/* Right: map look */}
        <aside className="card p-4">
          <div className="h-[320px] rounded-xl bg-neutral-200 relative overflow-hidden">
            <div className="absolute right-3 top-3 bg-white rounded-xl px-3 py-1 text-sm shadow">Legend • Landmarks</div>
          </div>
          <div className="text-xs text-neutral-500 mt-2">Map will center on the ZIP you select.</div>
        </aside>
      </div>

      {/* Info cards */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-4"><h3 className="font-medium">Schools</h3><p className="text-sm text-neutral-600">Find your district and nearby schools.</p></div>
        <div className="card p-4"><h3 className="font-medium">Utilities</h3><p className="text-sm text-neutral-600">Power, water, internet providers.</p></div>
        <div className="card p-4"><h3 className="font-medium">DMV / Licensing</h3><p className="text-sm text-neutral-600">Driver’s license, vehicle registration.</p></div>
        <div className="card p-4"><h3 className="font-medium">Taxes</h3><p className="text-sm text-neutral-600">County tax offices and resources.</p></div>
        <div className="card p-4"><h3 className="font-medium">Parks</h3><p className="text-sm text-neutral-600">Local parks & recreation.</p></div>
        <div className="card p-4"><h3 className="font-medium">Ask ZIPBOT</h3><p className="text-sm text-neutral-600">Chat is coming next; we’ll route tough questions to a local expert.</p></div>
      </section>

      <section className="card p-4">
        <h3 className="font-medium mb-2">Ask ZIPBOT</h3>
        <p className="text-sm text-neutral-600 mb-2">Questions about your area? Start a chat — we’ll route it to a local expert.</p>
        {/* Default to a generic ZIP prompt; users can still navigate to specific ZIP pages */}
        <div className="mt-2">
          <p className="text-xs text-neutral-500 mb-2">Tip: Open a ZIP page for a ZIP-specific thread.</p>
        </div>
      </section>
    </main>
  )
}
