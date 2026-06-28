# מדינה סטודיו — הוראות פריסה

## פריסה ב-Render.com (חינמי)

### שלב 1 — העלה ל-GitHub
1. צור ריפו חדש ב-GitHub
2. העלה את כל הקבצים (server.js, package.json, תיקיית public/)

### שלב 2 — צור Web Service ב-Render
1. כנס ל-render.com → New → Web Service
2. חבר את ריפו ה-GitHub
3. הגדרות:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

### שלב 3 — הוסף את ה-API Key
ב-Render → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-...
```

### שלב 4 — Deploy!
לחץ Deploy. תוך דקה האתר עולה עם קישור חיצוני.

---

## פריסה חלופית — Railway.app
1. railway.app → New Project → Deploy from GitHub
2. הוסף Environment Variable: `ANTHROPIC_API_KEY`
3. Railway מזהה Node.js אוטומטית ומפרסם

## מבנה הקבצים
```
madina-studio/
├── server.js        ← backend (proxy לאנתרופיק)
├── package.json
└── public/
    └── index.html   ← כל האפליקציה
```
