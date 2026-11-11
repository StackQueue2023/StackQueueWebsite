import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Target,
  Compass,
  GraduationCap
} from 'lucide-react';

export default function AboutUsPage() {
  const leadership = [
    {
      name: 'Dr. Eleanor Vance',
      role: 'Institute Director & Curriculum Lead',
      bio: 'Former Big Tech Principal Architect with 18+ years mentoring university graduates into top-tier tech roles.',
      avatar: 'E'
    },
    {
      name: 'Prof. Marcus Miller',
      role: 'Head of Technical Mentorship',
      bio: 'Competitive programming mentor, author of dynamic programming problem sets, and veteran fullstack trainer.',
      avatar: 'M'
    },
    {
      name: 'Sarah Tanaka',
      role: 'Senior System Architect & Game Engine Lead',
      bio: 'Pioneer of interactive sandbox compilers and gamified learning mechanics for frontend & backend engineers.',
      avatar: 'S'
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#111827]">
      {/* Header Banner */}
      <section className="bg-white py-16 border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E02B91] text-xs font-bold mb-4 shadow-2xs">
            <GraduationCap className="w-4 h-4" />
            <span>Inclusive Learning</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
            About <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">Stack Queue</span> Technologies
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            Pioneering inclusive education, hands-on software training, certified industry internships across 50+ technology domains, and enterprise-grade product engineering.
          </p>
        </div>
      </section>

      {/* ── About Summary Card — 2-Column ── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2]" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* LEFT */}
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-7">
              <div className="space-y-2">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-[#E02B91] border border-pink-200">
                  About Our Company
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#111827] leading-tight">
                  About{' '}
                  <span className="bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] bg-clip-text text-transparent">
                    Stack Queue
                  </span>
                </h2>
              </div>

              <blockquote className="border-l-4 border-[#E02B91] pl-5 text-base sm:text-lg font-bold text-[#111827] italic leading-relaxed">
                "Inclusive Learning — Empowering students with industry-oriented technology training, practical learning, internship opportunities, and real-world product development."
              </blockquote>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                We are a pioneering educational training, internship, and product-based technology company. We eliminate outdated passive theory by immersing students in 100% hands-on tasks, real-world product engineering, certified internships across 50+ technology domains, and structured FAANG-grade career preparation.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  'Training Services',
                  'Internship Programs',
                  'Practical Learning',
                  'Real-World Product Development',
                  'Career-Oriented Learning'
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] bg-white rounded-full text-xs font-semibold text-[#111827] shadow-sm hover:border-[#E02B91] transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E02B91]" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/courses"
                  className="px-7 py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold text-xs rounded-full shadow-md shadow-pink-500/20 hover:shadow-lg transition flex items-center gap-2"
                >
                  <span>Explore Courses</span>
                </Link>
                <Link
                  to="/internships"
                  className="px-7 py-3 bg-white hover:bg-slate-50 text-[#111827] hover:text-[#E02B91] font-bold text-xs rounded-full border border-[#E5E7EB] shadow-sm transition"
                >
                  50+ Internship Domains
                </Link>
              </div>
            </div>

            {/* RIGHT — Logo + Feature Cards */}
            <div className="p-8 sm:p-12 flex flex-col justify-center gap-8 bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-[#E5E7EB]">
              <div className="flex justify-center">
                <img
                  src="/stackqueue-logo-light.png"
                  alt="STACK QUEUE — Inclusive Learning"
                  className="h-24 sm:h-28 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
                />
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-2 hover:border-pink-200 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-pink-50 text-[#E02B91] rounded-xl">
                      <Target className="w-4 h-4" />
                    </span>
                    <span className="px-2.5 py-0.5 bg-pink-50 text-[#E02B91] text-[11px] font-bold rounded-full border border-pink-200">
                      Live Industry Standards
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#111827]">Practical Task-Driven Architecture</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Every concept is accompanied by 10–15 hands-on algorithmic and real-world tasks verified with automated test suites.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-2 hover:border-purple-200 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-purple-50 text-[#8B2BE2] rounded-xl">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-[#8B2BE2] text-[11px] font-bold rounded-full border border-purple-200">
                      50+ Tech Domains
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#111827]">Certified Internship Placements</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Work on production SaaS platforms, collaborate via Git worktrees, and receive verifiable employer credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-pink-200 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#E02B91] border border-pink-200 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-3">Our Mission</h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              To eliminate the gap between passive theoretical college lectures and the high-performance problem solving
              demanded by global tech employers. We ensure every student codes every single day, receives active guidance,
              and masters algorithmic thinking through practice.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-purple-200 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8B2BE2] border border-purple-200 flex items-center justify-center mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-3">Our Vision</h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              To create the world's most effective IT learning ecosystem where learning to code feels like playing a captivating adventure,
              where every milestone earns real-world competency, and where institutes, tutors, and students collaborate seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E02B91]">Pedagogical Framework</span>
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
              Why Stack Queue Delivers 3x Faster Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <p className="text-2xl font-bold text-[#E02B91] mb-2">1,100+</p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Interactive Game Levels</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Learn syntax, logic, and architecture across 11 distinct tracks without ever opening a passive PDF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <p className="text-2xl font-bold text-emerald-600 mb-2">100</p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Interview Challenges</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                From Two Pointers to Dynamic Programming, test against hidden cases and optimize memory and runtime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <p className="text-2xl font-bold text-[#8B2BE2] mb-2">1-on-1</p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Tutor Guidance</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Tutors track your weak topics, review your code, and assign targeted homework tasks each week.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <p className="text-2xl font-bold text-pink-600 mb-2">Live</p>
              <h3 className="text-sm font-bold text-[#111827] mb-2">Attendance &amp; Monitor</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Institutes and corporate partners track batch attendance, completion rates, and benchmark analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership / Faculty */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E02B91]">Faculty &amp; Mentors</span>
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
            Meet the Academic Leadership
          </h2>
          <p className="mt-2 text-sm text-[#4B5563]">
            Seasoned industry practitioners dedicated to turning students into top-tier software engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leadership.map((member) => (
            <div
              key={member.name}
              className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {member.avatar}
              </div>
              <h3 className="text-base font-bold text-[#111827]">{member.name}</h3>
              <p className="text-xs font-semibold text-[#E02B91] mb-3">{member.role}</p>
              <p className="text-xs text-[#4B5563] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-14 bg-white border-t border-[#E5E7EB] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">Start Learning With Us Today</h2>
          <p className="text-[#4B5563] text-xs sm:text-sm max-w-xl mx-auto">
            Experience the future of IT education. Register your free student account or contact our admissions team.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-7 py-3 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold rounded-full text-xs shadow-md shadow-pink-500/20 hover:shadow-lg transition"
            >
              Register as Student
            </Link>
            <Link
              to="/contact"
              className="px-7 py-3 bg-white text-[#111827] hover:text-[#E02B91] font-bold rounded-full text-xs border border-[#E5E7EB] shadow-xs hover:border-pink-300 transition"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
