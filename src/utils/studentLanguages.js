export const DOMAIN_TO_LANG = {
  java: 'java',
  python: 'python',
  cpp: 'cpp',
  react: 'javascript',
  javascript: 'javascript',
  js: 'javascript',
  selenium: 'java'
};

export const DOMAIN_COMPILER_CONFIGS = {
  java: {
    key: 'java',
    title: 'Java',
    defaultLanguage: 'java',
    allowedLanguages: ['java'],
    compilers: [
      { id: 'java', name: 'Java (JDK 22)', lang: 'java', version: '22' }
    ]
  },
  python: {
    key: 'python',
    title: 'Python',
    defaultLanguage: 'python',
    allowedLanguages: ['python'],
    compilers: [
      { id: 'python', name: 'Python (3.11)', lang: 'python', version: '3.11' }
    ]
  },
  femnstack: {
    key: 'femnstack',
    title: 'FEMN STACK',
    defaultLanguage: 'javascript',
    allowedLanguages: ['javascript'],
    compilers: [
      { id: 'javascript', name: 'JavaScript (Node.js)', lang: 'javascript', version: '20' }
    ]
  },
  selenium: {
    key: 'selenium',
    title: 'Selenium',
    defaultLanguage: 'java',
    allowedLanguages: ['java', 'python'],
    compilers: [
      { id: 'java', name: 'Java (JDK 22)', lang: 'java', version: '22' },
      { id: 'python', name: 'Python (3.11)', lang: 'python', version: '3.11' }
    ]
  },
  cpp: {
    key: 'cpp',
    title: 'C++',
    defaultLanguage: 'cpp',
    allowedLanguages: ['cpp'],
    compilers: [
      { id: 'cpp', name: 'C++ (GCC)', lang: 'cpp', version: '17' }
    ]
  },
  c: {
    key: 'c',
    title: 'C',
    defaultLanguage: 'cpp',
    allowedLanguages: ['cpp'],
    compilers: [
      { id: 'cpp', name: 'C / C++ (GCC)', lang: 'cpp', version: '17' }
    ]
  },
  dsa: {
    key: 'dsa',
    title: 'Data Structures & Algorithms',
    defaultLanguage: 'java',
    allowedLanguages: ['java', 'python', 'cpp', 'javascript'],
    compilers: [
      { id: 'java', name: 'Java (JDK 22)', lang: 'java', version: '22' },
      { id: 'python', name: 'Python (3.11)', lang: 'python', version: '3.11' },
      { id: 'cpp', name: 'C++ (GCC)', lang: 'cpp', version: '17' },
      { id: 'javascript', name: 'JavaScript (Node.js)', lang: 'javascript', version: '20' }
    ]
  },
  sql: {
    key: 'sql',
    title: 'SQL',
    defaultLanguage: 'javascript',
    allowedLanguages: ['javascript', 'python'],
    compilers: [
      { id: 'javascript', name: 'SQL / Node.js Engine', lang: 'javascript', version: '20' },
      { id: 'python', name: 'Python (3.11)', lang: 'python', version: '3.11' }
    ]
  },
  cybersecurity: {
    key: 'cybersecurity',
    title: 'Cyber Security',
    defaultLanguage: 'python',
    allowedLanguages: ['python'],
    compilers: [
      { id: 'python', name: 'Python (3.11)', lang: 'python', version: '3.11' }
    ]
  }
};

export function getDomainCompilerConfig(domainKey) {
  if (!domainKey) {
    return DOMAIN_COMPILER_CONFIGS.java;
  }
  const norm = domainKey.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (norm.includes('selenium')) return DOMAIN_COMPILER_CONFIGS.selenium;
  if (norm.includes('python')) return DOMAIN_COMPILER_CONFIGS.python;
  if (norm.includes('femn') || norm.includes('react') || norm.includes('web') || norm.includes('javascript') || norm.includes('js')) return DOMAIN_COMPILER_CONFIGS.femnstack;
  if (norm.includes('java') && !norm.includes('script')) return DOMAIN_COMPILER_CONFIGS.java;
  if (norm.includes('cpp') || norm.includes('c++')) return DOMAIN_COMPILER_CONFIGS.cpp;
  if (norm === 'c') return DOMAIN_COMPILER_CONFIGS.c;
  if (norm.includes('dsa') || norm.includes('structure') || norm.includes('algo')) return DOMAIN_COMPILER_CONFIGS.dsa;
  if (norm.includes('sql') || norm.includes('data')) return DOMAIN_COMPILER_CONFIGS.sql;
  if (norm.includes('cyber') || norm.includes('sec')) return DOMAIN_COMPILER_CONFIGS.cybersecurity;

  return {
    key: norm,
    title: domainKey,
    defaultLanguage: 'java',
    allowedLanguages: ['java', 'python', 'javascript', 'cpp'],
    compilers: [
      { id: 'java', name: 'Java (JDK 22)', lang: 'java' },
      { id: 'python', name: 'Python (3.11)', lang: 'python' },
      { id: 'javascript', name: 'JavaScript (Node.js)', lang: 'javascript' },
      { id: 'cpp', name: 'C++ (GCC)', lang: 'cpp' }
    ]
  };
}

export const MINIMAL_TEMPLATES = {
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your Java code here\n    }\n}`,
  python: `# Write your Python code here\nimport sys\n\ndef solve():\n    raw_input = sys.stdin.read().strip()\n    # Implement solution\n\nif __name__ == '__main__':\n    solve()\n`,
  javascript: `function solution() {\n    const str = prompt("");\n    // Write your code here\n    return str;\n}\n\nconst res = solution();\nconsole.log(res);\n`,
  cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n`
};

export function getDomainStarterCode(domain = '', language = 'java', topic = '') {
  const norm = (domain || '').toLowerCase().trim();
  const lang = (language || 'java').toLowerCase().trim();
  const titleStr = topic || 'Problem Solution';

  if (norm.includes('selenium')) {
    if (lang === 'python') {
      return `# Selenium Test Automation (Python)\n# Topic: ${titleStr}\nimport sys\n\ndef run_test():\n    raw_input = sys.stdin.read().strip()\n    # Implement automation logic\n    if raw_input:\n        print(f"Engineered: {raw_input}")\n    else:\n        print("Engineered: READY")\n\nif __name__ == '__main__':\n    run_test()\n`;
    }
    // Default Java for Selenium
    return `// Selenium Test Automation (Java)\n// Topic: ${titleStr}\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String input = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        // Implement automation logic\n        if (!input.isEmpty()) {\n            System.out.println("Engineered: " + input);\n        } else {\n            System.out.println("Engineered: READY");\n        }\n    }\n}\n`;
  }

  if (lang === 'python') {
    return `# Solution for: ${titleStr}\nimport sys\n\ndef solve():\n    raw_input = sys.stdin.read().strip()\n    # Implement solution here\n    if raw_input:\n        print(f"Solved: {raw_input.upper()}")\n    else:\n        print("Solved: READY")\n\nif __name__ == '__main__':\n    solve()\n`;
  }

  if (lang === 'javascript') {
    return `// Solution for: ${titleStr}\nfunction solution() {\n    const str = prompt("");\n    // Implement your solution here\n    return str;\n}\n\nconst res = solution();\nconsole.log(res);\n`;
  }

  if (lang === 'cpp') {
    return `// Solution for: ${titleStr}\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string input;\n    if (getline(cin, input)) {\n        cout << "Solved: " << input << endl;\n    } else {\n        cout << "Solved: READY" << endl;\n    }\n    return 0;\n}\n`;
  }

  return `// Solution for: ${titleStr}\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String input = sc.nextLine().trim();\n            System.out.println("Solved: " + input.toUpperCase());\n        } else {\n            System.out.println("Solved: READY");\n        }\n    }\n}\n`;
}

export function normalizeDomainKey(key) {
  if (!key) return 'all';
  const k = key.toString().toLowerCase().trim().replace(/[-_]/g, ' ');
  if (k === 'all' || k === 'all domains' || k === 'all-domains') return 'all';
  if (k.includes('selenium')) return 'selenium';
  if (k.includes('java') && !k.includes('script')) return 'java';
  if (k.includes('python')) return 'python';
  if (k.includes('javascript') || k.includes('js') || k.includes('react') || k.includes('frontend') || k.includes('web')) return 'javascript';
  if (k.includes('cpp') || k.includes('c++') || k === 'c') return 'cpp';
  if (k.includes('dsa') || k.includes('data structure') || k.includes('algorithm')) return 'dsa';
  if (k.includes('fullstack') || k.includes('full stack')) return 'fullstack';
  if (k.includes('sql') || k.includes('database')) return 'sql';
  if (k.includes('cyber') || k.includes('security')) return 'cybersecurity';
  return k;
}

export function isQuestionInDomain(q, domainKey) {
  const normTarget = normalizeDomainKey(domainKey);
  if (normTarget === 'all') return true;

  const qDom = normalizeDomainKey(q?.domain || '');
  const qCat = (q?.category || '').toLowerCase();
  const qTags = (q?.tags || []).map(t => normalizeDomainKey(t));
  const qTitle = (q?.title || '').toLowerCase();

  if (normTarget === 'selenium') {
    return (
      qDom === 'selenium' ||
      qTags.includes('selenium') ||
      qCat.includes('selenium') ||
      qTitle.includes('selenium')
    );
  }

  if (normTarget === 'java') {
    return (
      qDom === 'java' ||
      qTags.includes('java') ||
      qCat.includes('java') ||
      qTitle.includes('java')
    );
  }

  if (normTarget === 'python') {
    return (
      qDom === 'python' ||
      qTags.includes('python') ||
      qCat.includes('python') ||
      qTitle.includes('python')
    );
  }

  if (normTarget === 'cpp') {
    return (
      qDom === 'cpp' ||
      qTags.includes('cpp') ||
      qCat.includes('c++') ||
      qTitle.includes('c++')
    );
  }

  if (normTarget === 'javascript') {
    return (
      qDom === 'javascript' ||
      qTags.includes('javascript') ||
      qTags.includes('js') ||
      qTags.includes('react') ||
      qCat.includes('javascript') ||
      qCat.includes('frontend') ||
      qTitle.includes('javascript')
    );
  }

  if (normTarget === 'dsa') {
    const dsaCategories = [
      'arrays', 'binary tree', 'dynamic programming', 'graph', 'hashing',
      'linked list', 'queue', 'searching and sorting', 'sliding window',
      'stack', 'strings', 'two pointer', 'number logic', 'programming basics'
    ];
    return (
      qDom === 'dsa' ||
      qTags.includes('dsa') ||
      dsaCategories.some(c => qCat.includes(c))
    );
  }

  if (normTarget === 'fullstack') {
    return (
      qDom === 'fullstack' ||
      qTags.includes('fullstack')
    );
  }

  if (normTarget === 'sql') {
    return (
      qDom === 'sql' ||
      qTags.includes('sql') ||
      qCat.includes('sql')
    );
  }

  if (normTarget === 'cybersecurity') {
    return (
      qDom === 'cybersecurity' ||
      qTags.includes('cybersecurity') ||
      qTags.includes('security')
    );
  }

  return qDom === normTarget || qTags.includes(normTarget);
}

export function getStudentAllowedLanguages(studentProfile, userRole) {
  // All languages unlocked across domain courses
  return ['java', 'python', 'javascript', 'cpp'];
}

export function getStudentAllowedDomains(studentProfile, userRole) {
  return ['all', 'java', 'python', 'selenium', 'cpp', 'javascript', 'dsa', 'fullstack', 'sql', 'cybersecurity'];
}

export function isDomainAllowedForStudent(domainKey, allowedDomains) {
  return true;
}
