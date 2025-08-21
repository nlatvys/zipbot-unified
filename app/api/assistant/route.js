import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const LISTCASTAI_URL = process.env.LISTCASTAI_URL
const LISTCASTAI_API_KEY = process.env.LISTCASTAI_API_KEY

function userClient(req){
  const auth = req.headers.get("authorization") || ""
  return createClient(PUBLIC_URL, ANON_KEY, { global: { headers: { Authorization: auth } } })
}
function adminClient(){
  return createClient(PUBLIC_URL, SERVICE_KEY, { auth: { persistSession: false } })
}

async function fetchPilot(zip){
  try{
    const file = path.join(process.cwd(), "data", "pilot.json")
    const raw = fs.readFileSync(file, "utf-8")
    const data = JSON.parse(raw)
    return data[zip] || null
  }catch(e){ return null }
}

async function callListCastAI(payload){
  if (!LISTCASTAI_URL) return null
  try{
    const res = await fetch(LISTCASTAI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(LISTCASTAI_API_KEY ? { "authorization": `Bearer ${LISTCASTAI_API_KEY}` } : {})
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) return null
    const data = await res.json()
    // Expected { text: "..."} or similar
    return data.text || data.answer || JSON.stringify(data)
  }catch(e){
    return null
  }
}

export async function POST(req){
  const uclient = userClient(req)
  const aclient = adminClient()
  const body = await req.json()
  const { chat_id, zip, prompt } = body || {}
  if (!chat_id || !zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Who is the user? (owner id used for display/scoping)
  const { data: { user } } = await uclient.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Load recent history (last 12 messages)
  const { data: history, error: histErr } = await uclient
    .from("messages").select("role,content,created_at").eq("chat_id", chat_id)
    .order("created_at", { ascending: true }).limit(12)
  if (histErr) return NextResponse.json({ error: histErr.message }, { status: 500 })

  // Build assistant payload
  const pilot = await fetchPilot(zip)
  const payload = {
    zip,
    history,
    prompt,
    context: {
      pilot_links: pilot || {},
    }
  }

  // Try ListCastAI first
  let answer = await callListCastAI(payload)

  // Fallback: compose from pilot links
  if (!answer){
    const parts = []
    parts.push(`Here are useful resources for ZIP ${zip}:`)
    if (pilot){
      const order = ["schools","utilities","dmv","taxes","parks","listings"]
      for (const key of order){
        if (Array.isArray(pilot[key]) && pilot[key].length){
          const lines = pilot[key].slice(0,3).map(it => `• ${it.label}: ${it.url}`)
          parts.push(`\n${key.toUpperCase()}\n${lines.join("\n")}`)
        }
      }
      parts.push("\nIf you need something more specific, tell me what you’re trying to do (e.g., transfer utilities, register a new car, find elementary schools).")
    } else {
      parts.push("I don't have curated links for this ZIP yet. Try searching the district or county sites, or ask a specific question.")
    }
    answer = parts.join("\n")
  }

  // Insert assistant message with service key (bypasses RLS)
  const { error: insErr } = await aclient
    .from("messages")
    .insert({ chat_id, zip, user_id: user.id, role: "assistant", content: answer })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
