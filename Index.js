// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Frontend (simple HTML page)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reaper AI</title>
    </head>
    <body>
      <h1>Reaper AI</h1>
      <input id="prompt" placeholder="Ask Reaper something" />
      <button id="sendBtn">Send</button>
      <p id="response"></p>

      <script>
        document.getElementById("sendBtn").onclick = async () => {
          const prompt = document.getElementById("prompt").value;
          if(!prompt) {
            document.getElementById("response").innerText = "Type something!";
            return;
          }
          try {
            const res = await fetch("/ask", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            document.getElementById("response").innerText = data.answer;
          } catch (err) {
            document.getElementById("response").innerText = "Error: " + err.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Backend (Reaper AI API route)
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is empty" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${process.env.GROQ_API_KEY}\`
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "You are Reaper, a chill, sarcastic but friendly AI." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    let answer = data?.choices?.[0]?.message?.content || "Hmm… I got nothing.";

    res.json({ answer });
  } catch (err) {
    console.error("Groq fetch error:", err);
    res.status(500).json({ error: "Groq request failed" });
  }
});

// Export for Vercel
export default app;
