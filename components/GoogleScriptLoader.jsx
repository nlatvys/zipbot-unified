"use client"
import { useEffect } from "react"

export default function GoogleScriptLoader({ onReady }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    const ensureScript = () => new Promise((resolve) => {
      if (window.google && window.google.maps && window.google.maps.places) return resolve()
      const s = document.createElement("script")
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      s.async = true
      s.onload = resolve
      document.body.appendChild(s)
    })
    ;(async () => {
      await ensureScript()
      onReady && onReady()
    })()
  }, [onReady])
  return null
}
