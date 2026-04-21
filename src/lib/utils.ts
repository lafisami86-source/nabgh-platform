import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'م';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'ك';
  return n.toString();
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} ساعة و ${m} دقيقة` : `${h} ساعة`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 7) return formatDate(date);
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (mins > 0) return `منذ ${mins} دقيقة`;
  return 'الآن';
}

export function getLevel(xp: number): number {
  const thresholds = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level: number): string {
  const names = ['مبتدئ', 'متعلم', 'دارس', 'متقدم', 'متميز', 'نابغة', 'عبقري', 'أسطورة'];
  return names[level - 1] || 'أسطورة';
}

export function getLevelIcon(level: number): string {
  const icons = ['🌱', '🌿', '🌳', '⭐', '🌟', '👑', '💎', '🏆'];
  return icons[level - 1] || '🏆';
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const thresholds = [0, 500, 2000, 5000, 10000, 20000, 40000, 70000, 999999];
  const level = getLevel(xp);
  const current = thresholds[level - 1];
  const next = thresholds[level];
  const percent = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  return { current: xp - current, next: next - current, percent };
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'ممتاز', color: 'text-green-600' };
  if (score >= 80) return { label: 'جيد جداً', color: 'text-blue-600' };
  if (score >= 70) return { label: 'جيد', color: 'text-yellow-600' };
  if (score >= 60) return { label: 'مقبول', color: 'text-orange-600' };
  return { label: 'يحتاج مراجعة', color: 'text-red-600' };
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
