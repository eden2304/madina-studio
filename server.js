const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Models are tried in order. First = best Hebrew/creative quality, rest = safe
// fallbacks. If a model isn't enabled on the account it errors fast and we move
// on, so generation never breaks. Reorder to change the quality/speed trade-off.
const MODELS = [
  'moonshotai/kimi-k2-instruct',
  'llama-3.3-70b-versatile'
];

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { type: 'server_error', message: 'GROQ_API_KEY לא מוגדר — הוסף אותו ב-Environment Variables בפלטפורמת הפריסה' }
    });
  }

  // Honour an explicit model override, otherwise walk the quality list.
  const requested = req.body && req.body.model;
  const tryList = requested
    ? [requested, ...MODELS.filter(m => m !== requested)]
    : MODELS.slice();

  let lastErr = { status: 500, data: { error: { type: 'server_error', message: 'generation failed' } } };

  for (const model of tryList) {
    let response, data;
    try {
      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ ...req.body, model })
      });
      data = await response.json();
    } catch (err) {
      lastErr = { status: 502, data: { error: { type: 'network_error', message: err.message } } };
      continue;
    }

    if (response.ok) return res.json(data);

    if (data && typeof data.error === 'string') {
      data.error = { type: 'api_error', message: data.error };
    }
    lastErr = { status: response.status, data };

    // A bad key won't be fixed by trying another model — surface it immediately.
    if (response.status === 401) break;
  }

  return res.status(lastErr.status).json(lastErr.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
