# KAPILOTO — מערכת דוחות סושיאל מדיה

## פריסה ל-Vercel (הוראות שלב אחר שלב)

### שלב 1 — העלאת הקוד ל-GitHub

1. כנסי ל-[github.com](https://github.com) → **New repository** → שם: `kapiloto`
2. בטרמינל בתיקיית הפרויקט:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-username>/kapiloto.git
git push -u origin main
```

---

### שלב 2 — חיבור ל-Vercel + בסיס נתונים

1. כנסי ל-[vercel.com](https://vercel.com) → **Add New Project** → בחרי את ה-repo
2. לפני לחיצה על Deploy, עברי ל: **Storage** → **Create Database** → **Postgres**
3. שם: `kapiloto-db` → **Create**
4. Vercel תוסיף אוטומטית את `POSTGRES_URL` לסביבה — אין צורך בשום הגדרה ידנית

---

### שלב 3 — הגדרת Google Cloud (חינמי לחלוטין)

1. כנסי ל-[console.cloud.google.com](https://console.cloud.google.com)
2. **New Project** → שם: `kapiloto`
3. בתפריט הצד: **APIs & Services** → **Enable APIs**:
   - חפשי "Google Sheets API" → Enable
   - חפשי "Google Drive API" → Enable
4. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**
   - שם: `kapiloto-sync`
   - Role: Viewer
   - **Done**
5. לחצי על ה-Service Account שנוצר → **Keys** → **Add Key** → **JSON**
   - קובץ JSON יורד אוטומטית
6. פתחי את הקובץ בעורך טקסט → העתיקי את כל התוכן (שורה אחת)

---

### שלב 4 — משתני סביבה ב-Vercel

בהגדרות הפרויקט ב-Vercel → **Environment Variables**, הוסיפי:

| שם | ערך |
|----|-----|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | תוכן קובץ ה-JSON (הכל בשורה אחת) |
| `ADMIN_EMAIL` | `yaelkapiloto@gmail.com` |
| `SESSION_SECRET` | סיסמה אקראית — לפחות 32 תווים (צרי כאן: [passwordsgenerator.net](https://passwordsgenerator.net)) |
| `RESEND_API_KEY` | מ-[resend.com](https://resend.com) (חינמי עד 3,000 מיילים/חודש) |
| `EMAIL_FROM` | `noreply@kapiloto.com` (לאחר אימות דומיין ב-Resend) |
| `NEXT_PUBLIC_APP_URL` | `https://kapiloto.vercel.app` (ה-URL שלך ב-Vercel) |
| `CRON_SECRET` | סיסמה אקראית נוספת לאבטחת ה-cron |

---

### שלב 5 — יצירת טבלאות הנתונים

לאחר שה-Deploy הראשון עלה, הריצי בטרמינל:

```bash
# ודאי שהsource ל-POSTGRES_URL_NON_POOLING מוכנס ב-.env.local
npx drizzle-kit generate
npx drizzle-kit migrate
```

או הריצי מ-Vercel CLI:
```bash
npx vercel env pull .env.local
npx drizzle-kit migrate
```

---

### שלב 6 — שיתוף קבצי גוגל עם ה-Service Account

לאחר יצירת ה-Service Account, יש לו כתובת אימייל בצורת:
`kapiloto-sync@kapiloto-XXXXX.iam.gserviceaccount.com`

**לכל לקוח** — שתפי עם אימייל זה:
- את ה-Google Sheet שלו (צופה בלבד)
- את תיקיית ה-Drive שלו (צופה בלבד)

---

### פיתוח מקומי

```bash
# התקנה
npm install

# העתיקי את קבצי הסביבה
cp .env.local.example .env.local
# מלאי את הערכים ב-.env.local

# הרצת שרת פיתוח
npm run dev
```

פתחי [http://localhost:3000](http://localhost:3000) — מפנה אוטומטית ל-`/admin/login`.
