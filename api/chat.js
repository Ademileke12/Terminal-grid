// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const HF_TOKEN = process.env.HF_TOKEN;
  const MODEL_URL = "https://router.huggingface.co/v1/chat/completions";
  const HF_MODEL_NAME = "SentientAGI/Dobby-Mini-Unhinged-Plus-Llama-3.1-8B:featherless-ai";

  try {
    const { prompt } = await req.json?.() || req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const systemPrompt = "You are a concise AI terminal agent. Keep answers minimal and clean.";

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
