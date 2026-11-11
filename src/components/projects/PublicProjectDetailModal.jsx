import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Github,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  Eye,
  ChevronRight,
  Info
} from 'lucide-react';

export default function PublicProjectDetailModal({ isOpen, onClose, project }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  if (!isOpen || !project) return null;

  // Normalization for data structure whether coming from portalController or projectLifecycleController
  const req = project.projectRequirementId || project.requirement || project;
  const title = req.title || project.name || project.title || 'Enterprise Capstone Project';
  const projectId = req.projectId || 'PRJ-FINAL';
  const category = req.category || project.category || 'Software Engineering';
  const difficulty = req.difficulty || project.difficulty || 'Intermediate';
  const description = req.description || project.shortDescription || project.description || '';
  const problemStatement = req.problemStatement || '';
  const objectives = req.objectives || [];
  const requiredFeatures = req.requiredFeatures || project.keyFeatures?.map(f => (typeof f === 'string' ? { title: f } : f)) || [];
  const techStack = req.technologies || project.technologies || [];
  const technicalRequirements = req.technicalRequirements || [];
  const expectedOutput = req.expectedOutput || '';
  const uiUxRequirements = req.uiUxRequirements || '';
  const guidelines = req.guidelines || '';
  const evaluationCriteria = req.evaluationCriteria || [];
  const thumbnailUrl = req.thumbnailUrl || project.thumbnailUrl || '';
  const referenceFiles = req.referenceFiles || [];

  const studentName = project.studentId?.name || (project.studentId ? 'Stack Queue Fellow' : null);
  const tutorName = project.tutorId?.name || (project.tutorId ? 'Senior Technical Lead' : null);
  const liveDemoUrl = project.liveDemoUrl || project.demoUrl;
  const githubRepoUrl = project.destinationGithubRepoUrl || project.approvedGitHubRepoUrl || project.githubRepoUrl;
  const version = project.currentVersion || 1;
  const screenshots = project.screenshots || [];

  // Dynamic Status & Review computation
  const status = project.status || (!studentName ? 'Specification' : 'Assigned');
  const isApproved = status === 'Approved';
  const isAssigned = status === 'Assigned';
  const isInProgress = status === 'In Progress';
  const isSubmitted = status === 'Submitted' || status === 'Resubmitted';
  const isTutorReview = status === 'Tutor Review';
  const isAdminReview = status === 'Sent for Admin Approval';
  const isRevision = status === 'Revision Required';
  const isRejected = status === 'Rejected';

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden bg-gradient-to-br from-[#1e0734] via-[#2f083d] to-[#420938] text-white">
        
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-[#8B2BE2]/30 via-[#B829B6]/25 to-[#E02B91]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-[#8B2BE2]/25 to-[#E02B91]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Hero */}
        <div className="relative z-10 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] p-6 text-white shrink-0 border-b border-white/15">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {projectId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-900/40 text-purple-100 border border-white/20">
                  {category}
                </span>

                {/* Dynamic Status Pill */}
                {isApproved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Institute Verified & Approved
                  </span>
                )}
                {isAssigned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-pink-100 border border-white/30 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-pink-200" />
                    Assigned • 0% Completed
                  </span>
                )}
                {isInProgress && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-100 border border-amber-300/40 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    In Progress • Development Active
                  </span>
                )}
                {(isSubmitted || isTutorReview) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/40 text-purple-100 border border-purple-300/40 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-300" />
                    Under Tutor Code Review
                  </span>
                )}
                {isRevision && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/40 text-rose-100 border border-rose-300/40 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-rose-300" />
                    Revision Requested
                  </span>
                )}
                {isAdminReview && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/30 text-cyan-100 border border-cyan-300/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                    Final Executive Review
                  </span>
                )}
                {!studentName && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/40 text-purple-200 border border-white/20 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-300" />
                    Institute Requirement Specification
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-100 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-4 h-4 text-purple-200" />
                  {studentName ? (
                    <>Built by <strong className="text-white font-bold">{studentName}</strong></>
                  ) : (
                    <span className="text-purple-200 italic">Available for Student Assignment</span>
                  )}
                </span>
                {tutorName && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-purple-200" />
                    Reviewed by <strong className="text-white font-bold">{tutorName}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-amber-300" />
                  Difficulty: <strong className="text-white font-bold">{difficulty}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition shrink-0 cursor-pointer"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action CTAs in Header */}
          <div className="mt-5 flex flex-wrap items-center gap-3 pt-3 border-t border-white/15">
            {liveDemoUrl && liveDemoUrl !== '#' && (
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl shadow-md border border-white/30 backdrop-blur-md transition-all hover:scale-105"
              >
                <ExternalLink className="w-4 h-4 text-pink-200" />
                Launch Live Demo
              </a>
            )}
            {githubRepoUrl && githubRepoUrl !== '#' && (
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 text-white font-bold text-xs rounded-xl border border-white/25 shadow-md transition-all hover:scale-105"
              >
                <Github className="w-4 h-4 text-pink-300" />
                View Institute Repository
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex border-b border-white/10 bg-black/30 backdrop-blur-md px-6 shrink-0 overflow-x-auto gap-2 pt-2">
          {[
            { id: 'overview', label: 'Overview & Objectives' },
            { id: 'features', label: `Features (${requiredFeatures.length})` },
            { id: 'tech', label: 'Tech Stack & Requirements' },
            { id: 'screenshots', label: `Screenshots (${screenshots.length})` },
            { id: 'evaluation', label: 'Evaluation & Criteria' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-t-xl whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white shadow-md border-t border-x border-white/25'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Thumbnail banner if present */}
              {thumbnailUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md max-h-64 bg-black/30 flex items-center justify-center">
                  <img
                    src={thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-pink-400" />
                  Project Description
                </h4>
                <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-line bg-gradient-to-r from-[#8B2BE2]/15 via-[#B829B6]/15 to-[#E02B91]/15 p-4 rounded-2xl border border-white/15 backdrop-blur-xs">
                  {description}
                </p>
              </div>

              {/* Problem Statement */}
              {problemStatement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    Problem Statement
                  </h4>
                  <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-line bg-gradient-to-r from-[#8B2BE2]/15 via-[#B829B6]/15 to-[#E02B91]/15 p-4 rounded-2xl border border-pink-400/20 backdrop-blur-xs">
                    {problemStatement}
                  </p>
                </div>
              )}

              {/* Objectives */}
              {objectives.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pink-400" />
                    Project Objectives
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {objectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-white/15 text-xs font-medium text-pink-100 backdrop-blur-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Output */}
              {expectedOutput && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                    Expected Output & Deliverable
                  </h4>
                  <p className="text-purple-200 text-xs leading-relaxed bg-gradient-to-r from-purple-900/25 to-pink-900/25 p-3.5 rounded-xl border border-white/15">
                    {expectedOutput}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                  Functional Requirements & Checklist
                </h4>
                <span className="text-xs font-bold text-pink-200 bg-white/15 px-3 py-1 rounded-full border border-pink-400/30 backdrop-blur-xs">
                  {requiredFeatures.length} Core Requirements Verified
                </span>
              </div>

              {requiredFeatures.length === 0 ? (
                <p className="text-xs text-purple-300 italic">No specific features enumerated.</p>
              ) : (
                <div className="space-y-3">
                  {requiredFeatures.map((feat, i) => {
                    const fTitle = typeof feat === 'string' ? feat : feat.title;
                    const fDesc = typeof feat === 'string' ? '' : feat.description;
                    const isCore = typeof feat === 'string' ? true : feat.isCore !== false;

                    return (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/35 via-fuchsia-900/25 to-pink-900/35 border border-white/15 shadow-sm hover:border-pink-400/40 transition-all space-y-1.5 backdrop-blur-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <h5 className="text-xs sm:text-sm font-bold text-white">
                              {fTitle}
                            </h5>
                          </div>
                          {isCore && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] text-white border border-white/20 shrink-0">
                              Core
                            </span>
                          )}
                        </div>
                        {fDesc && (
                          <p className="text-xs text-purple-200 pl-6.5 leading-relaxed">
                            {fDesc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-6">
              {/* Technology Stack */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B2BE2]/40 via-[#B829B6]/40 to-[#E02B91]/40 text-pink-100 text-xs font-bold border border-white/20 shadow-xs hover:border-pink-300 transition"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              {technicalRequirements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                    Technical Specifications
                  </h4>
                  <ul className="space-y-2">
                    {technicalRequirements.map((spec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-white/15 text-xs text-purple-100"
                      >
                        <ChevronRight className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* UI/UX Requirements */}
              {uiUxRequirements && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                    UI/UX & Design Guidelines
                  </h4>
                  <p className="text-purple-200 text-xs leading-relaxed bg-gradient-to-r from-purple-900/25 to-pink-900/25 p-3.5 rounded-xl border border-white/15">
                    {uiUxRequirements}
                  </p>
                </div>
              )}

              {/* General Guidelines */}
              {guidelines && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                    Instructions & Guidelines
                  </h4>
                  <p className="text-purple-200 text-xs leading-relaxed bg-gradient-to-r from-purple-900/25 to-pink-900/25 p-3.5 rounded-xl border border-white/15">
                    {guidelines}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                Project Screenshots & Previews
              </h4>
              {screenshots.length === 0 ? (
                <div className="p-8 text-center bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-dashed border-white/20">
                  <Eye className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                  <p className="text-xs text-purple-200 font-medium">
                    No visual screenshots uploaded for this submission. Live demo is available via the link above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {screenshots.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedScreenshot(s.fileUrl)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-white/20 bg-black/30 hover:border-pink-400 hover:shadow-xl transition-all"
                    >
                      <img
                        src={s.fileUrl.startsWith('/') ? s.fileUrl : `/${s.fileUrl}`}
                        alt={s.caption || s.originalName || `Screenshot ${i + 1}`}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {s.caption && (
                        <div className="p-2.5 bg-black/50 text-xs font-semibold text-purple-100 border-t border-white/10">
                          {s.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-white uppercase tracking-wider font-mono">
                Evaluation Criteria & Grading Weights
              </h4>
              {evaluationCriteria.length === 0 ? (
                <p className="text-xs text-purple-300 italic">Standard evaluation criteria applied.</p>
              ) : (
                <div className="space-y-2.5">
                  {evaluationCriteria.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-purple-900/35 via-fuchsia-900/25 to-pink-900/35 border border-white/15"
                    >
                      <span className="text-xs font-bold text-white">
                        {c.criteriaName}
                      </span>
                      <span className="text-xs font-extrabold text-white bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] px-3.5 py-1 rounded-full font-mono shadow-xs border border-white/25">
                        {c.weightage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Review & Progress Status Banner */}
              {isApproved && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-emerald-950/70 border border-emerald-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      Executive Review Status
                    </div>
                    <div className="text-[11px] text-emerald-100 font-medium">
                      Verified by institute technical board and synced to the official institute repository.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-300 px-3.5 py-1 rounded-full shadow-md font-bold">
                    100% Passed
                  </span>
                </div>
              )}

              {isAssigned && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B2BE2]/30 via-[#B829B6]/30 to-[#E02B91]/30 border border-pink-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-pink-200 uppercase tracking-wider">
                      Student Project Progress
                    </div>
                    <div className="text-[11px] text-purple-200 font-medium">
                      Project assigned to student. Implementation has not started yet (0% completed).
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] px-3.5 py-1 rounded-full shadow-md border border-white/25">
                    0% Completed
                  </span>
                </div>
              )}

              {isInProgress && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-pink-950/70 border border-amber-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Development In Progress
                    </div>
                    <div className="text-[11px] text-amber-100 font-medium">
                      Student is actively developing the project requirements. Awaiting submission.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 px-3.5 py-1 rounded-full shadow-md font-bold">
                    0% Submitted
                  </span>
                </div>
              )}

              {(isSubmitted || isTutorReview) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-fuchsia-950/70 to-pink-950/70 border border-purple-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-purple-300 uppercase tracking-wider">
                      Tutor Code Review Queue
                    </div>
                    <div className="text-[11px] text-purple-100 font-medium">
                      Deliverables submitted by student. Currently under tutor code review.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-1 rounded-full shadow-md border border-white/20">
                    Under Review
                  </span>
                </div>
              )}

              {isRevision && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 to-pink-950/70 border border-rose-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-rose-300 uppercase tracking-wider">
                      Revision Required
                    </div>
                    <div className="text-[11px] text-rose-100 font-medium">
                      Tutor requested changes. Student must revise code before final testing.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-pink-600 px-3.5 py-1 rounded-full shadow-md border border-white/20">
                    Revision Requested
                  </span>
                </div>
              )}

              {isAdminReview && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-purple-950/70 to-pink-950/70 border border-cyan-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                      Executive Review Queue
                    </div>
                    <div className="text-[11px] text-cyan-100 font-medium">
                      Tutor approved this submission. Awaiting final executive board testing and sign-off.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-cyan-950 bg-gradient-to-r from-cyan-300 to-teal-200 px-3.5 py-1 rounded-full shadow-md font-bold">
                    Executive Review
                  </span>
                </div>
              )}

              {!studentName && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B2BE2]/30 via-[#B829B6]/30 to-[#E02B91]/30 border border-pink-400/40 mt-4 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-pink-200 uppercase tracking-wider">
                      Curriculum Specification
                    </div>
                    <div className="text-[11px] text-purple-200 font-medium">
                      Standardized project specification ready for assignment to students.
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] px-3.5 py-1 rounded-full shadow-md border border-white/25">
                    0% Assigned
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 bg-black/40 backdrop-blur-md px-6 py-4 border-t border-white/15 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-purple-200 font-medium">
            Project Version: <strong className="text-pink-300 font-bold">V{version}</strong> • {isApproved ? 'Stack Queue Institute Approved' : 'Stack Queue Capstone Project'}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          >
            Close
          </button>
        </div>

      </div>

      {/* Lightbox for screenshots */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-12 right-0 text-white hover:text-pink-300 p-2 cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedScreenshot.startsWith('/') ? selectedScreenshot : `/${selectedScreenshot}`}
              alt="Screenshot full view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
