"use client"
import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabaseClient"

export default function Callback() {
  const [msg, setMsg] = useState("Completing sign-in…")
  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMsg("Signed in! You can close this tab and return to ZIPBOT.")
      else setMsg("If your link expired, try signing in again.")
    })
  }, [])
  return <div className="card p-6"><h1 className="text-2xl font-semibold mb-2">ZIPBOT</h1><p>{msg}</p></div>
}
