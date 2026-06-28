const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { type: 'server_error', message: 'ANTHROPIC_API_KEY לא מוגדר — הוסף אותו ב-Environment Variables בפלטפורמת הפריסה' }
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // Normalize string errors so frontend always gets { error: { message } }
    if (data.error && typeof data.error === 'string') {
      data.error = { type: 'api_error', message: data.error };
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { type: 'network_error', message: err.message } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
