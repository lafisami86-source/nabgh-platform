'use client';
import { useState, useEffect } from 'react';
import { Avatar, Badge, Card, Button, Input } from '@/components/ui/index';
import { getLevel, getLevelIcon, formatNumber } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = { student: 'طالب', teacher: 'معلم', parent: 'ولي أمر', admin: 'مدير' };
const ROLE_COLORS: Record<string, any> = { student: 'primary', teacher: 'success', parent: 'warning', admin: 'error' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    fetch('/api/admin/users?' + new URLSearchParams({ search, role: roleFilter, page: String(page) }))
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); setLoading(false); })
      .catch(() => {
        // Fallback: load from existing user endpoint
        fetch('/api/leaderboard?limit=100').then(r => r.json()).then(d => {
          if (d.success) setUsers(d.data);
          setLoading(false);
        });
      });
  }, [search, roleFilter, page]);

  const filtered = users.filter(u => {
    if (search && !u.displayName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 font-cairo">👥 إدارة المستخدمين</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} مستخدم</p>
        </div>
        <Button size="sm" variant="outline">+ مستخدم جديد</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input placeholder="🔍 بحث بالاسم..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">كل الأدوار</option>
          <option value="student">طلاب</option>
          <option value="teacher">معلمون</option>
          <option value="parent">أولياء أمور</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { role: 'student', label: 'طلاب', icon: '🎓', color: 'text-blue-600 bg-blue-50' },
          { role: 'teacher', label: 'معلمون', icon: '👩‍🏫', color: 'text-green-600 bg-green-50' },
          { role: 'parent', label: 'أولياء', icon: '👨‍👧', color: 'text-amber-600 bg-amber-50' },
          { role: 'all', label: 'الكل', icon: '👥', color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <Card key={s.role} className="p-4 text-center">
            <div className={`text-2xl mb-1 mx-auto w-10 h-10 rounded-xl flex items-center justify-center ${s.color.split(' ')[1]}`}>{s.icon}</div>
            <div className={`text-xl font-black font-numbers ${s.color.split(' ')[0]}`}>
              {s.role === 'all' ? users.length : users.filter((u: any) => u.role === s.role).length}
            </div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['المستخدم', 'الدور', 'XP', 'الدروس', 'السلسلة', 'آخر دخول', 'الإجراءات'].map(h => (
                    <th key={h} className="text-right text-xs font-bold text-slate-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.slice(0, PER_PAGE).map((u: any) => {
                  const level = getLevel(u.xp || u.gamification?.xp || 0);
                  return (
                    <tr key={u.userId || u._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar || u.profile?.avatar} name={u.displayName || u.profile?.displayName || '?'} size="sm" level={level} />
                          <div>
                            <p className="font-medium text-sm text-slate-800">{u.displayName || u.profile?.displayName}</p>
                            <p className="text-xs text-slate-400">{u.country || u.profile?.country || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={ROLE_COLORS[u.role] || 'gray'} size="xs">{ROLE_LABELS[u.role] || u.role || 'طالب'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-primary-600 font-numbers">{formatNumber(u.xp || u.gamification?.xp || 0)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-numbers">{u.gamification?.totalLessonsCompleted || '—'}</td>
                      <td className="px-4 py-3">
                        {(u.streak || u.gamification?.streak?.current) > 0 ? (
                          <span className="text-orange-500 font-bold text-sm">🔥 {u.streak || u.gamification?.streak?.current}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">—</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button className="text-xs text-primary-600 border border-primary-100 rounded-lg px-2 py-1 hover:bg-primary-50">عرض</button>
                          <button className="text-xs text-red-500 border border-red-100 rounded-lg px-2 py-1 hover:bg-red-50">تعطيل</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">{filtered.length} نتيجة</span>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                <Button size="xs" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * PER_PAGE >= filtered.length}>التالي</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
