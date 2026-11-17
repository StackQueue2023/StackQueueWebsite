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
      <div className="bg-white relative rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-amber-900">
        
        {/* Subtle Decorative Ambient Glows */}
        <div className="bg-amber-200/30 absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" />
        <div className="bg-yellow-200/40 absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" />

        {/* Header Hero */}
        <div className="bg-white relative z-10 p-6 text-amber-900 shrink-0 border-b border-amber-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-yellow-50 text-amber-900 border border-amber-300">
                  {projectId}
                </span>
                <span className="bg-yellow-50 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-900 border border-amber-200">
                  {category}
                </span>

                {/* Dynamic Status Pill */}
                {isApproved && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Institute Verified & Approved
                  </span>
                )}
                {isAssigned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-amber-700 border border-amber-300 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    Assigned • 0% Completed
                  </span>
                )}
                {isInProgress && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    In Progress • Development Active
                  </span>
                )}
                {(isSubmitted || isTutorReview) && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 border border-amber-300 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    Under Tutor Code Review
                  </span>
                )}
                {isRevision && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-800 border border-amber-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    Revision Requested
                  </span>
                )}
                {isAdminReview && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 border border-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Final Executive Review
                  </span>
                )}
                {!studentName && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Institute Requirement Specification
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight">
                {title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  {studentName ? (
                    <>Built by <strong className="text-slate-900 font-bold">{studentName}</strong></>
                  ) : (
                    <span className="text-slate-500 italic">Available for Student Assignment</span>
                  )}
                </span>
                {tutorName && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-amber-600" />
                    Reviewed by <strong className="text-slate-900 font-bold">{tutorName}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-4 h-4 text-amber-600" />
                  Difficulty: <strong className="text-amber-700 font-bold">{difficulty}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-pink-600 bg-white border border-slate-200 hover:border-pink-300 rounded-full transition shrink-0 cursor-pointer"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action CTAs in Header */}
          <div className="mt-5 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200">
            {liveDemoUrl && liveDemoUrl !== '#' && (
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sq-gradient hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-105"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                Launch Live Demo
              </a>
            )}
            {githubRepoUrl && githubRepoUrl !== '#' && (
              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:border-pink-300 text-pink-600 font-bold text-xs rounded-xl border border-pink-200 shadow-xs transition-all hover:scale-105"
              >
                <Github className="w-4 h-4 text-pink-600" />
                View Institute Repository
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex border-b border-amber-200 bg-white px-6 shrink-0 overflow-x-auto gap-2 pt-2">
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
              className={`px-4 py-3 text-xs font-bold transition-all rounded-t-xl whitespace-nowrap cursor-pointer ${ activeTab === tab.id ? 'bg-yellow-50 text-amber-900 shadow-xs border-t border-x border-amber-300 border-b-2 border-b-amber-600' : 'text-amber-800/80 hover:text-amber-900 hover:bg-yellow-50/70' }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Thumbnail banner if present */}
              {thumbnailUrl && (
                <div className="rounded-2xl overflow-hidden border border-amber-200 shadow-md max-h-64 bg-white flex items-center justify-center">
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
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  Project Description
                </h4>
                <p className="bg-white text-slate-800 text-sm leading-relaxed whitespace-pre-line p-4 rounded-2xl border border-slate-200">
                  {description}
                </p>
              </div>

              {/* Problem Statement */}
              {problemStatement && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Problem Statement
                  </h4>
                  <p className="bg-white text-slate-800 text-sm leading-relaxed whitespace-pre-line p-4 rounded-2xl border border-slate-200">
                    {problemStatement}
                  </p>
                </div>
              )}

              {/* Objectives */}
              {objectives.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Project Objectives
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {objectives.map((obj, i) => (
                      <div
                        key={i}
                        className="bg-white flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 text-xs font-medium text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Output */}
              {expectedOutput && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                    Expected Output & Deliverable
                  </h4>
                  <p className="bg-white text-slate-800 text-xs leading-relaxed p-3.5 rounded-xl border border-amber-200">
                    {expectedOutput}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                  Functional Requirements & Checklist
                </h4>
                <span className="text-xs font-bold text-amber-700 bg-white px-3 py-1 rounded-full border border-amber-300">
                  {requiredFeatures.length} Core Requirements Verified
                </span>
              </div>

              {requiredFeatures.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No specific features enumerated.</p>
              ) : (
                <div className="space-y-3">
                  {requiredFeatures.map((feat, i) => {
                    const fTitle = typeof feat === 'string' ? feat : feat.title;
                    const fDesc = typeof feat === 'string' ? '' : feat.description;
                    const isCore = typeof feat === 'string' ? true : feat.isCore !== false;

                    return (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <h5 className="text-xs sm:text-sm font-bold text-amber-800">
                              {fTitle}
                            </h5>
                          </div>
                          {isCore && (
                            <span className="bg-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-amber-700 border border-amber-300 shrink-0">
                              Core
                            </span>
                          )}
                        </div>
                        {fDesc && (
                          <p className="text-xs text-slate-600 pl-6.5 leading-relaxed">
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
                <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="bg-white px-3.5 py-1.5 rounded-xl text-amber-700 text-xs font-bold border border-amber-300 shadow-xs hover:border-amber-500 transition"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              {technicalRequirements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                    Technical Specifications
                  </h4>
                  <ul className="space-y-2">
                    {technicalRequirements.map((spec, i) => (
                      <li
                        key={i}
                        className="bg-white flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 text-xs text-slate-800"
                      >
                        <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* UI/UX Requirements */}
              {uiUxRequirements && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                    UI/UX & Design Guidelines
                  </h4>
                  <p className="bg-white text-slate-800 text-xs leading-relaxed p-3.5 rounded-xl border border-amber-200">
                    {uiUxRequirements}
                  </p>
                </div>
              )}

              {/* General Guidelines */}
              {guidelines && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                    Instructions & Guidelines
                  </h4>
                  <p className="bg-white text-slate-800 text-xs leading-relaxed p-3.5 rounded-xl border border-amber-200">
                    {guidelines}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                Project Screenshots & Previews
              </h4>
              {screenshots.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-200">
                  <Eye className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">
                    No visual screenshots uploaded for this submission. Live demo is available via the link above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {screenshots.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedScreenshot(s.fileUrl)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-amber-200 bg-white hover:border-amber-500 hover:shadow-xl transition-all"
                    >
                      <img
                        src={s.fileUrl.startsWith('/') ? s.fileUrl : `/${s.fileUrl}`}
                        alt={s.caption || s.originalName || `Screenshot ${i + 1}`}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {s.caption && (
                        <div className="p-2.5 bg-white text-xs font-semibold text-slate-800 border-t border-amber-200">
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
              <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider font-mono">
                Evaluation Criteria & Grading Weights
              </h4>
              {evaluationCriteria.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Standard evaluation criteria applied.</p>
              ) : (
                <div className="space-y-2.5">
                  {evaluationCriteria.map((c, i) => (
                    <div
                      key={i}
                      className="bg-white flex items-center justify-between p-3.5 rounded-xl border border-amber-200"
                    >
                      <span className="text-xs font-bold text-amber-800">
                        {c.criteriaName}
                      </span>
                      <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full font-mono shadow-xs border border-amber-300">
                        {c.weightage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Review & Progress Status Banner */}
              {isApproved && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                      Executive Review Status
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Verified by institute technical board and synced to the official institute repository.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-emerald-700 px-3.5 py-1 rounded-full border border-emerald-300">
                    100% Passed
                  </span>
                </div>
              )}

              {isAssigned && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Student Project Progress
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Project assigned to student. Implementation has not started yet (0% completed).
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    0% Completed
                  </span>
                </div>
              )}

              {isInProgress && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Development In Progress
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Student is actively developing the project requirements. Awaiting submission.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    0% Submitted
                  </span>
                </div>
              )}

              {(isSubmitted || isTutorReview) && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Tutor Code Review Queue
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Deliverables submitted by student. Currently under tutor code review.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    Under Review
                  </span>
                </div>
              )}

              {isRevision && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Revision Required
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Tutor requested changes. Student must revise code before final testing.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    Revision Requested
                  </span>
                </div>
              )}

              {isAdminReview && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Executive Review Queue
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Tutor approved this submission. Awaiting final executive board testing and sign-off.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    Executive Review
                  </span>
                </div>
              )}

              {!studentName && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                      Curriculum Specification
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      Standardized project specification ready for assignment to students.
                    </div>
                  </div>
                  <span className="bg-white text-xs font-extrabold text-amber-700 px-3.5 py-1 rounded-full border border-amber-300">
                    0% Assigned
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-600 font-medium">
            Project Version: <strong className="text-slate-900 font-bold">V{version}</strong> • {isApproved ? 'Stack Queue Institute Approved' : 'Stack Queue Capstone Project'}
          </div>
          <button
            onClick={onClose}
            className="bg-sq-gradient hover:opacity-95 px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
