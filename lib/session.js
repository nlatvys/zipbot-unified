export function getSessionId(){
  if (typeof window === "undefined") return null
  const k = "zipbot_session_id"
  let s = localStorage.getItem(k)
  if (!s){
    s = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now())
    localStorage.setItem(k, s)
  }
  return s
}
