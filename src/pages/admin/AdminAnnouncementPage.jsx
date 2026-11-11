import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Megaphone, Send, Clock, CheckCircle2, AlertCircle, Users, Mail } from 'lucide-react';

export default function AdminAnnouncementPage() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('General Announcement');
  const [announcementDate, setAnnouncementDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('Students + Tutors');
  
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/announcements/history');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load announcement history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Title and Message are required.');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await api.post('/announcements/send', {
        title: title.trim(),
        type,
        announcementDate,
        message: message.trim(),
        recipientType
      });

      if (res.data.success) {
        setSendResult(res.data);
        setTitle('');
        setMessage('');
        loadHistory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending announcement.');
    } finally {
      setSending(false);
    }
  };

  // Preset shortcut for Sunday Leave / Holidays
  const handleApplyPreset = (presetType) => {
    if (presetType === 'Sunday Leave') {
      setType('Sunday Leave');
      setTitle('Sunday Weekly Leave Notice');
      setMessage('Tomorrow is Sunday and regular training sessions will not be conducted. Regular sessions will resume on Monday.');
      setRecipientType('Students + Tutors');
    } else if (presetType === 'Holiday') {
      setType('Holiday');
      setTitle('Upcoming Institute Holiday Notice');
      setMessage('Please be informed that training sessions will remain closed on the specified holiday date. Happy Holidays!');
      setRecipientType('Students + Tutors');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto px-4">
      {/* Pink-to-Violet Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <Megaphone className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Institute Email Announcement System
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Broadcast Announcements
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Send instant broadcast emails and notifications to all enrolled students and assigned tutors. Supports custom notices, Sunday holidays, exam schedules, and emergency updates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Announcement Form */}
        <div className="md:col-span-1 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Send className="w-4 h-4 text-pink-600" />
              <span>Create Announcement</span>
            </h2>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Quick Presets:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('Sunday Leave')}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold transition cursor-pointer"
              >
                + Sunday Leave
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('Holiday')}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-[11px] font-bold transition cursor-pointer"
              >
                + Holiday Notice
              </button>
            </div>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Announcement Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gandhi Jayanti Holiday Notice"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Announcement Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
              >
                <option value="General Announcement">General Announcement</option>
                <option value="Holiday">Holiday</option>
                <option value="Sunday Leave">Sunday Leave</option>
                <option value="Training Update">Training Update</option>
                <option value="College Notice">College Notice</option>
                <option value="Exam / Assessment">Exam / Assessment</option>
                <option value="Event">Event</option>
                <option value="Emergency Notice">Emergency Notice</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Announcement Date *</label>
              <input
                type="date"
                required
                value={announcementDate}
                onChange={(e) => setAnnouncementDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 font-mono bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Recipients *</label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
              >
                <option value="Students + Tutors">Students + Tutors (All)</option>
                <option value="All Students">All Students Only</option>
                <option value="All Tutors">All Tutors Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">Message Content *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your detailed email message here..."
                className="w-full p-3 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            {sendResult && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Announcement Broadcast Completed!</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 space-y-0.5 pt-1">
                  <p>Total Recipients: {sendResult.data?.totalRecipients}</p>
                  <p>Successfully Sent: {sendResult.data?.successfullySent}</p>
                  {sendResult.data?.failedCount > 0 && <p className="text-rose-600">Failed: {sendResult.data?.failedCount}</p>}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{sending ? 'Sending Emails...' : 'Send Broadcast Email →'}</span>
            </button>
          </form>
        </div>

        {/* Announcement History */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>Announcement History ({history.length})</span>
            </h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Announcements Sent Yet</h3>
              <p className="text-xs text-slate-500">Previously broadcasted announcements will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => (
                <div key={item._id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-pink-100 text-pink-800 border border-pink-200">
                          {item.type}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{item.announcementDate}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                      item.status === 'Sent' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                    <span>Recipients: <strong>{item.recipientType}</strong> ({item.recipientCount} targets)</span>
                    <span className="text-emerald-700 font-bold">Sent: {item.successfullySent}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
