import "./globals.css"

export const metadata = {
  title: "ZIPBOT",
  description: "ZIPBOT — Consumer & Pro in one app",
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="flex items-center justify-between mb-6">
            <a href="/" className="font-semibold text-xl">ZIPBOT</a>
            <div className="flex gap-4 text-sm">
              <a href="/consumer" className="underline">Consumer</a>
              <a href="/pro" className="underline">Pro</a>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
