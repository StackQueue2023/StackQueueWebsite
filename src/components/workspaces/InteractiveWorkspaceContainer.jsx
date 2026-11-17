import React from 'react';
import UiUxDesignWorkspace from './UiUxDesignWorkspace';
import Cad3DWorkspace from './Cad3DWorkspace';
import CloudArchitectureWorkspace from './CloudArchitectureWorkspace';
import ManualTestingWorkspace from './ManualTestingWorkspace';
import SqlDatabaseWorkspace from './SqlDatabaseWorkspace';
import RpaWorkflowWorkspace from './RpaWorkflowWorkspace';
import DataAnalyticsWorkspace from './DataAnalyticsWorkspace';
import CybersecurityLabWorkspace from './CybersecurityLabWorkspace';
import InterviewCodeEditor from '../interview-game/InterviewCodeEditor';

export default function InteractiveWorkspaceContainer({
  courseId,
  question,
  environment,
  code,
  setCode,
  language,
  setLanguage,
  onRunCode,
  onSubmitCode,
  onSubmitPractical,
  isSubmitting,
  runResult,
  isRunning
}) {
  const envType = (
    question?.environmentType ||
    environment?.environmentType ||
    ''
  ).toLowerCase();

  // 1. UI / UX Design Workspace
  if (envType.includes('uiux') || envType.includes('design') && !envType.includes('web_design')) {
    return (
      <UiUxDesignWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 2. 3D CAD & Mechanical Design Workspace
  if (envType.includes('cad') || envType.includes('mechanical')) {
    return (
      <Cad3DWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 3. Cloud Topology & DevOps Workspace
  if (envType.includes('cloud') || envType.includes('devops_docker') || envType.includes('topology')) {
    return (
      <CloudArchitectureWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 4. QA Manual & Software Testing Workspace
  if (envType.includes('manual_testing') || (envType.includes('software_testing') && question.questionType === 'practical')) {
    return (
      <ManualTestingWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 5. Interactive SQL & Relational DBMS Studio
  if (envType.includes('sql') || envType.includes('dbms')) {
    return (
      <SqlDatabaseWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitCode(data, 'sql')}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 6. RPA Workflow Studio
  if (envType.includes('rpa')) {
    return (
      <RpaWorkflowWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 7. Data Analytics & Business Analytics Studio
  if (envType.includes('analytics') || envType.includes('business')) {
    return (
      <DataAnalyticsWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // 8. Cybersecurity & Ethical Hacking Lab
  if (envType.includes('cyber') || envType.includes('security') || envType.includes('ethical')) {
    return (
      <CybersecurityLabWorkspace
        courseId={courseId}
        question={question}
        initialState={question.savedWorkspaceState}
        onSubmitSolution={(env, data) => onSubmitPractical(env, data)}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Default: Full Interactive Code Editor (Python, Java, C, C++, JavaScript, Web, etc.)
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <InterviewCodeEditor
        code={code}
        onChange={(val) => {
          setCode(val);
          // Auto-save code to workspace state
          api.post(`/workspace/state/${courseId}/${question._id}`, {
            environmentType: envType || 'coding',
            stateData: { code: val }
          }).catch(() => {});
        }}
        language={language}
        onLanguageChange={setLanguage}
        onRun={onRunCode}
        onSubmit={onSubmitCode}
        isSubmitting={isSubmitting}
        testCases={question?.examples || []}
        activeTab="code"
        runResult={runResult}
        isRunning={isRunning}
      />
    </div>
  );
}
