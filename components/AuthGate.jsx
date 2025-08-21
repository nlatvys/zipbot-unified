"use client"
import { useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabaseClient"
import SignInCard from "@/components/SignInCard"

export default function AuthGate({ children }){
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null); setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (!ready) return <div className="card p-4">Loading…</div>
  if (!user) return <SignInCard />
  return children
}
