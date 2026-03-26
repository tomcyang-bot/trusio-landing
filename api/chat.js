import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, system } = req.body;
  try {
    const filtered = messages.filter((m, i) => !(i === 0 && m.role === 'assistant'));
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system,
      messages: filtered
    });
    const reply = response.content?.[0]?.text || '';
    res.status(200).json({ reply });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
