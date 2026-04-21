# 🎓 نَبَغ - NABGH Educational Platform

> منصة تعليمية ذكية عربية شاملة | Smart Arabic Educational Platform

**تعلّم بذكاء، تفوّق بتميّز**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.local` and fill in your values:
```bash
# Required
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_32_char_secret
OPENAI_API_KEY=sk-your-openai-key  # for AI tutor

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Seed Database
```bash
npm run dev
# then visit: http://localhost:3000/api/seed
```

### 4. Login with Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| 👨‍🎓 Student | student@nabgh.com | Student@123 |
| 👩‍🏫 Teacher | teacher@nabgh.com | Teacher@123 |
| 🔐 Admin | admin@nabgh.com | Admin@123456 |

---

## ✅ Built Features

### 🎓 Student Experience
- **Dashboard** — XP bar, streak tracker, daily goal, subject progress
- **Subjects & Units** — full curriculum tree with progress tracking  
- **Lesson Viewer** — video player, interactive slides, article content, checkpoints
- **Exercise Engine** — 6+ question types (MCQ, T/F, fill-blank, ordering, matching, short answer)
- **Real Grading** — instant feedback, explanations, partial scoring
- **AI Tutor (نبوغ)** — chat interface with OpenAI GPT-4o-mini
- **Leaderboard** — global rankings with podium
- **Progress Analytics** — skill map, weekly chart, streak, badges

### 👩‍🏫 Teacher Experience
- Dashboard with student overview
- Lesson management (CRUD)
- Exercise builder
- Student tracking

### 🏆 Gamification System
- XP points for every action
- 8 levels (مبتدئ → أسطورة)
- 13+ badges with unlock animations
- Daily streak with freeze mechanic
- Spaced repetition for flashcards

### 🤖 Adaptive Learning Engine
- Skill map per subject
- Daily activity recording
- Smart recommendations
- Weak skill detection

### 🔐 Auth & Security
- Email/password registration
- Google OAuth
- JWT sessions (30 days)
- Role-based access (student/teacher/parent/admin)
- Password hashing with bcrypt

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v5 |
| AI | OpenAI GPT-4o-mini |
| State | React Query + Zustand |
| Animations | CSS Animations |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/auth/          # Login, Register
│   ├── (student)/student/    # Dashboard, Subjects, Lesson, Exercise, AI, Progress, Leaderboard
│   ├── (teacher)/teacher/    # Teacher dashboard
│   ├── (onboarding)/         # 5-step onboarding
│   └── api/                  # 25+ API endpoints
├── models/                   # MongoDB schemas (User, Content, Analytics)
├── lib/                      # auth, mongodb, gamification, adaptive-engine, utils
├── components/               # UI, layout, lesson, exercise, gamification
└── data/seed/                # Complete seed with Saudi curriculum
```

---

## 🌐 API Endpoints

```
POST /api/register              Register new user
POST /api/auth/[...nextauth]    Login / Google OAuth
GET  /api/users/me              Get current user
PUT  /api/users/me              Update profile / complete onboarding
GET  /api/subjects?grade=       List subjects
GET  /api/units?subjectId=      List units
GET  /api/lessons?unitId=       List lessons
GET  /api/lessons/[id]          Get lesson detail
POST /api/lessons/[id]/complete Mark lesson complete → award XP
POST /api/lessons/[id]/rate     Rate lesson
GET  /api/exercises/[id]        Get exercise (shuffled, safe)
POST /api/exercises/[id]/submit Grade submission → full results
GET  /api/progress              Get user progress
GET  /api/leaderboard           Global rankings
POST /api/ai/chat               Chat with نبوغ AI tutor
GET  /api/notifications         Get notifications
GET  /api/search?q=             Search lessons & subjects
GET  /api/seed                  Seed demo data (dev only)
```

---

## 🚀 Deployment (Vercel)

```bash
# 1. Push to GitHub
# 2. Connect to Vercel
# 3. Add environment variables
# 4. Deploy!
```

MongoDB Atlas + Vercel = production ready in minutes.

---

## 📈 Roadmap

- [ ] Parent dashboard
- [ ] Challenges & tournaments
- [ ] Mobile app (React Native)
- [ ] More curricula (Egypt, UAE, Jordan)
- [ ] Video upload (Cloudinary/Mux)
- [ ] Real-time features (Socket.io)
- [ ] Payment integration (Stripe + Moyasar)
- [ ] Push notifications (FCM)

---

**Built with ❤️ for Arab learners**
