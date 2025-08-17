export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is empty" });

  try {
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
            role: "system",
            content: "You are Reaper, a chill, friendly AI with sarcasm."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Groq full response:", JSON.stringify(data, null, 2));

    const answer = data?.choices?.[0]?.message?.content || "Hmm… I got nothing. Try again?";
    res.status(200).json({ answer });

  } catch (err) {
    console.error("Groq fetch error:", err);
    res.status(500).json({ error: "Groq request failed" });
  }
}
