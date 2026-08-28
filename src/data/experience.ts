/**
 * The experience timeline. Traces to `portfolio-content.md` section 8.
 *
 * Five of these date ranges overlap. Read as a flat list that looks like
 * job-hopping, so the rail renders them as branches off a single Maxxsol trunk:
 * one employer since 2014, with parallel client engagements hanging off it.
 * The structure is the explanation — it is not a footnote under a table.
 */
export const EMPLOYER = {
  name: "Maxxsol",
  location: "Lahore, Pakistan",
  period: "December 2014 – Present",
  progression: "Mobile Developer → Senior Mobile Engineer → Mobile Team Lead",
  note: "A software agency. Every engagement below sits under a single employer — overlapping dates are parallel client work, not separate jobs.",
} as const;

export type Engagement = {
  period: string;
  name: string;
  role: string;
  current: boolean;
};

export const ENGAGEMENTS: Engagement[] = [
  {
    period: "Jan 2025 – Present",
    name: "MaxKids: Coloring World",
    role: "Senior Flutter Developer",
    current: true,
  },
  {
    period: "Dec 2024 – Present",
    name: "Metal Men",
    role: "Flutter Developer",
    current: true,
  },
  {
    period: "Dec 2023 – Apr 2025",
    name: "Drone Inspection Controller",
    role: "Android Developer, DJI Specialist",
    current: false,
  },
  {
    period: "Aug 2023 – May 2025",
    name: "MiMesa",
    role: "Mobile Team Lead",
    current: false,
  },
  {
    period: "Jun 2020 – Aug 2023",
    name: "AvoMD",
    role: "Mobile Team Lead",
    current: false,
  },
  {
    period: "Apr 2020 – Oct 2024",
    name: "PhraseShare",
    role: "Mobile Team Lead",
    current: false,
  },
  {
    period: "Dec 2014 – 2020",
    name: "25+ apps across React Native and native Android",
    role: "Mobile Developer → Senior Mobile Engineer",
    current: false,
  },
];

export const EDUCATION = {
  degree: "BS, Computer Science & Engineering",
  school: "University of Central Punjab (UCP), Lahore",
  period: "2010 – 2014",
} as const;
