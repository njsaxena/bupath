import {
  COURSES,
  HUB_AREAS,
  MAJORS,
  type Course,
  type CourseTerm,
  type MajorId,
  type MinorId,
  type WorkloadPreference,
} from "./catalog";

export type PlannerProfile = {
  majorId: MajorId;
  minorId: MinorId;
  catalogYear: number;
  completedCourseCodes: string[];
  startSemester: string;
  targetCredits: number;
  workload: WorkloadPreference;
  dismissedCourseCodes: string[];
};

export type PlannedCourse = Course & {
  reasons: string[];
};

export type PlannedSemester = {
  label: string;
  courses: PlannedCourse[];
  credits: number;
  averageDifficulty: number;
};

export const DEFAULT_PROFILE: PlannerProfile = {
  majorId: "cs-ba",
  minorId: "none",
  catalogYear: 2025,
  completedCourseCodes: [],
  startSemester: "Fall 2026",
  targetCredits: 16,
  workload: "balanced",
  dismissedCourseCodes: [],
};

function termForLabel(label: string): CourseTerm {
  return label.startsWith("Spring") ? "Spring" : "Fall";
}

function semesterLabel(startSemester: string, offset: number): string {
  const [season, rawYear] = startSemester.split(" ");
  const startYear = Number(rawYear);
  const startsInSpring = season === "Spring";
  const isSpring = startsInSpring ? offset % 2 === 0 : offset % 2 === 1;
  const yearOffset = startsInSpring ? Math.floor(offset / 2) : Math.floor((offset + 1) / 2);
  const year = startYear + yearOffset;
  return `${isSpring ? "Spring" : "Fall"} ${year}`;
}

function courseOffered(course: Course, term: CourseTerm): boolean {
  return course.offered === "Both" || course.offered === term;
}

function courseScore(
  course: Course,
  majorProgram: string,
  minorId: MinorId,
  missingHubs: Set<string>,
  workload: WorkloadPreference,
): number {
  let score = 0;
  if (course.program.includes(majorProgram)) score += 100;
  if (minorId !== "none" && course.minor.includes(minorId)) score += 60;
  score += course.hubs.filter((hub) => missingHubs.has(hub)).length * 35;
  if (workload === "lighter") score += (6 - course.difficulty) * 2;
  if (workload === "challenging") score += course.difficulty * 2;
  return score;
}

function courseReasons(course: Course, majorProgram: string, minorId: MinorId, missingHubs: Set<string>): string[] {
  const reasons: string[] = [];
  if (course.program.includes(majorProgram)) reasons.push("Major course");
  if (minorId !== "none" && course.minor.includes(minorId)) reasons.push("Minor course");
  const relevantHubs = course.hubs.filter((hub) => missingHubs.has(hub));
  if (relevantHubs.length > 0) reasons.push(`HUB: ${relevantHubs.join(", ")}`);
  return reasons;
}

export function generatePlan(profile: PlannerProfile): PlannedSemester[] {
  const majorProgram = MAJORS.find((major) => major.id === profile.majorId)?.program;
  if (!majorProgram) return [];

  const completed = new Set(profile.completedCourseCodes);
  const dismissed = new Set(profile.dismissedCourseCodes);
  const completedHubs = new Set(
    COURSES
      .filter((course) => completed.has(course.code))
      .flatMap((course) => course.hubs),
  );
  const missingHubs = new Set(HUB_AREAS.filter((hub) => !completedHubs.has(hub)));
  const semesters: PlannedSemester[] = [];
  const previouslyPlanned: Set<string> = new Set(completed);

  for (let termIndex = 0; termIndex < 6; termIndex += 1) {
    const label = semesterLabel(profile.startSemester, termIndex);
    const term = termForLabel(label);
    const plannedThisTerm: PlannedCourse[] = [];
    let credits = 0;
    const candidates: Course[] = COURSES.filter((course) => {
      const servesProgram: boolean = course.program.includes(majorProgram)
        || (profile.minorId !== "none" && course.minor.includes(profile.minorId));
      const servesHub = course.hubs.some((hub) => missingHubs.has(hub));
      return !previouslyPlanned.has(course.code)
        && !dismissed.has(course.code)
        && (servesProgram || servesHub)
        && courseOffered(course, term)
        && course.prerequisites.every((prerequisite) => previouslyPlanned.has(prerequisite));
    }).sort((left, right) =>
      courseScore(right, majorProgram, profile.minorId, missingHubs, profile.workload)
      - courseScore(left, majorProgram, profile.minorId, missingHubs, profile.workload)
      || left.code.localeCompare(right.code),
    );

    const firstHubCourse = candidates.find((course) => {
      const servesProgram = course.program.includes(majorProgram)
        || (profile.minorId !== "none" && course.minor.includes(profile.minorId));
      return !servesProgram
        && credits + course.credits <= profile.targetCredits
        && course.hubs.some((hub) => missingHubs.has(hub));
    });

    if (firstHubCourse) {
      plannedThisTerm.push({
        ...firstHubCourse,
        reasons: courseReasons(firstHubCourse, majorProgram, profile.minorId, missingHubs),
      });
      credits += firstHubCourse.credits;
      for (const hub of firstHubCourse.hubs) missingHubs.delete(hub);
    }

    for (const course of candidates) {
      if (plannedThisTerm.some((plannedCourse) => plannedCourse.code === course.code)) continue;
      if (credits + course.credits > profile.targetCredits) continue;
      const stillFillsHub = course.hubs.some((hub) => missingHubs.has(hub));
      const servesProgram: boolean = course.program.includes(majorProgram)
        || (profile.minorId !== "none" && course.minor.includes(profile.minorId));
      if (!servesProgram && !stillFillsHub) continue;
      const reasons = courseReasons(course, majorProgram, profile.minorId, missingHubs);
      plannedThisTerm.push({ ...course, reasons });
      credits += course.credits;
    }

    if (plannedThisTerm.length === 0) break;

    for (const course of plannedThisTerm) {
      previouslyPlanned.add(course.code);
      for (const hub of course.hubs) missingHubs.delete(hub);
    }

    semesters.push({
      label,
      courses: plannedThisTerm,
      credits,
      averageDifficulty: plannedThisTerm.reduce((sum, course) => sum + course.difficulty, 0)
        / plannedThisTerm.length,
    });
  }

  return semesters;
}

export function isCourseEligible(course: Course, completedCourseCodes: string[]): boolean {
  return course.prerequisites.every((prerequisite) => completedCourseCodes.includes(prerequisite));
}
