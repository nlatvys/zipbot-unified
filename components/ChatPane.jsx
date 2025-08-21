"use client"
import { useEffect, useRef, useState } from "react"
import { supabaseBrowser } from "@/lib/supabaseClient"
import AuthGate from "@/components/AuthGate"

function InnerChat({ zip }){
  const supabase = supabaseBrowser()
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const subRef = useRef(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
  }, [])

  useEffect(() => {
    if (!zip || !user) return
    let mounted = true
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ zip }),
      })
      const d = await res.json()
      if (!res.ok) { console.error(d.error); return }
      if (!mounted) return
      setChatId(d.chat.id)

      const { data: rows } = await supabase
        .from("messages").select("*").eq("chat_id", d.chat.id)
        .order("created_at", { ascending: true })
      setMessages(rows || [])

      subRef.current = supabase
        .channel(`messages-zip-${zip}-${user.id}`)
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "messages",
          filter: `chat_id=eq.${d.chat.id}`
        }, (payload) => { setMessages((m) => [...m, payload.new]) })
        .subscribe()
    })()
    return () => {
      mounted = false
      if (subRef.current) supabase.removeChannel(subRef.current)
    }
  }, [zip, user])

  const send = async () => {
    if (!input.trim() || !chatId) return
    const text = input.trim()
    setInput("")
    const temp = { id: `temp-${Date.now()}`, chat_id: chatId, zip, role: "user", content: text, created_at: new Date().toISOString() }
    setMessages((m) => [...m, temp])

    const session = (await supabase.auth.getSession()).data.session
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ chat_id: chatId, zip, content: text })
    })
    const data = await res.json()
    if (!res.ok) {
      setMessages((m) => m.filter(msg => msg.id !== temp.id))
      alert(data.error || "Failed to send")
    } else {

    // Ask assistant to reply (server will insert assistant message via service role)
    const session = (await supabase.auth.getSession()).data.session
    fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ chat_id: chatId, zip, prompt: text })
    }).catch(()=>{})

    }
  }

  return (
    <div className="flex flex-col h-72">
      <div className="flex-1 overflow-auto space-y-2 p-2 border rounded-lg bg-white">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="inline-block px-3 py-2 rounded-xl bg-neutral-100">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input className="flex-1 border rounded-lg px-3 py-2" placeholder={`Ask about ${zip}…`} value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=> e.key === "Enter" ? send() : null}/>
        <button className="px-4 py-2 rounded-lg bg-black text-white" onClick={send}>Send</button>
      </div>
    </div>
  )
}

export default function ChatPane({ zip }){
  return (
    <AuthGate>
      <InnerChat zip={zip} />
    </AuthGate>
  )
}
