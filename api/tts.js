export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text" });
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model:"tts-1", input:text.slice(0,500), voice:"alloy" }),
    });
    if (!response.ok) return res.status(500).json({ error:"TTS failed" });
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type","audio/mpeg");
    res.send(Buffer.from(buffer));
  } catch(e) { res.status(500).json({ error:e.message }); }
}
