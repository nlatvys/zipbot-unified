import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
  const { zip } = body || {}
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  // Get user id from auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // find latest chat for this user+zip or create
  const { data: existing, error: selErr } = await supabase
    .from("chats").select("*")
    .eq("zip", zip).eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(1)
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })
  if (existing && existing[0]) return NextResponse.json({ chat: existing[0] })

  const { data: created, error: insErr } = await supabase
    .from("chats").insert({ zip, user_id: user.id }).select("*").single()
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  return NextResponse.json({ chat: created })
}
