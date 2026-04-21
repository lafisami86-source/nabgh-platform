import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => axios.get('/api/progress').then(r => r.data.data),
    staleTime: 30000,
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => axios.get('/api/users/me').then(r => r.data.data),
    staleTime: 60000,
  });
}

export function useLeaderboard(type = 'global', period = 'all-time') {
  return useQuery({
    queryKey: ['leaderboard', type, period],
    queryFn: () => axios.get(`/api/leaderboard?type=${type}&period=${period}`).then(r => r.data.data),
    staleTime: 60000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => axios.get('/api/notifications').then(r => r.data.data),
    refetchInterval: 30000,
  });
}

export function useSubjects(grade?: string) {
  return useQuery({
    queryKey: ['subjects', grade],
    queryFn: () => axios.get(`/api/subjects${grade ? `?grade=${grade}` : ''}`).then(r => r.data.data),
    staleTime: 300000,
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => axios.get(`/api/lessons/${lessonId}`).then(r => r.data.data),
    enabled: !!lessonId,
    staleTime: 300000,
  });
}

export function useExercise(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => axios.get(`/api/exercises/${exerciseId}`).then(r => r.data.data),
    enabled: !!exerciseId,
    staleTime: 300000,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => axios.get('/api/analytics/recommendations').then(r => r.data.data),
    staleTime: 120000,
  });
}

export function useAwardXP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
      axios.post('/api/gamification/xp', { amount, reason }).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user'] }); qc.invalidateQueries({ queryKey: ['progress'] }); },
  });
}
