"use client";

import { useState } from "react";
import Link from "next/link";
import { COURSES, MAJORS, MINORS } from "../lib/catalog";
import { generatePlan } from "../lib/planner";
import { usePlanner } from "./planner-provider";

type Filter = "recommended" | "all" | "hub";

function difficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Introductory";
  if (difficulty === 3) return "Moderate";
  return "Advanced";
}

export function FindClassesPage() {
  const { profile } = usePlanner();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("recommended");
  const semesters = generatePlan(profile);
  const plannedCodes = new Set(semesters.flatMap((semester) => semester.courses.map((course) => course.code)));
  const major = MAJORS.find((item) => item.id === profile.majorId);
  const minor = MINORS.find((item) => item.id === profile.minorId);
  const normalizedQuery = query.trim().toLowerCase();
  const prerequisitesBeforeCourse = new Map<string, Set<string>>();
  const prerequisitesInEarlierTerms = new Set(profile.completedCourseCodes);
  for (const semester of semesters) {
    for (const course of semester.courses) {
      prerequisitesBeforeCourse.set(course.code, new Set(prerequisitesInEarlierTerms));
    }
    for (const course of semester.courses) prerequisitesInEarlierTerms.add(course.code);
  }

  const filteredCourses = COURSES.filter((course) => {
    const isRecommended = plannedCodes.has(course.code)
      || course.program.includes(major?.program ?? "")
      || (profile.minorId !== "none" && course.minor.includes(profile.minorId));
    const matchesFilter = filter === "all"
      || (filter === "hub" && course.hubs.length > 0)
      || (filter === "recommended" && isRecommended);
    const matchesSearch = !normalizedQuery
      || `${course.code} ${course.title} ${course.program.join(" ")} ${course.hubs.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesFilter && matchesSearch;
  }).sort((left, right) => {
    const leftPlanned = plannedCodes.has(left.code);
    const rightPlanned = plannedCodes.has(right.code);
    return Number(rightPlanned) - Number(leftPlanned) || left.code.localeCompare(right.code);
  });

  return (
    <main className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Course catalog</p>
          <h1>Find classes that fit your plan</h1>
          <p className="page-description">
            Browse courses and see how they connect to your {major?.label}
            {minor && minor.id !== "none" ? ` and ${minor.label} minor` : ""}.
          </p>
        </div>
        <Link className="button button-outline" href="/academic-info">Update my courses</Link>
      </section>

      <section className="catalog-panel" aria-label="Course search and results">
        <label className="class-search">
          <span className="sr-only">Search courses</span>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search course code, title, or HUB area"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>
          )}
        </label>

        <div className="filter-tabs" role="group" aria-label="Filter classes">
          {([
            ["recommended", "For my plan"],
            ["all", "All classes"],
            ["hub", "HUB courses"],
          ] as const).map(([value, label]) => (
            <button
              aria-pressed={filter === value}
              className={filter === value ? "filter-tab selected" : "filter-tab"}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="catalog-results" aria-live="polite">
          {filteredCourses.length > 0 ? filteredCourses.map((course) => {
            const isPlanned = plannedCodes.has(course.code);
            const availableBeforeThisCourse = prerequisitesBeforeCourse.get(course.code)
              ?? new Set(profile.completedCourseCodes);
            const missingPrerequisites = course.prerequisites.filter(
              (prerequisite) => !availableBeforeThisCourse.has(prerequisite),
            );
            const eligible = missingPrerequisites.length === 0;
            return (
              <article className="catalog-course" key={course.code}>
                <div className="catalog-course-main">
                  <div className="catalog-course-code">
                    <strong>{course.code}</strong>
                    <span>{course.credits} credits</span>
                  </div>
                  <h2>{course.title}</h2>
                  <div className="course-tags">
                    {course.program.includes(major?.program ?? "") && (
                      <span className="course-tag">{major?.program} major</span>
                    )}
                    {profile.minorId !== "none" && course.minor.includes(profile.minorId) && (
                      <span className="course-tag">{minor?.label} minor</span>
                    )}
                    {course.hubs.map((hub) => <span className="course-tag hub-tag" key={hub}>{hub}</span>)}
                    <span className="course-meta">Difficulty: {difficultyLabel(course.difficulty)}</span>
                    <span className="course-meta">Offered: {course.offered}</span>
                  </div>
                  {course.prerequisites.length > 0 && (
                    <p className={eligible ? "prerequisite-status ready" : "prerequisite-status"}>
                      {missingPrerequisites.length === 0
                        ? "Prerequisites met or scheduled earlier"
                        : `Still needed: ${missingPrerequisites.join(", ")}`}
                    </p>
                  )}
                </div>
                <span className={isPlanned ? "plan-status planned" : "plan-status"}>
                  {isPlanned ? "In your plan" : eligible ? "Can be planned" : "Prerequisite needed"}
                </span>
              </article>
            );
          }) : (
            <div className="empty-classes">
              <h2>No matching classes</h2>
              <p>Try a different search or browse all classes.</p>
              {filter !== "all" && (
                <button type="button" onClick={() => setFilter("all")}>Browse all classes</button>
              )}
            </div>
          )}
        </div>
        <p className="catalog-disclaimer">
          Sample catalog for demonstration only. Verify course availability, prerequisites, and requirements with BU.
        </p>
      </section>
    </main>
  );
}
