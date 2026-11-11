import React, { useState } from 'react';
import api from '../../api/client';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Inquiry submitted successfully!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does gamified coding work?',
      a: 'Instead of watching videos, you write code directly into live browser environments. Solving levels unlocks subsequent chapters, rewards XP, badges, and levels up your student rank.'
    },
    {
      q: 'Are tutors available for 1-on-1 code reviews?',
      a: 'Yes! Our faculty reviews homework tasks, monitors live sessions, and assigns personalized practice based on your weak and strong technical areas.'
    },
    {
      q: 'Can beginners start with zero programming background?',
      a: 'Absolutely. Our learning paths start at Level 1 (Fundamentals & Syntax) before advancing to complex Algorithms and Full Stack Architecture.'
    },
    {
      q: 'How does the 100 Interview Questions module prepare me for FAANG?',
      a: 'Each question mirrors authentic technical interview rounds with hidden test cases, progressive 3-stage clues, and a timed mock interview simulator.'
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#111827]">
      {/* Header */}
      <section className="bg-white py-16 border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E02B91] text-xs font-bold mb-4 shadow-2xs">
            <Mail className="w-4 h-4" />
            <span>Admissions &amp; Inquiries</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
            Contact <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">Stack Queue</span> Technologies
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#4B5563] max-w-xl mx-auto">
            Have questions about training courses, 50+ internship domains, or enterprise technology products? Reach out to our team.
          </p>
        </div>
      </section>

      {/* Main Content: Form & Institute Info */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Information (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-[#111827]">Company Headquarters</h2>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Visit our tech campus or connect with our academic advisors and project supervisors directly via phone or email.
              </p>

              <div className="space-y-4 text-sm text-[#4B5563]">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E02B91] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Campus Address</p>
                    <p className="text-xs text-[#6B7280]">Kondalampatty, Salem - 636010, Tamil Nadu, India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Telephone Lines</p>
                    <p className="text-xs text-[#6B7280]">+91 79049 25991 (Admissions & Support)</p>
                    <p className="text-xs text-[#6B7280]">+91 73053 70425 (Internship & Inquiries)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8B2BE2] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Official Inquiries</p>
                    <p className="text-xs text-[#6B7280]">stackqueue2023@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#111827] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Academic Office Hours</p>
                    <p className="text-xs text-[#6B7280]">Monday &ndash; Saturday: 9:00 AM &ndash; 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Box */}
            <div className="bg-pink-50/60 border border-pink-200/80 rounded-2xl p-6 text-[#111827]">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#E02B91]" />
                <span>Instant Student Access</span>
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Looking to start right away? Students can register for free with 1 click without waiting for an admissions callback.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <h2 className="text-xl font-bold text-[#111827] mb-1">Send Us a Message</h2>
              <p className="text-xs text-[#4B5563] mb-6">
                Fill out the form below. Messages are saved directly to our institute admin portal.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Course Admission / Batch Info"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your learning goals or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#E02B91] focus:bg-white resize-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold rounded-full text-xs shadow-md shadow-pink-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E02B91]">Frequently Asked</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
              Common Questions About STACK QUEUE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <h3 className="text-sm font-bold text-[#111827] flex items-start gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#E02B91] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
