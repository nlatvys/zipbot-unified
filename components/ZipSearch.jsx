"use client"
import { useEffect, useRef, useState } from "react"
import GoogleScriptLoader from "@/components/GoogleScriptLoader"

function extractZipFromAddressComponents(components = []){
  for (const c of components){
    if (c.types && c.types.includes("postal_code")) return c.long_name
  }
  return null
}

export default function ZipSearch({ onSelectZip }){
  const inputRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [value, setValue] = useState("")

  useEffect(() => {
    if (!ready || !inputRef.current || !window.google) return
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["address_components", "geometry", "formatted_address", "name"],
      types: ["(regions)"], // allow zips, cities, etc.
      componentRestrictions: { country: ["us"] }
    })
    ac.addListener("place_changed", () => {
      const place = ac.getPlace()
      let zip = extractZipFromAddressComponents(place.address_components || [])
      if (zip && /^\d{5}$/.test(zip)){
        onSelectZip?.(zip)
      } else if (place.geometry){
        // Fallback: reverse geocode lat/lng to get ZIP
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: place.geometry.location }, (results, status) => {
          if (status === "OK" && results && results.length){
            for (const r of results){
              const z = extractZipFromAddressComponents(r.address_components || [])
              if (z && /^\d{5}$/.test(z)){
                onSelectZip?.(z)
                return
              }
            }
          }
        })
      }
    })
    return () => {}
  }, [ready, onSelectZip])

  const manualGo = () => {
    const m = value.match(/^\d{5}$/)
    if (m) onSelectZip?.(m[0])
  }

  return (
    <div className="flex gap-2">
      <GoogleScriptLoader onReady={() => setReady(true)} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        className="flex-1 border rounded-xl px-3 py-3 text-lg"
        placeholder="Search ZIP or city (e.g., 33701 or Lakeland)"
      />
      <button className="btn btn-primary" onClick={manualGo}>Go</button>
    </div>
  )
}
