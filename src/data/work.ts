export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  achievements: string[];
  stack: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: 'fidelity-private-shares',
    title: 'Full Stack Software Engineer',
    company: 'Fidelity Investments',
    location: 'Boston Seaport, MA — On-site',
    period: 'Apr 2026 — Present',
    current: true,
    achievements: [
      'Build on the Fidelity Private Shares platform, developing scalable solutions for private market investments.',
      'Ship full-stack applications with modern web technologies, improving the experience for private equity and venture capital transactions.',
      'Partner with cross-functional teams to deliver financial technology used by institutional and individual investors.',
    ],
    stack: ['React', 'Node.js', 'Java', 'Spring Boot', 'Private Markets', 'Fintech'],
  },
  {
    id: 'harvard-endpoint',
    title: 'Endpoint Systems Engineer Intern',
    company: 'Harvard University Information Technology',
    location: 'Cambridge, MA — Hybrid',
    period: 'Jan 2025 — Mar 2026 · two terms',
    achievements: [
      'Managed over 20,000 macOS, Windows, and Linux endpoints; maintained system stability across the university.',
      "Acted as service owner and engineer for the university's data retention service.",
      'Owned a 1,000-device remediation effort, closing a three-year backlog ahead of architecting a replacement process.',
      'Built a Mac device renaming solution now used across Harvard departments, plus custom cross-platform monitoring applications.',
      'Automated workflows with PowerShell and Unix scripting; contributed to cloud printing infrastructure.',
      'Led large-scale stakeholder meetings and ran delivery in Jira using Agile practices.',
    ],
    stack: ['Shell', 'PowerShell', 'Jamf Pro', 'SCCM', 'Linux', 'Jira Align'],
  },
  {
    id: 'mouth-watchers',
    title: 'IT Services Consultant',
    company: 'Mouth Watchers LLC',
    location: 'Beverly, MA — Hybrid',
    period: 'Jun 2025 — Aug 2025',
    achievements: [
      'Audited every technical system in the company, then engineered a migration from Network Solutions to Google for email and hosting.',
      'Held total downtime to 15 minutes across the cutover and provided ongoing tier 1 support post-launch.',
    ],
    stack: ['DevOps', 'Google Workspace', 'DNS', 'Migration'],
  },
  {
    id: 'wicked-pickleball',
    title: 'Technical Program and Operations Manager',
    company: 'Wicked Pickleball (RSVP LLC)',
    location: 'Boston, MA — Hybrid',
    period: 'May 2025 — Aug 2025',
    achievements: [
      'Managed a team of sales and marketing specialists; piloted private label and brand deal product lines.',
      'Served as lead engineer and service owner for MVP testing and development of new platforms.',
      'Oversaw contractors and drove projects to completion.',
    ],
    stack: ['Agile', 'MVP Development', 'Program Management'],
  },
  {
    id: 'wit-tutor',
    title: 'Computer Science Tutor',
    company: 'Wentworth Institute of Technology',
    location: 'Boston, MA',
    period: 'Jan 2024 — Jan 2025',
    achievements: [
      'Tutored students across the School of Computing and Data Science in 1-on-1 appointments and group review sessions.',
      'Developed individualized plans for each student, tailoring support to their course needs.',
    ],
    stack: ['Java', 'Python', 'C', 'Teaching'],
  },
  {
    id: 'harvard-support',
    title: 'Technical Support Engineer Intern',
    company: 'Harvard University Information Technology',
    location: 'Cambridge, MA — On-site',
    period: 'Apr 2024 — Aug 2024',
    achievements: [
      'Maintained security standards across the Allston/SEAS network for 2,000+ users; imaged and deployed machines to users and labs.',
      'Built automation tools in PowerShell, Batch, and Python, and authored documentation that improved technician onboarding.',
      'Mentored new contractors and worked with management on incident response during the 2024 CrowdStrike outage.',
    ],
    stack: ['Python', 'PowerShell', 'ServiceNow', 'Jamf', 'SCCM'],
  },
  {
    id: 'pjyc',
    title: 'Sailing Instructor',
    company: 'Port Jefferson Yacht Club',
    location: 'Port Jefferson, NY',
    period: 'May 2019 — Aug 2023',
    achievements: [
      'Taught sailing to 300–400 students (ages 6–75), developing comfort on the water and racing skills.',
      'Instructed in group and private settings, bringing students to readiness for their first races.',
    ],
    stack: ['Instruction', 'Race Coaching'],
  },
];
