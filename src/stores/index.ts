import { create } from 'zustand';

// ─── UI Store ────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  xpPopups: { id: string; amount: number; x: number; y: number }[];
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  showXPPopup: (amount: number, x?: number, y?: number) => void;
  removeXPPopup: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  xpPopups: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  showXPPopup: (amount, x = 50, y = 50) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ xpPopups: [...s.xpPopups, { id, amount, x, y }] }));
    setTimeout(() => set(s => ({ xpPopups: s.xpPopups.filter(p => p.id !== id) })), 1500);
  },
  removeXPPopup: (id) => set(s => ({ xpPopups: s.xpPopups.filter(p => p.id !== id) })),
}));

// ─── Exercise Store ───────────────────────────────────────────────
interface ExerciseState {
  currentExerciseId: string | null;
  currentQuestion: number;
  answers: Record<number, { questionId: string; answer: unknown; timeSpent: number; hintsUsed: number }>;
  hintsUsed: number;
  timeStarted: number | null;
  setCurrentExercise: (id: string) => void;
  setAnswer: (index: number, questionId: string, answer: unknown, timeSpent?: number, hints?: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  useHint: () => void;
  reset: () => void;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  currentExerciseId: null,
  currentQuestion: 0,
  answers: {},
  hintsUsed: 0,
  timeStarted: null,
  setCurrentExercise: (id) => set({ currentExerciseId: id, currentQuestion: 0, answers: {}, hintsUsed: 0, timeStarted: Date.now() }),
  setAnswer: (index, questionId, answer, timeSpent = 0, hints = 0) =>
    set(s => ({ answers: { ...s.answers, [index]: { questionId, answer, timeSpent, hintsUsed: hints } } })),
  nextQuestion: () => set(s => ({ currentQuestion: s.currentQuestion + 1 })),
  prevQuestion: () => set(s => ({ currentQuestion: Math.max(0, s.currentQuestion - 1) })),
  useHint: () => set(s => ({ hintsUsed: s.hintsUsed + 1 })),
  reset: () => set({ currentExerciseId: null, currentQuestion: 0, answers: {}, hintsUsed: 0, timeStarted: null }),
}));

// ─── Gamification Store ────────────────────────────────────────────
interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  pendingXP: number;
  setXP: (xp: number) => void;
  setLevel: (level: number) => void;
  addXP: (amount: number) => void;
  setStreak: (streak: number) => void;
  addBadge: (badgeId: string) => void;
  flushPendingXP: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  pendingXP: 0,
  setXP: (xp) => set({ xp }),
  setLevel: (level) => set({ level }),
  addXP: (amount) => set(s => ({ xp: s.xp + amount, pendingXP: s.pendingXP + amount })),
  setStreak: (streak) => set({ streak }),
  addBadge: (badgeId) => set(s => ({ badges: [...s.badges, badgeId] })),
  flushPendingXP: () => set({ pendingXP: 0 }),
}));

// ─── Lesson Store ─────────────────────────────────────────────────
interface LessonState {
  currentLessonId: string | null;
  phase: 'intro' | 'content' | 'summary' | 'complete';
  currentSlide: number;
  videoProgress: number;
  completedCheckpoints: number[];
  notes: string;
  setLesson: (id: string) => void;
  setPhase: (phase: LessonState['phase']) => void;
  setSlide: (slide: number) => void;
  setVideoProgress: (progress: number) => void;
  completeCheckpoint: (index: number) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentLessonId: null,
  phase: 'intro',
  currentSlide: 0,
  videoProgress: 0,
  completedCheckpoints: [],
  notes: '',
  setLesson: (id) => set({ currentLessonId: id, phase: 'intro', currentSlide: 0, videoProgress: 0, completedCheckpoints: [], notes: '' }),
  setPhase: (phase) => set({ phase }),
  setSlide: (slide) => set({ currentSlide: slide }),
  setVideoProgress: (progress) => set({ videoProgress: progress }),
  completeCheckpoint: (index) => set(s => ({ completedCheckpoints: [...s.completedCheckpoints, index] })),
  setNotes: (notes) => set({ notes }),
  reset: () => set({ currentLessonId: null, phase: 'intro', currentSlide: 0, videoProgress: 0, completedCheckpoints: [], notes: '' }),
}));
