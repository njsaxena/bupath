"use client";

import { useState } from "react";
import {
  COURSES,
  MAJORS,
  MINORS,
  type WorkloadPreference,
} from "../lib/catalog";
import { usePlanner } from "./planner-provider";

const START_SEMESTERS = ["Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028"];
const CREDIT_TARGETS = [12, 16, 20];

export function AcademicInfoPage() {
  const { profile, updateProfile } = usePlanner();
  const [courseSearch, setCourseSearch] = useState("");
  const normalizedSearch = courseSearch.trim().toLowerCase();
  const filteredCourses = COURSES.filter((course) =>
    `${course.code} ${course.title}`.toLowerCase().includes(normalizedSearch),
  );
  const completed = new Set(profile.completedCourseCodes);

  function toggleCompletedCourse(code: string) {
    updateProfile({
      completedCourseCodes: completed.has(code)
        ? profile.completedCourseCodes.filter((item) => item !== code)
        : [...profile.completedCourseCodes, code],
    });
  }

  return (
    <main className="page-content">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Plan preferences</p>
          <h1>Tell us about your degree</h1>
          <p className="page-description">
            Your program, course history, and preferences shape the suggested class sequence.
          </p>
        </div>
        <span className="auto-save-label">Changes save in this browser</span>
      </section>

      <section className="preferences-panel" aria-labelledby="program-heading">
        <div className="panel-title">
          <span className="step-number">1</span>
          <div>
            <h2 id="program-heading">Your program</h2>
            <p>Choose the requirements your recommendations should consider.</p>
          </div>
        </div>
        <div className="preferences-grid">
          <label className="field">
            <span>Major</span>
            <select
              value={profile.majorId}
              onChange={(event) => {
                const major = MAJORS.find((item) => item.id === event.target.value);
                if (major) updateProfile({ majorId: major.id });
              }}
            >
              {MAJORS.map((major) => (
                <option key={major.id} value={major.id}>{major.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Minor <span className="optional">(optional)</span></span>
            <select
              value={profile.minorId}
              onChange={(event) => {
                const minor = MINORS.find((item) => item.id === event.target.value);
                if (minor) updateProfile({ minorId: minor.id });
              }}
            >
              {MINORS.map((minor) => (
                <option key={minor.id} value={minor.id}>{minor.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Catalog year</span>
            <select
              value={profile.catalogYear}
              onChange={(event) => updateProfile({ catalogYear: Number(event.target.value) })}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}–{year + 1}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Plan starts</span>
            <select
              value={profile.startSemester}
              onChange={(event) => updateProfile({ startSemester: event.target.value })}
            >
              {START_SEMESTERS.map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="preferences-panel" aria-labelledby="history-heading">
        <div className="panel-title">
          <span className="step-number">2</span>
          <div>
            <h2 id="history-heading">Courses you have completed</h2>
            <p>Mark completed courses so recommendations can respect prerequisites.</p>
          </div>
        </div>
        <label className="class-search preference-search">
          <span className="sr-only">Search courses to mark completed</span>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
            placeholder="Search course code or title"
          />
          {courseSearch && (
            <button type="button" onClick={() => setCourseSearch("")} aria-label="Clear search">×</button>
          )}
        </label>
        <div className="course-history-list">
          {filteredCourses.map((course) => {
            const isCompleted = completed.has(course.code);
            return (
              <button
                aria-pressed={isCompleted}
                className={isCompleted ? "history-course is-completed" : "history-course"}
                key={course.code}
                onClick={() => toggleCompletedCourse(course.code)}
                type="button"
              >
                <span className="history-checkbox" aria-hidden="true">{isCompleted ? "✓" : ""}</span>
                <span className="history-course-name">
                  <strong>{course.code}</strong>
                  <span>{course.title}</span>
                </span>
                <span className="history-course-credits">{course.credits} cr</span>
              </button>
            );
          })}
          {filteredCourses.length === 0 && (
            <p className="empty-classes">No courses match that search.</p>
          )}
        </div>
        <p className="selected-count">
          {profile.completedCourseCodes.length} {profile.completedCourseCodes.length === 1 ? "course" : "courses"} marked completed
        </p>
      </section>

      <section className="preferences-panel" aria-labelledby="load-heading">
        <div className="panel-title">
          <span className="step-number">3</span>
          <div>
            <h2 id="load-heading">Your next-semester preferences</h2>
            <p>Use these to balance the suggested course load.</p>
          </div>
        </div>
        <div className="preferences-grid load-preferences">
          <fieldset className="choice-field">
            <legend>Credit target</legend>
            <div className="choice-row">
              {CREDIT_TARGETS.map((credits) => (
                <label className="choice-option" key={credits}>
                  <input
                    checked={profile.targetCredits === credits}
                    name="credit-target"
                    onChange={() => updateProfile({ targetCredits: credits })}
                    type="radio"
                    value={credits}
                  />
                  <span>{credits} credits</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-field">
            <legend>Course difficulty</legend>
            <div className="choice-row">
              {([
                ["lighter", "Lighter"],
                ["balanced", "Balanced"],
                ["challenging", "More challenging"],
              ] as [WorkloadPreference, string][]).map(([value, label]) => (
                <label className="choice-option" key={value}>
                  <input
                    checked={profile.workload === value}
                    name="workload"
                    onChange={() => updateProfile({ workload: value })}
                    type="radio"
                    value={value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="preferences-footer">
        <p>Recommendations recalculate automatically as you edit these preferences.</p>
        <a className="button" href="/my-semester">View suggested timeline</a>
      </div>
      <p className="catalog-disclaimer">
        Your preferences are stored locally in this browser. This prototype does not connect to StudentLink or BU systems.
      </p>
    </main>
  );
}
