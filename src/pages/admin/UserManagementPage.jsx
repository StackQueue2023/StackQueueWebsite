import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users } from 'lucide-react';

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const cachedUsers = api.peekCache?.('/admin/users', roleFilter ? { role: roleFilter } : {});
  const [users, setUsers] = useState(cachedUsers?.data || []);
  const [loading, setLoading] = useState(!cachedUsers);

  useEffect(() => {
    const cached = api.peekCache?.('/admin/users', roleFilter ? { role: roleFilter } : {});
    loadUsers(!!cached);
  }, [roleFilter]);

  const loadUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: roleFilter ? { role: roleFilter } : {}
      });
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">Admin</span>;
      case 'trainer':
      case 'tutor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Trainer</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">Student</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Identity & Access Directory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institute User Management</h1>
          <p className="text-xs text-slate-600 font-medium">
            Account governance, role allocation, and status tracking for students, trainers, and administrators.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="relative z-10 flex items-center space-x-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl text-xs shadow-xs">
          {[
            { label: 'All Roles', value: '' },
            { label: 'Students', value: 'student' },
            { label: 'Trainers', value: 'trainer' },
            { label: 'Admins', value: 'admin' }
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                roleFilter === r.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold text-center">Role</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading user records...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center font-bold text-xs text-purple-700">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
