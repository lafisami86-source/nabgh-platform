import axios from 'axios';

const api = axios.create({ baseURL: '' });

// ─── Auth ─────────────────────────────────────────────────────────
export const authService = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string; country: string }) =>
    api.post('/api/register', data).then(r => r.data),
};

// ─── User ─────────────────────────────────────────────────────────
export const userService = {
  getMe: () => api.get('/api/users/me').then(r => r.data.data),
  updateMe: (data: any) => api.put('/api/users/me', data).then(r => r.data.data),
  getUser: (id: string) => api.get(`/api/users/${id}`).then(r => r.data.data),
};

// ─── Subjects ─────────────────────────────────────────────────────
export const subjectService = {
  list: (params?: { grade?: string; curriculumId?: string }) =>
    api.get('/api/subjects', { params }).then(r => r.data.data),
  get: (id: string) => api.get(`/api/subjects/${id}`).then(r => r.data.data),
};

// ─── Units ────────────────────────────────────────────────────────
export const unitService = {
  list: (subjectId: string) => api.get('/api/units', { params: { subjectId } }).then(r => r.data.data),
  get: (id: string) => api.get(`/api/units/${id}`).then(r => r.data.data),
};

// ─── Lessons ──────────────────────────────────────────────────────
export const lessonService = {
  list: (params?: { unitId?: string; subjectId?: string }) =>
    api.get('/api/lessons', { params }).then(r => r.data.data),
  get: (id: string) => api.get(`/api/lessons/${id}`).then(r => r.data.data),
  complete: (id: string, timeSpent: number) =>
    api.post(`/api/lessons/${id}/complete`, { timeSpent }).then(r => r.data),
  rate: (id: string, rating: number) =>
    api.post(`/api/lessons/${id}/rate`, { rating }).then(r => r.data),
  create: (data: any) => api.post('/api/lessons', data).then(r => r.data.data),
};

// ─── Exercises ────────────────────────────────────────────────────
export const exerciseService = {
  list: (params?: { lessonId?: string; subjectId?: string }) =>
    api.get('/api/exercises', { params }).then(r => r.data.data),
  get: (id: string) => api.get(`/api/exercises/${id}`).then(r => r.data.data),
  submit: (id: string, answers: any[], timeSpentMinutes: number) =>
    api.post(`/api/exercises/${id}/submit`, { answers, timeSpentMinutes }).then(r => r.data),
  create: (data: any) => api.post('/api/exercises', data).then(r => r.data.data),
};

// ─── Progress ─────────────────────────────────────────────────────
export const progressService = {
  get: (userId?: string) => api.get('/api/progress', { params: userId ? { userId } : {} }).then(r => r.data.data),
};

// ─── Analytics ────────────────────────────────────────────────────
export const analyticsService = {
  getSkills: () => api.get('/api/analytics/skills').then(r => r.data.data),
  getRecommendations: () => api.get('/api/analytics/recommendations').then(r => r.data.data),
};

// ─── Gamification ─────────────────────────────────────────────────
export const gamificationService = {
  awardXP: (amount: number, reason: string) =>
    api.post('/api/gamification/xp', { amount, reason }).then(r => r.data.data),
  getBadges: () => api.get('/api/gamification/badges').then(r => r.data.data),
  updateStreak: () => api.post('/api/gamification/streak').then(r => r.data.data),
};

// ─── Leaderboard ──────────────────────────────────────────────────
export const leaderboardService = {
  get: (type = 'global', period = 'all-time', limit = 50) =>
    api.get('/api/leaderboard', { params: { type, period, limit } }).then(r => r.data.data),
};

// ─── Challenges ───────────────────────────────────────────────────
export const challengeService = {
  getDaily: () => api.get('/api/challenges/daily').then(r => r.data.data),
  list: (type?: string) => api.get('/api/challenges', { params: type ? { type } : {} }).then(r => r.data.data),
  get: (id: string) => api.get(`/api/challenges/${id}`).then(r => r.data.data),
  join: (id: string) => api.post(`/api/challenges/${id}/join`).then(r => r.data),
};

// ─── AI ───────────────────────────────────────────────────────────
export const aiService = {
  chat: (message: string, chatId?: string, context?: any) =>
    api.post('/api/ai/chat', { message, chatId, context }).then(r => r.data),
  explain: (concept: string, grade: string, subject: string) =>
    api.post('/api/ai/explain', { concept, grade, subject }).then(r => r.data),
  summarize: (lessonId: string) =>
    api.post('/api/ai/summarize', { lessonId }).then(r => r.data),
};

// ─── Notifications ────────────────────────────────────────────────
export const notificationService = {
  get: () => api.get('/api/notifications').then(r => r.data.data),
  markRead: (id: string) => api.put(`/api/notifications/${id}`).then(r => r.data),
  delete: (id: string) => api.delete(`/api/notifications/${id}`).then(r => r.data),
};

// ─── Search ───────────────────────────────────────────────────────
export const searchService = {
  search: (q: string, type?: string) =>
    api.get('/api/search', { params: { q, type } }).then(r => r.data.data),
};
