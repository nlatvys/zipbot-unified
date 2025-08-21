"use client"

import { useEffect, useRef } from "react"

export default function MapPane({ zip }) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !ref.current) return

    const ensureScript = () => new Promise((resolve) => {
      if (window.google && window.google.maps) return resolve()
      const s = document.createElement("script")
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      s.async = true
      s.onload = resolve
      document.body.appendChild(s)
    })

    const initMap = () => {
      if (!mapRef.current) {
        mapRef.current = new window.google.maps.Map(ref.current, {
          center: { lat: 27.951, lng: -82.457 }, // fallback
          zoom: 11,
          disableDefaultUI: true,
        })
      }
    }

    const geocode = async () => {
      if (!zip || !window.google) return
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: zip }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location
          mapRef.current.setCenter(loc)
          mapRef.current.setZoom(12)
          if (markerRef.current) markerRef.current.setMap(null)
          markerRef.current = new window.google.maps.Marker({
            position: loc,
            map: mapRef.current,
            title: `ZIP ${zip}`
          })
        } else {
          console.warn("Geocode failed:", status)
        }
      })
    }

    ;(async () => {
      await ensureScript()
      initMap()
      geocode()
    })()
  }, [zip])

  return <div ref={ref} className="w-full h-full rounded-xl bg-neutral-200" />
}
