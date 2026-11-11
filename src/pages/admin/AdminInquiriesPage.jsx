import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Mail,
  Search,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare
} from 'lucide-react';

export default function AdminInquiriesPage() {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contact/admin/messages?status=${statusFilter}`);
      if (res.data.success) {
        setMessages(res.data.data);
        setCounts(res.data.counts || { total: res.data.data.length, unread: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  const handleSelectMessage = async (msg) => {
    setActiveMessage(msg);
    setReplyText(msg.adminReply || '');
    setFeedback('');

    // If unread, mark as read
    if (msg.status === 'UNREAD') {
      try {
        await api.patch(`/contact/admin/messages/${msg._id}`, { status: 'READ' });
        msg.status = 'READ';
        loadMessages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeMessage || !replyText.trim()) return;

    setReplying(true);
    setFeedback('');
    try {
      const res = await api.patch(`/contact/admin/messages/${activeMessage._id}`, {
        adminReply: replyText,
        status: 'REPLIED'
      });
      if (res.data.success) {
        setFeedback('Reply saved and inquiry marked as REPLIED!');
        loadMessages();
      }
    } catch (err) {
      setFeedback('Failed to save reply.');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/contact/admin/messages/${id}`);
      if (activeMessage?._id === id) setActiveMessage(null);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Admissions & Contact CRM</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student & Public Inquiries</h1>
          <p className="text-xs text-slate-500">
            Review questions submitted by prospective students, parents, and college partners.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs text-slate-500 block">Total</span>
            <span className="text-sm font-bold text-slate-900">{counts.total}</span>
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 shadow-sm text-center">
            <span className="text-xs text-amber-700 block">Unread</span>
            <span className="text-sm font-bold text-amber-800">{counts.unread}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['ALL', 'UNREAD', 'READ', 'REPLIED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Messages Grid: List (5 cols) & Detail Viewer (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100 overflow-y-auto max-h-[650px]">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading inquiries...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No inquiries found matching this filter.</div>
          ) : (
            filtered.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                  activeMessage?._id === msg._id
                    ? 'bg-purple-50/80 border border-purple-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-xs text-slate-900 truncate">{msg.name}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      msg.status === 'UNREAD'
                        ? 'bg-amber-100 text-amber-800'
                        : msg.status === 'REPLIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate mb-1">{msg.subject}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                  <span>{msg.email}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inquiry Detail & Reply Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {activeMessage ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeMessage.subject}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-bold text-slate-800">{activeMessage.name}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {activeMessage.email}
                    </span>
                    {activeMessage.phone && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {activeMessage.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(activeMessage._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Inquiry Message Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Message Content</p>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{activeMessage.message}</p>
                <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Received on {new Date(activeMessage.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Reply Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Academic Team Reply / Notes</span>
                  </h3>
                  {activeMessage.repliedAt && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Replied on {new Date(activeMessage.repliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {feedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feedback}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your email reply or internal academic counselor notes..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{replying ? 'Saving...' : 'Save Reply & Mark Handled'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
              <Mail className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-semibold">Select an inquiry from the left to view details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
