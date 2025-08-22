export default async function handler(req, res) {
  if (req.method === "GET") {
    // Serve frontend
    return res
      .status(200)
      .setHeader("Content-Type", "text/html")
      .send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reaper AI</title>
</head>
<body>
<h1>Reaper AI</h1>
<input id="prompt" placeholder="Ask something..." style="width:300px">
<button id="sendBtn">Send</button>
<p id="response"></p>

<script>
document.getElementById("sendBtn").onclick = async () => {
  const prompt = document.getElementById("prompt").value;
  if (!prompt) {
    document.getElementById("response").innerText = "Type a question!";
    return;
  }
  try {
    const res = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    document.getElementById("response").innerText = data.answer;
  } catch (e) {
    document.getElementById("response").innerText = "Error: " + e.message;
  }
};
</script>
</body>
</html>`);
  }

  if (req.method === "POST") {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is empty" });

    try {
      // GROQ API call
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "user",
              content: `You are Reaper, a chill, friendly AI with sarcasm. Respond to: "${prompt}"`
            }
          ]
        })
      });

      const data = await response.json();
      console.log("Groq full response:", JSON.stringify(data, null, 2));

      let answer = "Hmm… I got nothing. Try again?";
      if (data?.choices?.length > 0) {
        answer = data.choices[0]?.message?.content || answer;
      }

      return res.status(200).json({ answer });
    } catch (err) {
      console.error("Groq fetch error:", err);
      return res.status(500).json({ error: "Groq request failed" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
