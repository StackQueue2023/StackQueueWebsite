import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase,
  Search,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

export default function InternshipsPage() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedDomainModal, setSelectedDomainModal] = useState(null);

  const categories = [
    'All',
    'Software Development',
    'Web Development',
    'Artificial Intelligence',
    'Cloud & Infrastructure',
    'Security & Operations',
    'Data & Analytics',
    'Mobile Development',
    'Embedded Systems',
    'Design & Product',
    'Emerging Tech',
    'Quality Assurance'
  ];

  const modes = ['All', 'Hybrid', 'Online', 'Offline'];
  const durations = ['All', '15 Days', '1 Month', '2 Months', '3 Months', '6 Months'];

  const durationPills = [
    { label: 'All Durations', val: 'All', icon: '⚡' },
    { label: '15 Days Short-Term', val: '15 Days', icon: '⚡' },
    { label: '1 Month Track', val: '1 Month', icon: '📅' },
    { label: '2 Months Track', val: '2 Months', icon: '🚀' },
    { label: '3 Months Track', val: '3 Months', icon: '🎓' },
    { label: '6 Months Track', val: '6 Months', icon: '⭐' }
  ];

  useEffect(() => {
    async function fetchInternships() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedMode !== 'All') params.mode = selectedMode;
        if (selectedDuration !== 'All') params.duration = selectedDuration;

        const res = await api.get('/portal/internships', { params });
        if (res.data.success) {
          setDomains(res.data.data.domains || []);
        }
      } catch (err) {
        console.error('Error fetching internships:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInternships();
  }, [search, selectedCategory, selectedMode, selectedDuration]);

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner — Green + White Identity */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8 md:p-12 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl" />
        <div className="absolute inset-0 opacity-30 pointer-events-none rounded-3xl" style={{backgroundImage: 'radial-gradient(circle, #A7F3D0 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#F0FDF4'}} />
        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Industry Work Experience</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#111827] tracking-tight">
            Certified Internship Programs & Domains
          </h1>
          <p className="text-[#4B5563] max-w-2xl text-sm md:text-base leading-relaxed">
            Choose from 15 Days, 1 Month, 2 Months, 3 Months, or 6 Months certified internship tracks. Gain verifiable project experience with live mentorship.
          </p>
        </div>
      </div>

      {/* DURATION CATEGORY PILLS BAR */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter By Internship Duration Category:</span>
        </span>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {durationPills.map(pill => (
            <button
              key={pill.val}
              onClick={() => setSelectedDuration(pill.val)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                selectedDuration === pill.val
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by domain, tech stack (e.g. Java, Python, AWS, Flutter)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="text-xs font-bold text-slate-600">
            Showing <strong className="text-emerald-600">{domains.length}</strong> certified domains
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mode:</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {modes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {durations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {(search || selectedCategory !== 'All' || selectedMode !== 'All' || selectedDuration !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedMode('All');
                setSelectedDuration('All');
              }}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Internships Grid (50+ domains) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : domains.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No internship domains matching your search</h3>
          <p className="text-xs text-slate-500">Try selecting "All Durations" or resetting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((dom, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 hover:-translate-y-1 duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {dom.category}
                  </span>
                  <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full shadow-2xs">
                    {dom.stipend || 'Free / Stipend'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {dom.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Tech Stack: <strong className="text-slate-800">{dom.technology}</strong>
                </p>

                <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold pt-1">
                  <span className="flex items-center space-x-1 font-bold text-slate-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Duration: {dom.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Certified</span>
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(dom.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDomainModal(dom)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  to="/contact"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Domain Detail Modal */}
      {selectedDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  {selectedDomainModal.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedDomainModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDomainModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-500 text-[11px] block">Primary Technologies:</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedDomainModal.technology}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px] block">Internship Duration:</span>
                  <span className="font-bold text-slate-800">{selectedDomainModal.duration}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Fee / Stipend:</span>
                  <span className="font-bold text-emerald-700">{selectedDomainModal.stipend}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">Internship Highlights & Deliverables:</span>
              <ul className="space-y-1 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-world product development with git branch workflows.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Weekly code reviews from industry software leads.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verifiable internship completion certificate & letter of recommendation.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedDomainModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <Link
                to="/contact"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Submit Internship Application
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
