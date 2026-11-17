export type MajorId = "cs-ba" | "cs-bs" | "economics" | "biology" | "psychology";
export type MinorId = "none" | "data-science" | "mathematics" | "philosophy";
export type WorkloadPreference = "lighter" | "balanced" | "challenging";
export type CourseTerm = "Fall" | "Spring" | "Both";

export type Major = {
  id: MajorId;
  label: string;
  program: string;
};

export type Minor = {
  id: MinorId;
  label: string;
};

export type Course = {
  code: string;
  title: string;
  credits: number;
  program: string[];
  minor: MinorId[];
  prerequisites: string[];
  hubs: string[];
  difficulty: number;
  offered: CourseTerm;
};

export const MAJORS: Major[] = [
  { id: "cs-ba", label: "Computer Science BA", program: "Computer Science" },
  { id: "cs-bs", label: "Computer Science BS", program: "Computer Science" },
  { id: "economics", label: "Economics BA", program: "Economics" },
  { id: "biology", label: "Biology BA", program: "Biology" },
  { id: "psychology", label: "Psychology BA", program: "Psychology" },
];

export const MINORS: Minor[] = [
  { id: "none", label: "No minor" },
  { id: "data-science", label: "Data Science" },
  { id: "mathematics", label: "Mathematics" },
  { id: "philosophy", label: "Philosophy" },
];

export const HUB_AREAS = [
  "Writing Intensive",
  "Scientific Inquiry",
  "Social Inquiry",
  "Ethical Reasoning",
];

export const COURSES: Course[] = [
  { code: "CAS CS 111", title: "Introduction to Computer Science", credits: 4, program: ["Computer Science"], minor: [], prerequisites: [], hubs: [], difficulty: 2, offered: "Both" },
  { code: "CAS CS 121", title: "Introduction to Programming", credits: 4, program: ["Computer Science"], minor: [], prerequisites: [], hubs: [], difficulty: 2, offered: "Both" },
  { code: "CAS CS 131", title: "Computation and Problem Solving", credits: 4, program: ["Computer Science"], minor: ["data-science"], prerequisites: ["CAS CS 111"], hubs: [], difficulty: 3, offered: "Both" },
  { code: "CAS CS 210", title: "Computer Systems", credits: 4, program: ["Computer Science"], minor: [], prerequisites: ["CAS CS 121"], hubs: [], difficulty: 3, offered: "Fall" },
  { code: "CAS CS 235", title: "Data Structures", credits: 4, program: ["Computer Science"], minor: ["data-science"], prerequisites: ["CAS CS 121", "CAS CS 131"], hubs: [], difficulty: 4, offered: "Both" },
  { code: "CAS CS 320", title: "Concepts of Programming Languages", credits: 4, program: ["Computer Science"], minor: [], prerequisites: ["CAS CS 235"], hubs: [], difficulty: 4, offered: "Fall" },
  { code: "CAS CS 330", title: "Computer Architecture", credits: 4, program: ["Computer Science"], minor: [], prerequisites: ["CAS CS 210"], hubs: [], difficulty: 4, offered: "Spring" },
  { code: "CAS CS 411", title: "Software Engineering", credits: 4, program: ["Computer Science"], minor: [], prerequisites: ["CAS CS 235"], hubs: [], difficulty: 3, offered: "Both" },
  { code: "CAS MA 123", title: "Calculus I", credits: 4, program: ["Computer Science", "Economics"], minor: ["mathematics"], prerequisites: [], hubs: ["Quantitative Reasoning"], difficulty: 3, offered: "Both" },
  { code: "CAS MA 124", title: "Calculus II", credits: 4, program: ["Computer Science", "Economics"], minor: ["mathematics"], prerequisites: ["CAS MA 123"], hubs: [], difficulty: 3, offered: "Both" },
  { code: "CAS MA 225", title: "Multivariate Calculus", credits: 4, program: ["Computer Science"], minor: ["mathematics"], prerequisites: ["CAS MA 124"], hubs: [], difficulty: 4, offered: "Fall" },
  { code: "ENG EK 381", title: "Probability and Statistics", credits: 4, program: ["Computer Science"], minor: ["data-science"], prerequisites: ["CAS MA 123"], hubs: ["Quantitative Reasoning"], difficulty: 3, offered: "Both" },
  { code: "CAS DS 110", title: "Introduction to Data Science", credits: 4, program: [], minor: ["data-science"], prerequisites: [], hubs: [], difficulty: 2, offered: "Both" },
  { code: "CAS DS 210", title: "Data Science Tools and Applications", credits: 4, program: [], minor: ["data-science"], prerequisites: ["CAS DS 110"], hubs: [], difficulty: 3, offered: "Spring" },
  { code: "CAS WR 120", title: "First-Year Writing Seminar", credits: 4, program: [], minor: [], prerequisites: [], hubs: ["Writing Intensive"], difficulty: 2, offered: "Both" },
  { code: "CAS BI 108", title: "Biology of Cells", credits: 4, program: ["Biology"], minor: [], prerequisites: [], hubs: ["Scientific Inquiry"], difficulty: 2, offered: "Both" },
  { code: "CAS BI 211", title: "Cell Biology", credits: 4, program: ["Biology"], minor: [], prerequisites: ["CAS BI 108"], hubs: [], difficulty: 4, offered: "Fall" },
  { code: "CAS BI 315", title: "Genetics", credits: 4, program: ["Biology"], minor: [], prerequisites: ["CAS BI 108"], hubs: [], difficulty: 4, offered: "Spring" },
  { code: "CAS EC 101", title: "Microeconomic Principles", credits: 4, program: ["Economics"], minor: [], prerequisites: [], hubs: ["Social Inquiry"], difficulty: 2, offered: "Both" },
  { code: "CAS EC 201", title: "Intermediate Microeconomic Analysis", credits: 4, program: ["Economics"], minor: [], prerequisites: ["CAS EC 101"], hubs: [], difficulty: 4, offered: "Fall" },
  { code: "CAS EC 202", title: "Intermediate Macroeconomic Analysis", credits: 4, program: ["Economics"], minor: [], prerequisites: ["CAS EC 101"], hubs: [], difficulty: 4, offered: "Spring" },
  { code: "CAS PS 101", title: "Introduction to Psychology", credits: 4, program: ["Psychology"], minor: [], prerequisites: [], hubs: ["Social Inquiry"], difficulty: 2, offered: "Both" },
  { code: "CAS PS 201", title: "Introduction to Psychological Statistics", credits: 4, program: ["Psychology"], minor: [], prerequisites: ["CAS PS 101"], hubs: ["Quantitative Reasoning"], difficulty: 3, offered: "Both" },
  { code: "CAS PS 222", title: "Developmental Psychology", credits: 4, program: ["Psychology"], minor: [], prerequisites: ["CAS PS 101"], hubs: [], difficulty: 3, offered: "Fall" },
  { code: "CAS PH 100", title: "Introduction to Philosophy", credits: 4, program: [], minor: ["philosophy"], prerequisites: [], hubs: ["Ethical Reasoning"], difficulty: 2, offered: "Both" },
  { code: "CAS PH 150", title: "Introduction to Ethics", credits: 4, program: [], minor: ["philosophy"], prerequisites: [], hubs: ["Ethical Reasoning"], difficulty: 2, offered: "Spring" },
  { code: "CAS PH 250", title: "Topics in Philosophy", credits: 4, program: [], minor: ["philosophy"], prerequisites: ["CAS PH 100"], hubs: [], difficulty: 3, offered: "Fall" },
];
