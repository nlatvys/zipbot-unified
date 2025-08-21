"use client"
import { useState } from "react"
import { supabaseBrowser } from "@/lib/supabaseClient"

export default function SignInCard(){
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState("")

  const sendLink = async () => {
    setErr("")
    const supabase = supabaseBrowser()
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <div className="card p-4">
      <h3 className="font-medium mb-2">Sign in to start a chat</h3>
      <p className="text-sm text-neutral-600 mb-3">We’ll send you a secure magic link.</p>
      <div className="flex gap-2">
        <input className="flex-1 border rounded-lg px-3 py-2" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <button className="px-4 py-2 rounded-lg bg-black text-white" onClick={sendLink} disabled={!email}>Send link</button>
      </div>
      {sent && <p className="text-sm text-green-700 mt-2">Check your email for the sign-in link.</p>}
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
    </div>
  )
}
