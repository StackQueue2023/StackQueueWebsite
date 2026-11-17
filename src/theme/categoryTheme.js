/**
 * STACK QUEUE — Complete Website Category-Wise Theme Configuration
 *
 * Exact visual specification:
 *   1. COURSE (Blue Theme):
 *      - Section background: #F2F7FF
 *      - Card background: #FFFFFF
 *      - Primary accent: #2563EB
 *      - Heading & text: #172554 (dark navy)
 *      - Buttons: Blue (#2563EB / #1D4ED8)
 *      - Borders: #DBEAFE
 *      - Icons: #2563EB
 *      - Badges: Light blue background with blue text
 *      - Progress bars: Blue
 *      - Hover: Stronger blue border (#93C5FD) and soft blue shadow
 *
 *   2. INTERNSHIP (Green Theme):
 *      - Section background: #F0FDF8 (very light mint green)
 *      - Card background: #FFFFFF
 *      - Primary accent: #059669 (emerald green)
 *      - Heading & text: #064E3B / #065F46 (dark green)
 *      - Buttons: Green (#059669 / #047857)
 *      - Borders: #A7F3D0
 *      - Icons: #059669
 *      - Badges: Light green background with green text
 *      - Progress bars: Green
 *      - Hover: Soft green shadow and border (#6EE7B7)
 *
 *   3. PRODUCTS & PROJECTS (Yellow / Orange Theme):
 *      - Section background: #FFFBEB (very light yellow)
 *      - Card background: #FFFFFF
 *      - Primary accent: #D97706 (amber / orange)
 *      - Heading & text: #451A03 / #78350F (dark brown/amber)
 *      - Buttons: Orange / Amber (#D97706 / #B45309)
 *      - Borders: #FDE68A
 *      - Icons: #D97706
 *      - Badges: Light yellow background with orange text
 *      - Progress bars: Orange / Amber
 *      - Hover: Soft yellow shadow and border (#FCD34D)
 *
 *   4. OTHER WEBSITE MODULES:
 *      - Retains STACK QUEUE pink-to-violet gradient theme (#F8F7FC background)
 */

export const CATEGORY_THEME = {
  course: {
    key: 'course',
    label: 'Course',
    sectionBg: 'bg-[#F2F7FF]',
    surface: 'bg-[#F2F7FF]',
    card: 'bg-white border border-[#DBEAFE] text-[#172554] shadow-xs',
    text: 'text-[#2563EB]',
    heading: 'text-[#172554]',
    subtext: 'text-[#1D4ED8]',
    icon: 'text-[#2563EB]',
    border: 'border-[#DBEAFE]',
    strongBorder: 'border-[#2563EB]',
    hover: 'hover:border-[#93C5FD] hover:shadow-md hover:shadow-blue-500/10',
    button: 'bg-[#2563EB] hover:bg-[#1D4ED8] border border-[#2563EB] text-white font-bold transition shadow-xs',
    buttonOutline: 'bg-white hover:bg-blue-50 text-[#2563EB] border border-[#DBEAFE] hover:border-[#2563EB] font-bold transition',
    badge: 'bg-blue-50 border border-[#DBEAFE] text-[#2563EB] font-bold',
    badgePill: 'bg-purple-100/80 border border-purple-200 text-purple-700',
    activeNav: 'bg-blue-50 border border-[#DBEAFE] text-[#2563EB] font-bold',
    progressTrack: 'bg-blue-100',
    progressFill: 'bg-[#2563EB]',
    ring: 'focus:ring-[#2563EB]',
    accentTop: 'border-t-4 border-t-[#2563EB]',
    hexBg: '#F2F7FF',
    hexPrimary: '#2563EB',
    hexBorder: '#DBEAFE',
    hexHeading: '#172554',
  },
  internship: {
    key: 'internship',
    label: 'Internship',
    sectionBg: 'bg-[#F0FDF8]',
    surface: 'bg-[#F0FDF8]',
    card: 'bg-white border border-[#A7F3D0] text-[#064E3B] shadow-xs',
    text: 'text-[#059669]',
    heading: 'text-[#064E3B]',
    subtext: 'text-[#047857]',
    icon: 'text-[#059669]',
    border: 'border-[#A7F3D0]',
    strongBorder: 'border-[#059669]',
    hover: 'hover:border-[#6EE7B7] hover:shadow-md hover:shadow-emerald-500/10',
    button: 'bg-[#059669] hover:bg-[#047857] border border-[#059669] text-white font-bold transition shadow-xs',
    buttonOutline: 'bg-white hover:bg-emerald-50 text-[#059669] border border-[#A7F3D0] hover:border-[#059669] font-bold transition',
    badge: 'bg-emerald-50 border border-[#A7F3D0] text-[#059669] font-bold',
    badgePill: 'bg-emerald-100/80 border border-[#A7F3D0] text-[#059669]',
    activeNav: 'bg-emerald-50 border border-[#A7F3D0] text-[#059669] font-bold',
    progressTrack: 'bg-emerald-100',
    progressFill: 'bg-[#059669]',
    ring: 'focus:ring-[#059669]',
    accentTop: 'border-t-4 border-t-[#059669]',
    hexBg: '#F0FDF8',
    hexPrimary: '#059669',
    hexBorder: '#A7F3D0',
    hexHeading: '#064E3B',
  },
  product: {
    key: 'product',
    label: 'Product',
    sectionBg: 'bg-[#FFFBEB]',
    surface: 'bg-[#FFFBEB]',
    card: 'bg-white border border-[#FDE68A] text-[#451A03] shadow-xs',
    text: 'text-[#D97706]',
    heading: 'text-[#451A03]',
    subtext: 'text-[#B45309]',
    icon: 'text-[#D97706]',
    border: 'border-[#FDE68A]',
    strongBorder: 'border-[#D97706]',
    hover: 'hover:border-[#FCD34D] hover:shadow-md hover:shadow-amber-500/10',
    button: 'bg-[#D97706] hover:bg-[#B45309] border border-[#D97706] text-white font-bold transition shadow-xs',
    buttonOutline: 'bg-white hover:bg-amber-50 text-[#D97706] border border-[#FDE68A] hover:border-[#D97706] font-bold transition',
    badge: 'bg-amber-50 border border-[#FDE68A] text-[#D97706] font-bold',
    badgePill: 'bg-pink-50 border border-pink-200 text-pink-600',
    activeNav: 'bg-amber-50 border border-[#FDE68A] text-[#D97706] font-bold',
    progressTrack: 'bg-amber-100',
    progressFill: 'bg-[#D97706]',
    ring: 'focus:ring-[#D97706]',
    accentTop: 'border-t-4 border-t-[#D97706]',
    hexBg: '#FFFBEB',
    hexPrimary: '#D97706',
    hexBorder: '#FDE68A',
    hexHeading: '#451A03',
  },
  project: {
    key: 'project',
    label: 'Project',
    sectionBg: 'bg-[#FFFBEB]',
    surface: 'bg-[#FFFBEB]',
    card: 'bg-white border border-[#FDE68A] text-[#451A03] shadow-xs',
    text: 'text-[#D97706]',
    heading: 'text-[#451A03]',
    subtext: 'text-[#B45309]',
    icon: 'text-[#D97706]',
    border: 'border-[#FDE68A]',
    strongBorder: 'border-[#D97706]',
    hover: 'hover:border-[#FCD34D] hover:shadow-md hover:shadow-amber-500/10',
    button: 'bg-[#D97706] hover:bg-[#B45309] border border-[#D97706] text-white font-bold transition shadow-xs',
    buttonOutline: 'bg-white hover:bg-amber-50 text-[#D97706] border border-[#FDE68A] hover:border-[#D97706] font-bold transition',
    badge: 'bg-amber-50 border border-[#FDE68A] text-[#D97706] font-bold',
    badgePill: 'bg-amber-100 border border-[#FDE68A] text-[#B45309]',
    activeNav: 'bg-amber-50 border border-[#FDE68A] text-[#D97706] font-bold',
    progressTrack: 'bg-amber-100',
    progressFill: 'bg-[#D97706]',
    ring: 'focus:ring-[#D97706]',
    accentTop: 'border-t-4 border-t-[#D97706]',
    hexBg: '#FFFBEB',
    hexPrimary: '#D97706',
    hexBorder: '#FDE68A',
    hexHeading: '#451A03',
  },
  gradient: {
    key: 'gradient',
    label: 'Platform',
    sectionBg: 'bg-[#F8F7FC]',
    surface: 'bg-[#F8F7FC]',
    card: 'bg-white border border-slate-200 text-slate-900 shadow-xs',
    text: 'text-sq-gradient',
    heading: 'text-slate-900',
    subtext: 'text-[#9333EA]',
    icon: 'text-[#9333EA]',
    border: 'border-purple-200',
    strongBorder: 'border-[#9333EA]',
    hover: 'hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10',
    button: 'bg-sq-gradient text-white border-0 shadow-sm hover:opacity-95 font-bold transition',
    buttonOutline: 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-500 font-bold transition',
    badge: 'bg-purple-50 border border-purple-200 text-purple-700 font-bold',
    badgePill: 'bg-purple-100/80 border border-purple-200 text-purple-700',
    activeNav: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA] text-white border-transparent font-bold shadow-sm',
    progressTrack: 'bg-purple-100',
    progressFill: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA]',
    ring: 'focus:ring-purple-500',
    accentTop: 'border-t-4 border-t-[#9333EA]',
    hexBg: '#F8F7FC',
    hexPrimary: '#9333EA',
    hexBorder: '#E2E8F0',
    hexHeading: '#0F172A',
  }
};

export function getCategoryTheme(category = 'gradient') {
  const k = String(category || '').toLowerCase().trim();
  if (k === 'course' || k === 'courses' || k === 'syllabus' || k === 'module' || k === 'modules' || k === 'batch' || k === 'batches') {
    return CATEGORY_THEME.course;
  }
  if (k === 'internship' || k === 'internships') {
    return CATEGORY_THEME.internship;
  }
  if (k === 'project' || k === 'projects') {
    return CATEGORY_THEME.project;
  }
  if (k === 'product' || k === 'products') {
    return CATEGORY_THEME.product;
  }
  return CATEGORY_THEME.gradient;
}

export function detectRouteCategory(pathname = '') {
  const p = String(pathname || '').toLowerCase();
  if (
    p.includes('/courses') ||
    p.includes('/course') ||
    p.includes('/syllabus') ||
    p.includes('/batches') ||
    p.includes('/learning-path') ||
    p.includes('/admin/lms') ||
    p.includes('/admin/courses') ||
    p.includes('/admin/analytics/courses') ||
    p.includes('/college-training')
  ) {
    return 'course';
  }
  if (
    p.includes('/internships') ||
    p.includes('/internship') ||
    p.includes('/admin/internships') ||
    p.includes('/admin/analytics/internships')
  ) {
    return 'internship';
  }
  if (
    p.includes('/projects') ||
    p.includes('/project') ||
    p.includes('/admin/projects') ||
    p.includes('/admin/analytics/college-projects')
  ) {
    return 'project';
  }
  if (
    p.includes('/products') ||
    p.includes('/product') ||
    p.includes('/admin/products') ||
    p.includes('/admin/analytics/products')
  ) {
    return 'product';
  }
  return 'gradient';
}
