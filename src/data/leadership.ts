// Leadership roles, honors and certifications, shared by the home page and
// the résumé.
export interface LeadershipItem {
  id: string;
  title: string;
  org: string;
  period: string;
  description: string[];
  credlyId?: string;
}

export const leadership: LeadershipItem[] = [
  {
    id: 'paragon-award',
    title: 'Paragon Award',
    org: 'Wentworth Institute of Technology',
    period: 'March 2026',
    description: [
      'Presented to a graduating student who has exhibited energy and enthusiasm for their leadership role during their years at Wentworth.',
      'Awarded for significant and noteworthy contributions to the Wentworth community and for serving as a strong role model for classmates.',
    ],
  },
  {
    id: 'honors-program',
    title: 'Wentworth Honors Program',
    org: 'Wentworth Institute of Technology',
    period: 'March 2026',
    description: ['Inducted into the university honors program.'],
  },
  {
    id: 'sailing-captain',
    title: 'President & Captain, Wentworth Sailing Team',
    org: 'NEISA Conference — Dinghy Class (FJ / 420 / Lark)',
    period: 'Spring 2023 — Spring 2026',
    description: [
      'Grew the team from two members to twenty-five and led it across 15+ regional regattas per season.',
      'Ran registration, the executive board, fundraisers, scrimmages, and practices; worked directly with the coach on competitive goals.',
      'Delivered the highest-performing season the program has had since 2019.',
    ],
  },
  {
    id: 'evp',
    title: 'Executive Vice President',
    org: 'Wentworth Student Government',
    period: 'Fall 2025 — Spring 2026',
    description: [
      'Led the Board of Directors in reorganizing and optimizing all processes, facilitating increased collaboration between directors and university officials as chairman.',
      'Applied Agile practices from co-op to student government, including a Jira board to keep initiatives on track.',
      'Oversaw the creation of a committee to run a hackathon brokered between Student Government and the School of Computing and Data Science.',
      'Implemented communication pipelines between all university units and board directors, optimizing feedback delivery.',
      'Coordinated with the Provost, Registrar, and faculty to resolve a clerical application error involving minor completion requirements.',
    ],
  },
  {
    id: 'ai-task-force',
    title: 'Task Force on Gen AI & Academic Integrity',
    org: 'Student Body Representative, Wentworth Institute of Technology',
    period: 'Fall 2025 — Spring 2026',
    description: [
      'Advised the task force on AI-based enhancements across campus and on integrating AI into the curriculum.',
      'Explored methods to help faculty detect, document, and minimize GenAI-based academic misconduct.',
      'Paneled at an AI Alliance event hosted at Wentworth alongside founders and CTOs of Boston-area AI and tech firms.',
    ],
  },
  {
    id: 'itsc',
    title: 'Information Technology Steering Committee',
    org: 'Student Body Representative, Wentworth Institute of Technology',
    period: 'Fall 2025 — Spring 2026',
    description: [
      'Guided campus-wide strategic technology decisions in partnership with the CIO, IT Executive Committee, and Project Management Team.',
      'Reviewed business proposals ahead of meetings, shaping technology procurement and implementation strategy.',
      'Contributed to a seven-figure learning management system procurement.',
    ],
  },
  {
    id: 'business-affairs',
    title: 'Director of Business Affairs',
    org: 'Wentworth Student Government',
    period: 'Fall 2024 — Fall 2025',
    description: [
      'Chaired the Business Affairs Committee; coordinated efforts between the student body and Dining, IT, Police, and Facilities.',
      'Shipped a barcode scanner web app giving students real-time price data in the campus grocery store, and introduced halal and kosher items to the dining hall.',
    ],
  },
  {
    id: 'hacking-injustice',
    title: 'Director of Technologies',
    org: 'Engineering Hope (Non-Profit) — Hacking Injustice 2025',
    period: 'Dec 2024 — Apr 2025',
    description: [
      'Built the digital infrastructure for an intercollegiate hackathon hosted at Harvard University.',
      'Procured tooling licenses ahead of the event and assembled a technical team to advise competing students.',
    ],
  },
  {
    id: 'jamf',
    title: 'Jamf Certified Associate — Jamf Protect / Jamf Pro',
    org: 'Jamf',
    period: 'Jan 2025 — Mar 2025',
    description: [
      'Certified in Jamf Protect and Jamf Pro, endpoint security and mobile device management (MDM) solutions for Apple products.',
    ],
  },
];

export const credlyIds: Record<string, string> = {
  jamf: 'e5fd2530-7870-4762-9f30-2c537853b165',
};
