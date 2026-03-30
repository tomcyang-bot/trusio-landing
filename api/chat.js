module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, system, contactForm } = req.body;

  // Handle contact form submission
  if (contactForm) {
    const { name, company, phone, email, service, message } = contactForm;
    try {
      await fetch('https://vcdgcojqbhntjxymjvyc.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'chen@futureone.au',
          subject: `📬 Contact Us — ${service} — ${name}`,
          html: `<div style="font-family:sans-serif;padding:24px;max-width:560px;">
            <h3 style="color:#0a1628;">New Contact Us Enquiry (Landing Page)</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${company||'—'}</p>
            <p><strong>Phone:</strong> ${phone||'—'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Message:</strong><br/>${message}</p>
          </div>`
        })
      });
    } catch(e) { console.error('Email error:', e); }
    return res.status(200).json({ reply: 'received' });
  }

  // Handle AI chat
  try {
    const filtered = messages.filter((m, i) => !(i === 0 && m.role === 'assistant'));
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system,
        messages: filtered
      })
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || '';
    res.status(200).json({ reply });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
