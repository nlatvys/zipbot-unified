import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "1mb" }))
app.use(morgan("dev"))

const API_KEY = process.env.LISTCASTAI_API_KEY || "dev-secret"

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "mock-listcastai-express" })
})

app.post("/", (req, res) => {
  const auth = req.get("authorization") || ""
  if (auth && !auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  if (auth && auth.split(" ")[1] !== API_KEY) {
    return res.status(401).json({ error: "Bad API key" })
  }

  const { zip, prompt, history = [], context = {} } = req.body || {}
  if (!zip || !/^\d{5}$/.test(zip) || !prompt) {
    return res.status(400).json({ error: "zip (5 digits) and prompt are required" })
  }

  // Simple grounded reply using pilot_links if provided
  const links = context?.pilot_links || {}
  const lines = []
  const order = ["schools","utilities","dmv","taxes","parks","listings"]
  order.forEach((k) => {
    if (Array.isArray(links[k]) && links[k].length) {
      const top = links[k].slice(0, 2).map(it => `• ${it.label}: ${it.url}`).join("\n")
      lines.push(`\n${k.toUpperCase()}\n${top}`)
    }
  })

  const reply = [
    `Here’s what I can find for ZIP ${zip} related to “${prompt}”.`,
    ...lines,
    `\nIf that’s not quite it, tell me more (e.g., “transfer electric service” or “enroll a 2nd grader”).`
  ].join("\n")

  res.json({ text: reply })
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`mock-listcastai-express listening on :${port}`))
