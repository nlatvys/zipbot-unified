import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const MAX_LEN = 1000
const BANNED = ["kill", "violence", "bomb"]
const RATE_PER_MIN = 5
const RATE_PER_DAY = 50

function getClientFromRequest(req){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const auth = req.headers.get("authorization") || ""
  const supabase = createClient(url, key, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false }
  })
  return supabase
}

export async function POST(req){
  const supabase = getClientFromRequest(req)
  const body = await req.json()
  const { chat_id, zip, content } = body || {}
  if (!chat_id || !zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const text = (content || "").trim()
  if (!text) return NextResponse.json({ error: "Empty message" }, { status: 400 })
  if (text.length > MAX_LEN) return NextResponse.json({ error: "Message too long" }, { status: 413 })
  const lower = text.toLowerCase()
  for (const w of BANNED){ if (lower.includes(w)) return NextResponse.json({ error: "Message blocked by moderation" }, { status: 422 }) }

  // Rate limits
  const now = new Date()
  const minuteAgo = new Date(now.getTime() - 60*1000).toISOString()
  const dayAgo = new Date(now.getTime() - 24*60*60*1000).toISOString()

  const { count: countMin, error: errMin } = await supabase
    .from("messages").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("zip", zip).gte("created_at", minuteAgo)
  if (errMin) return NextResponse.json({ error: errMin.message }, { status: 500 })

  const { count: countDay, error: errDay } = await supabase
    .from("messages").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("zip", zip).gte("created_at", dayAgo)
  if (errDay) return NextResponse.json({ error: errDay.message }, { status: 500 })

  if ((countMin || 0) >= RATE_PER_MIN) return NextResponse.json({ error: "Rate limit (per minute) exceeded" }, { status: 429 })
  if ((countDay || 0) >= RATE_PER_DAY) return NextResponse.json({ error: "Rate limit (per day) exceeded" }, { status: 429 })

  const { data: inserted, error: insErr } = await supabase
    .from("messages").insert({ chat_id, zip, user_id: user.id, role: "user", content: text }).select("*").single()
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, message: inserted })
}
