import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

import { DOMAIN_FILTER_OPTIONS } from '../../constants/domains';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const durations = ['All', '8 Weeks', '10 Weeks', '12 Weeks', '14 Weeks', '16 Weeks'];

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedDomain !== 'All') params.domain = selectedDomain;
        if (selectedLevel !== 'All') params.level = selectedLevel;
        if (selectedDuration !== 'All') params.duration = selectedDuration;

        const res = await api.get('/portal/courses', { params });
        if (res.data.success) {
          setCourses(res.data.data.courses || []);
          if (Array.isArray(res.data.data.domains) && res.data.data.domains.length > 0) {
            const domainNames = ['All', ...res.data.data.domains.map(d => d.name)];
            setDomains(domainNames);
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [search, selectedDomain, selectedLevel, selectedDuration]);

  return (
    <div className="space-y-10 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner — Light Blue Dotted Hero + Purple-Pink Top Accent Line */}
      <div className="bg-course-dots rounded-3xl border border-blue-200/70 shadow-sm relative overflow-hidden">
        <div className="h-1.5 w-full accent-line-course" />
        <div className="p-8 md:p-12 space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-100/80 border border-purple-200 rounded-full text-xs font-bold uppercase tracking-wider text-purple-700">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Industry Curriculum</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">
            Explore Our 50+ Technology Courses
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
            From Java Full Stack to Generative AI, Cloud DevOps, and Data Science. Every course includes 100% practical concept tasks and certified internship opportunities.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, technologies, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs font-bold text-slate-600">
            Showing <strong className="text-[#0F172A]">{courses.length}</strong> available courses
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Associated Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-slate-800"
            >
              {domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs font-semibold bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="text-xs font-semibold bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {durations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {(search || selectedDomain !== 'All' || selectedLevel !== 'All' || selectedDuration !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDomain('All');
                setSelectedLevel('All');
                setSelectedDuration('All');
              }}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <BookOpen className="w-10 h-10 text-blue-500 mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No courses matching your search criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between space-y-4 hover:-translate-y-1 duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {course.domain}
                  </span>
                  {course.isTrending && (
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Trending
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-[#0F172A] leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold pt-1">
                  <span className="flex items-center space-x-1 text-blue-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{course.duration}</span>
                  </span>
                  <span>•</span>
                  <span className="text-blue-700">{course.level}</span>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(course.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 bg-white text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCourseModal(course)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>

                <Link
                  to="/contact"
                  className="bg-blue-50 px-3.5 py-1.5 text-blue-700 font-bold text-xs rounded-xl shadow-xs transition border border-blue-600 hover:border-blue-700"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded">
                  {selectedCourseModal.domain}
                </span>
                <h3 className="text-xl font-black text-blue-700 mt-1">
                  {selectedCourseModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="p-1 text-blue-600 hover:text-blue-800 rounded-lg bg-white border border-blue-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {selectedCourseModal.description}
            </p>

            <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Duration</span>
                <span className="font-extrabold text-blue-700">{selectedCourseModal.duration}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Level</span>
                <span className="font-extrabold text-blue-700">{selectedCourseModal.level}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Rating</span>
                <span className="font-extrabold text-blue-700">{selectedCourseModal.rating || '4.9'} / 5.0</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Enrolled Students</span>
                <span className="font-extrabold text-blue-700">{selectedCourseModal.studentsEnrolled}+</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-blue-700 block">Core Skills & Curriculum Highlights:</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedCourseModal.skills || []).map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="px-4 py-2 bg-blue-50 border border-blue-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <Link
                to="/contact"
                className="bg-blue-50 px-5 py-2 text-blue-700 text-xs font-bold rounded-xl shadow-xs transition border border-blue-600 hover:border-blue-700"
              >
                Request Syllabus & Enroll
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
