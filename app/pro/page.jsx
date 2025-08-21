export default function Pro() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">ZIPBOT — Pro Mode</h1>
      <p className="text-neutral-600">For real estate workflows, jump into the ListCast ecosystem.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <a href="https://listcasttv.com" target="_blank" rel="noopener noreferrer" className="card p-6 hover:shadow-md">
          <h3 className="font-medium mb-1">Go to ListCastTV</h3>
          <p className="text-sm text-neutral-600">Watch listings & video stories.</p>
        </a>
        <a href="https://listcastmedia.com" target="_blank" rel="noopener noreferrer" className="card p-6 hover:shadow-md">
          <h3 className="font-medium mb-1">Go to ListCastMedia</h3>
          <p className="text-sm text-neutral-600">Agent tools, gigs, and dashboards.</p>
        </a>
      </div>
      <p className="text-xs text-neutral-500">More coming soon: SSO, agent directory, lead routing.</p>
    </main>
  )
}
