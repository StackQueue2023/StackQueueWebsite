import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  BookOpen,
  Briefcase,
  Code2,
  Rocket,
  ArrowRight,
  Clock,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  Package,
  Github
} from 'lucide-react';

import OffersCarousel from '../../components/common/OffersCarousel';
import PublicProjectDetailModal from '../../components/projects/PublicProjectDetailModal';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const res = await api.get('/portal/homepage-data');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching portal homepage data:', err);
      }
    }
    fetchHomepageData();
  }, []);

  const statistics = data?.statistics || {
    coursesCount: '50+',
    internshipDomainsCount: '50+',
    studentsTrained: '1,250+',
    studentsLearning: '450+',
    productsDeveloped: '28+',
    yearsExperience: '10+',
    industryProjects: '120+'
  };

  const featuredCourses = data?.featuredCourses || [];
  const trendingCourses = data?.trendingCourses || [];
  const featuredInternships = data?.featuredInternships || [];
  const products = data?.products || [];
  const specialOffers = data?.specialOffers || [];
  const whyChooseUs = data?.whyChooseUs || [];
  const learningJourney = data?.learningJourney || [];

  return (
    <div className="space-y-4 pb-24 animate-fade-in overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — 2-COLUMN LAYOUT
          Left: Hero content | Right: Auto-rotating Offers Carousel
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3  sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Hero Content */}
          <div className="space-y-7 animate-slide-in-left">
            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight leading-[1.1]">
                Build Your IT Career with{' '}
                <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">
                  STACK QUEUE
                </span>{' '}
                <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">
                  EDUCATION
                </span>
              </h1>
              <p className="text-base sm:text-lg font-mono text-[#4B5563] font-semibold tracking-wide">
                "Learn. Practice. Build. Intern. Grow."
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-xl">
              Learn industry-ready technologies through structured courses, practical tasks and hands-on projects.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/courses"
                className="px-8 py-3.5 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold text-sm rounded-full shadow-md shadow-pink-500/20 hover:shadow-lg transition flex items-center gap-2"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/internships"
                className="px-7 py-3.5 bg-white hover:bg-slate-50 text-[#111827] hover:text-[#E02B91] hover:border-pink-300 font-bold text-sm rounded-full border border-[#E5E7EB] shadow-sm transition flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4 text-[#E02B91]" />
                <span>Start Learning</span>
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-white text-[#4B5563] hover:text-[#111827] font-semibold text-sm rounded-full border border-[#E5E7EB] hover:border-slate-400 transition"
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs font-semibold text-[#4B5563]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Credentials
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B2BE2]" />
                Sequential Learning System
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#E02B91]" />
                ISO Certified Curriculum
              </span>
            </div>
          </div>

          {/* RIGHT — Special Offers Carousel */}
          <div className="animate-slide-in-right">
            <div className="h-[360px] sm:h-[380px] relative">
              <OffersCarousel offers={specialOffers} />
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          3. COMPANY NUMBERS & SCALE — Asymmetric Bento Layout
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-[#E02B91] border border-pink-200 shadow-sm">
            Proven Industry Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111827]">
            Company Numbers & Scale
          </h2>
          <p className="text-sm text-[#4B5563]">
            Real metrics driven by active student enrollments, product deployments, and institutional partnerships.
          </p>
        </div>

        {/* Uniform 6-Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Stat 1: 50+ Courses */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-pink-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-pink-50 text-[#E02B91] flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent font-mono tracking-tight">
              <AnimatedCounter value={statistics.coursesCount || '50+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Courses</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">Full curriculum</span>
          </div>

          {/* Stat 2: 50+ Internship Domains */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-purple-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-[#8B2BE2] flex items-center justify-center mb-2">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#8B2BE2] font-mono tracking-tight">
              <AnimatedCounter value={statistics.internshipDomainsCount || '50+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Internship Domains</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">Certified programs</span>
          </div>

          {/* Stat 3: Students Trained */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-pink-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-pink-50 text-[#E02B91] flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#E02B91] font-mono tracking-tight">
              <AnimatedCounter value={statistics.studentsTrained || '1,250+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Students Trained</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">Engineers &amp; fellows</span>
          </div>

          {/* Stat 4: Products Developed */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-purple-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-[#8B2BE2] flex items-center justify-center mb-2">
              <Rocket className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#111827] font-mono tracking-tight">
              <AnimatedCounter value={statistics.productsDeveloped || '28+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Products Developed</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">Live applications</span>
          </div>

          {/* Stat 5: Years of Experience */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 text-[#111827] flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#111827] font-mono tracking-tight">
              <AnimatedCounter value={statistics.yearsExperience || '10+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Years Experience</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">In IT education</span>
          </div>

          {/* Stat 6: Industry Projects */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-1">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 text-[#111827] flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#111827] font-mono tracking-tight">
              <AnimatedCounter value={statistics.industryProjects || '120+'} />
            </p>
            <span className="text-xs font-bold text-[#111827] block">Industry Projects</span>
            <span className="text-[10px] text-[#6B7280] font-semibold block">Enterprise grade</span>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          7. TRENDING COURSES
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E02B91] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 shadow-sm">
            🔥 High Industry Demand
          </span>
          <h2 className="text-3xl font-black text-[#111827]">Trending Courses</h2>
          <p className="text-sm text-[#4B5563]">
            Top-ranked technology programs chosen by modern computer science students and working engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.slice(0, 4).map((tc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:border-pink-300 hover:shadow-md transition space-y-3 hover:-translate-y-1 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-pink-50 text-[#E02B91] px-2.5 py-0.5 rounded-full border border-pink-200">
                  🔥 Trending
                </span>
                <span className="text-[11px] font-mono text-[#8B2BE2] font-bold">
                  {tc.studentsEnrolled}+ Enrolled
                </span>
              </div>
              <h3 className="text-base font-black text-[#111827] leading-snug">{tc.title}</h3>
              <p className="text-xs text-[#4B5563] line-clamp-2">{tc.description}</p>
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#6B7280]">{tc.duration}</span>
                <Link to="/courses" className="font-bold text-[#E02B91] hover:text-[#8B2BE2]">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. WHAT WE DO — Four Animated Service Cards
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E02B91] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 shadow-sm">
            Core Service Offerings
          </span>
          <h2 className="text-3xl font-black text-[#111827]">
            What We Do
          </h2>
          <p className="text-sm text-[#4B5563]">
            Four interconnected pillars designed to transform engineering students into high-earning software developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-pink-300 p-6 shadow-sm hover:shadow-md transition space-y-4 hover:-translate-y-1 duration-200">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#E02B91] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Technology Training</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Industry-oriented courses with practical learning, comprehensive syllabus hierarchy, tutor guidance, and hands-on concept masterclasses.
            </p>
            <Link to="/courses" className="inline-flex items-center gap-1 text-xs font-bold text-[#E02B91] hover:text-[#8B2BE2]">
              <span>Explore Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-purple-300 p-6 shadow-sm hover:shadow-md transition space-y-4 hover:-translate-y-1 duration-200">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8B2BE2] flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Internship Programs</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              50+ internship domains covering web engineering, AI/ML, cloud DevOps, and embedded systems with certified industry credentials.
            </p>
            <Link to="/internships" className="inline-flex items-center gap-1 text-xs font-bold text-[#8B2BE2] hover:text-purple-900">
              <span>View 50+ Domains</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-emerald-300 p-6 shadow-sm hover:shadow-md transition space-y-4 hover:-translate-y-1 duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Practical Learning</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Hands-on tasks, daily coding challenges, 1,100+ interactive game levels, and 100 FAANG-grade LeetCode interview challenges.
            </p>
            <Link to="/games" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800">
              <span>Interactive Sandboxes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-amber-300 p-6 shadow-sm hover:shadow-md transition space-y-4 hover:-translate-y-1 duration-200">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Products</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Students work on real-world products and software applications, shipping production features with CI/CD and cloud deployment.
            </p>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800">
              <span>Our Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. OUR COURSES — Unified Purple & Lavender Identity
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-blueprint-grid py-16 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 shadow-sm">
                Academic Curricula & Domains
              </span>
              <h2 className="text-3xl font-black text-[#111827]">Our Courses</h2>
              <p className="text-xs text-[#4B5563]">
                Featured course domains covering full-stack software development, cloud systems, and algorithmic problem solving.
              </p>
            </div>
            <Link
              to="/courses"
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-purple-500/20"
            >
              Explore More →
            </Link>
          </div>

          {/* 3 Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.slice(0, 3).map((c, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-purple-100 hover:border-purple-300 p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between space-y-4 hover:-translate-y-1 duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      {c.domain}
                    </span>
                    <span className="text-xs font-semibold text-[#6B7280] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-500" />
                      {c.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#111827]">{c.title}</h3>
                  <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">{c.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(c.skills || []).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-50 flex items-center justify-between">
                  <Link
                    to="/courses"
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="px-4 py-1.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-xs rounded-full shadow-sm transition"
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Explore Courses Button */}
          <div className="flex justify-center">
            <Link
              to="/courses"
              className="px-8 py-3.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-sm rounded-full shadow-md shadow-purple-500/20 hover:shadow-lg transition flex items-center gap-2"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. INTERNSHIP PROGRAMS — Green + White Identity
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-emerald-50/50 py-16 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                Workplace Experience
              </span>
              <h2 className="text-3xl font-black text-[#111827]">Internship Programs</h2>
              <p className="text-xs text-[#4B5563]">
                Select from over <strong>50+ Internship Domains</strong> spanning software engineering, data science, and cloud operations.
              </p>
            </div>
            <Link
              to="/internships"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
            >
              Explore More →
            </Link>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory">
              {featuredInternships.map((intern, idx) => (
                <div
                  key={idx}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 hover:-translate-y-1 duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {intern.mode}
                      </span>
                      <span className="text-[10px] font-bold text-[#6B7280]">{intern.duration}</span>
                    </div>
                    <h3 className="text-base font-black text-[#111827] leading-snug">{intern.title}</h3>
                    <p className="text-xs text-[#4B5563] font-medium line-clamp-2">{intern.technology}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Certificate Included
                    </div>
                  </div>
                  <div className="pt-3 border-t border-emerald-50 flex items-center justify-between">
                    <Link to="/internships" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                      View Details
                    </Link>
                    <Link
                      to="/contact"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-sm transition"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}

              {/* Explore More Card */}
              <Link
                to="/internships"
                className="w-[240px] sm:w-[280px] shrink-0 snap-start bg-white rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition group/btn"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover/btn:scale-110 transition-transform">
                  <ArrowRight className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-base font-black text-[#111827] group-hover/btn:text-emerald-600 transition-colors flex items-center justify-center gap-1">
                    Explore More <ArrowRight className="w-4 h-4" />
                  </span>
                  <p className="text-xs text-[#4B5563]">
                    View all 50+ certified internship domains & real projects
                  </p>
                </div>
                <span className="px-4 py-2 bg-emerald-600 group-hover/btn:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-sm transition">
                  All Internships (50+) →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. OUR PRODUCTS — Yellow + White Identity
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-amber-50/40 py-16 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm">
                Software Engineering Portfolio
              </span>
              <h2 className="text-3xl font-black text-[#111827]">Our Products</h2>
              <p className="text-xs text-[#4B5563]">
                Software products developed by STACK QUEUE engineers and internship students solving enterprise problems.
              </p>
            </div>
            <Link
              to="/products"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
            >
              Explore More →
            </Link>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory">
              {products.map((prod, idx) => {
                const isFinal = prod.isFinalProject;
                return (
                  <div
                    key={idx}
                    className={`w-[290px] sm:w-[330px] shrink-0 snap-start bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between space-y-4 hover:-translate-y-1 duration-200 ${
                      isFinal
                        ? 'border-purple-200/90 hover:border-purple-400 ring-1 ring-purple-100'
                        : 'border-amber-100 hover:border-amber-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Thumbnail if available */}
                      {prod.thumbnailUrl ? (
                        <div className="h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                          <img
                            src={prod.thumbnailUrl.startsWith('/') ? prod.thumbnailUrl : `/${prod.thumbnailUrl}`}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-900/80 text-white backdrop-blur-xs border border-white/20">
                            Verified Capstone
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isFinal
                            ? 'text-purple-700 bg-purple-50 border-purple-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          {prod.category}
                        </span>
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                          isFinal
                            ? 'bg-purple-50 border-purple-200 text-purple-600'
                            : 'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>
                          <Package className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-black text-[#111827] line-clamp-1">
                          {prod.name}
                        </h3>
                        {isFinal && prod.studentName && (
                          <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                            Built by {prod.studentName}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                        {prod.shortDescription || prod.description}
                      </p>

                      <div className={`p-2 rounded-xl border font-mono text-[10px] font-semibold ${
                        isFinal
                          ? 'bg-purple-50/50 border-purple-100 text-purple-900'
                          : 'bg-amber-50 border-amber-100 text-amber-800'
                      }`}>
                        {prod.technology}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {/* Product Specs modal trigger */}
                      <button
                        onClick={() => {
                          setSelectedProject(prod);
                          setIsProjectModalOpen(true);
                        }}
                        className={`font-bold flex items-center gap-1 transition ${
                          isFinal
                            ? 'text-purple-600 hover:text-purple-800'
                            : 'text-amber-600 hover:text-amber-800'
                        }`}
                      >
                        <span>Specifications</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        {prod.githubRepoUrl && prod.githubRepoUrl !== '#' && (
                          <a
                            href={prod.githubRepoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="View Institute Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}

                        {prod.liveDemoUrl && prod.liveDemoUrl !== '#' && (
                          <a
                            href={prod.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition"
                            title="Launch Live Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Explore More Card */}
              <Link
                to="/products"
                className="w-[240px] sm:w-[280px] shrink-0 snap-start bg-white rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition group/btn"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover/btn:scale-110 transition-transform">
                  <ArrowRight className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-base font-black text-[#111827] group-hover/btn:text-amber-600 transition-colors flex items-center justify-center gap-1">
                    Explore More <ArrowRight className="w-4 h-4" />
                  </span>
                  <p className="text-xs text-[#4B5563]">
                    View all software applications, developer tools & live demos
                  </p>
                </div>
                <span className="px-4 py-2 bg-amber-500 group-hover/btn:bg-amber-600 text-white text-xs font-bold rounded-full shadow-sm transition">
                  All Products →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. WHY CHOOSE US — Clean White Hover Micro-interactions
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E02B91] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 shadow-sm">
            Institutional Excellence
          </span>
          <h2 className="text-3xl font-black text-[#111827]">
            Why Choose STACK QUEUE
          </h2>
          <p className="text-sm text-[#4B5563]">
            Built on ten pillars of practical engineering rigor, verified industry certifications, and career outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {whyChooseUs.map((w, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:border-pink-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 text-[#E02B91] flex items-center justify-center font-black text-xs group-hover:from-[#E02B91] group-hover:to-[#8B2BE2] group-hover:text-white group-hover:border-transparent transition-all">
                {idx + 1}
              </div>
              <h3 className="text-sm font-black text-[#111827] leading-snug">{w.title}</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. YOUR LEARNING JOURNEY — Animated Timeline
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E02B91] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200 shadow-sm">
            Proven Career Trajectory
          </span>
          <h2 className="text-3xl font-black text-[#111827]">
            Your Learning Journey
          </h2>
          <p className="text-sm text-[#4B5563]">
            A step-by-step roadmap from your first code line to an enterprise engineering placement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {learningJourney.map((step, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:border-pink-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] text-white font-mono font-black text-xs flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {step.step}
                  </span>
                  {idx < learningJourney.length - 1 && (
                    <span className="text-xs font-bold text-slate-300 hidden lg:inline group-hover:text-[#E02B91] transition-colors">→</span>
                  )}
                </div>
                <h3 className="text-base font-black text-[#111827]">{step.title}</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">{step.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#E5E7EB] text-[11px] font-bold text-[#E02B91]">
                Stage 0{step.step}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Project Detail & Specs Modal */}
      <PublicProjectDetailModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

    </div>
  );
}
