import { getZipData } from "@/lib/pilot"
import dynamic from "next/dynamic"
const ChatPane = dynamic(() => import("@/components/ChatPane"), { ssr: false })

function LinkList({ title, items }){
  if (!items || !items.length) return null
  return (
    <section className="card p-4 space-y-2">
      <h3 className="font-medium">{title}</h3>
      <ul className="list-disc list-inside text-sm">
        {items.map((it, i)=>(
          <li key={i}><a className="link" href={it.url} target="_blank" rel="noopener noreferrer">{it.label}</a></li>
        ))}
      </ul>
    </section>
  )
}

export default function ZipPage({ params }){
  const zip = params.zip
  const data = getZipData(zip)

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">ZIP {zip}</h1>
        {!data && <p className="text-sm text-red-600">We don't have curated links for this ZIP yet. Try 33606, 33611, or 33701.</p>}
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-4 h-[420px]">
          {/* Map placeholder; integrate Google Maps next */}
          <div className="w-full h-full rounded-xl bg-neutral-200" />
        </div>
        <aside className="space-y-3">
          <LinkList title="Schools" items={data?.schools} />
          <LinkList title="Utilities" items={data?.utilities} />
          <LinkList title="DMV / Licensing" items={data?.dmv} />
          <LinkList title="Taxes" items={data?.taxes} />
          <LinkList title="Parks" items={data?.parks} />
          <LinkList title="Listings (ListCastTV)" items={data?.listings} />
        </aside>
      </div>

      <section className="card p-4">
        <h3 className="font-medium mb-2">Ask ZIPBOT about {zip}</h3>
        <ChatPane zip={zip} />
      </section>
      </div>
    </main>
  )
}
