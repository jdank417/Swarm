type BurgeeKey = string;

export interface RaceEntry {
  id: string;
  boat: string;
  period?: string;
  venue: string;
  flags: BurgeeKey[];
  result?: string;
  bullets: string[];
}

export const racing: RaceEntry[] = [
  {
    id: 'fawn-libowitz',
    boat: 'Fawn Libowitz — MAT 1070',
    period: 'Apr 2025 — Present',
    venue: 'Boston Harbor — MBSA',
    flags: ['eyc'],
    result: 'Won Figawi 2026',
    bullets: [
      'Circulated between mast, pit, and bow throughout the season.',
      'Numerous regattas throughout the season across the MBSA (Spring, Summer, Fall).',
      'Pumpkin Pursuit Series.',
      'Wednesday night racing series — 2nd place overall.',
      'Thursday night racing series — 1st place overall.',
    ],
  },
  {
    id: 'tango',
    boat: 'Tango — IOD 16',
    venue: 'Marblehead — MRA',
    flags: ['eyc'],
    bullets: ['Jib trim and spinnaker for various MRA races.', 'Marblehead Race Week.'],
  },
  {
    id: 'gypsey',
    boat: 'Gypsey — IOD 7',
    venue: 'Marblehead & Fishers Island, NY',
    flags: ['eyc'],
    result: 'IOD North Americans',
    bullets: [
      'My most-sailed keelboat — many seasons of racing aboard IOD 7.',
      'IOD North American Championship at Fishers Island, NY.',
      'Corinthian Classic Yacht Regatta.',
    ],
  },
  {
    id: 'etchells',
    boat: 'Etchells (1071 / 1099)',
    venue: 'Marblehead — MRA',
    flags: ['cyc', 'byc'],
    bullets: [
      'Bow on Etchells 1071 for a few MRA races.',
      'Bow on Etchells 1099 (LiRuPa) for an MRA race.',
    ],
  },
  {
    id: 'crew-call',
    boat: 'Crew Call',
    period: 'Jul 2024 — Present',
    venue: 'Boston Harbor & Marblehead',
    flags: ['byc', 'eyc'],
    bullets: [
      'Raced on the BYC team racing team (bow) for the Eastern Yacht Club Halloween team race.',
      'Raced with ARES (C&C 40), doing bow for a few PHRF and pursuit events.',
      'Raced an MRA with IOD 49 Kungsornen doing jib and spinnaker.',
      'Raced on IOD Desperado in Marblehead, trimming jib — MRA (2024).',
    ],
  },
];

export interface ClubEntry {
  id: string;
  flag: BurgeeKey;
  name: string;
  location: string;
  period: string;
  bullets: string[];
  boats: string;
  link?: { label: string; href: string };
}

export const clubs: ClubEntry[] = [
  {
    id: 'eastern',
    flag: 'eyc',
    name: 'Eastern Yacht Club',
    location: 'Marblehead, MA',
    period: 'May 2026 — Present',
    bullets: ['Junior sailing member.'],
    boats: '',
  },
  {
    id: 'squantum',
    flag: 'syc',
    name: 'Squantum Yacht Club',
    location: 'Quincy, MA',
    period: '2024 — Present',
    bullets: [
      'Joined in the summer of 2024.',
      'Served as Launch Chairman for the summer of 2025.',
      'Quickly assumed the role of Assistant Director of Adult Sailing.',
      'Assisted with the Junior program, primarily the race team.',
      'Race Committee for the Lipton Cup 2024.',
    ],
    boats: 'Pearson 26 / J22 / Catalina 32 / C420 / Sonar 22 / Mercury (Keel) / Rhodes 19 / Laser',
  },
  {
    id: 'community-boating',
    flag: 'cbi',
    name: 'Community Boating Incorporated',
    location: 'Boston, MA',
    period: '2024 — Present',
    bullets: [
      'Joined in the summer of 2024.',
      'Became certified in almost their entire fleet of boats.',
      'Raced in the Monday night laser series.',
    ],
    boats: 'Fleet-certified',
  },
  {
    id: 'wentworth',
    flag: 'wit',
    name: 'Wentworth Sailing',
    location: 'Boston, MA',
    period: '2022 — 2026',
    bullets: [
      'Joined as a freshman in 2022; moved into the Captain role in the spring of freshman year and later served as President.',
      'Built the team from two to twenty-five members.',
      'Fall 2024: achieved the highest-scoring season since 2019.',
    ],
    boats: 'FJ / Z420 / E420 / Lark / Rhodes 19',
    link: { label: 'techscore', href: 'https://scores.collegesailing.org/schools/wentworth-institute/' },
  },
  {
    id: 'pjyc',
    flag: 'pjyc',
    name: 'Port Jefferson Yacht Club',
    location: 'Long Island — North Shore, NY',
    period: '2017 — 2023',
    bullets: [
      'Built out the race program, mostly scrimmages with local schools due to size.',
      'Group lessons, private lessons, and race training.',
      'Handled lesson plans and ensured proper instruction by subordinate instructors.',
      'Managed COVID-19 regulations.',
    ],
    boats: "C420 / Opti / Sunfish / Daysailer 16' / MacGregor 26 / J70 / Catalina",
  },
  {
    id: 'westhampton',
    flag: 'wys',
    name: 'Westhampton Yacht Squadron',
    location: 'Long Island — South Shore, NY',
    period: '2012 — 2016',
    bullets: [
      'First sailing experience — mostly learn-to-sail with some light racing.',
      'Sailed around the Great South Bay on various boats.',
    ],
    boats: 'Opti / JY / C420 / Flying Scot',
  },
];

export const certifications = [
  { name: 'US Sailing: Small Boat Instructor Level 1', detail: 'Teaching and Coaching Fundamentals' },
];

export const highlights = [
  { label: 'Won Figawi 2026', detail: 'Fawn Libowitz — MAT 1070' },
  { label: 'IOD North Americans', detail: 'Fishers Island, NY — IOD 7' },
  { label: '1st overall, Thursday series', detail: 'Boston Harbor — MBSA' },
];
