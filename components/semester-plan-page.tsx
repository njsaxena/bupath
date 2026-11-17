"use client";

import Link from "next/link";
import { COURSES, MAJORS, MINORS } from "../lib/catalog";
import { generatePlan } from "../lib/planner";
import { usePlanner } from "./planner-provider";

function difficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Introductory";
  if (difficulty === 3) return "Moderate";
  return "Advanced";
}

export function SemesterPlanPage() {
  const { profile, updateProfile } = usePlanner();
  const semesters = generatePlan(profile);
  const major = MAJORS.find((item) => item.id === profile.majorId);
  const minor = MINORS.find((item) => item.id === profile.minorId);
  const completedCourses = COURSES.filter((course) =>
    profile.completedCourseCodes.includes(course.code),
  );
  const firstSemesterCredits = semesters[0]?.credits ?? 0;
  const allRecommended = semesters.flatMap((semester) => semester.courses);

  function dismissCourse(code: string) {
    updateProfile({
      dismissedCourseCodes: profile.dismissedCourseCodes.includes(code)
        ? profile.dismissedCourseCodes
        : [...profile.dismissedCourseCodes, code],
    });
  }

  function restoreDismissedCourses() {
    updateProfile({ dismissedCourseCodes: [] });
  }

  return (
    <main className="page-content">
      <section className="page-heading semester-page-heading">
        <div>
          <p className="eyebrow">Your course timeline</p>
          <h1>See what to take next</h1>
          <p className="page-description">
            A suggested sequence based on your {major?.label}
            {minor && minor.id !== "none" ? `, ${minor.label} minor,` : ","}
            {" "}completed courses, prerequisites, and HUB options.
          </p>
        </div>
        <Link className="button" href="/academic-info">Personalize my plan</Link>
      </section>

      <div className="plan-notice">
        <span className="notice-icon" aria-hidden="true">i</span>
        <p>
          Suggestions update when you change your program or completed courses. Course difficulty and catalog data are examples, not official BU guidance.
        </p>
      </div>

      <section className="timeline" aria-label="Completed courses and suggested semesters">
        <div className="timeline-step completed-step">
          <div className="timeline-marker" aria-hidden="true"><span>✓</span></div>
          <div className="timeline-content">
            <div className="timeline-heading">
              <div>
                <p className="eyebrow">Your starting point</p>
                <h2>Completed courses</h2>
              </div>
              <Link className="text-link" href="/academic-info">Edit courses</Link>
            </div>
            {completedCourses.length > 0 ? (
              <div className="timeline-course-grid">
                {completedCourses.map((course) => (
                  <article className="timeline-course completed-course" key={course.code}>
                    <strong>{course.code}</strong>
                    <span>{course.title}</span>
                    <small>{course.credits} credits · Completed</small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-timeline">
                <p>No completed courses added yet.</p>
                <Link className="text-link" href="/academic-info">Add courses to personalize your timeline</Link>
              </div>
            )}
          </div>
        </div>

        {semesters.map((semester, index) => (
          <div className="timeline-step" key={semester.label}>
            <div className="timeline-marker" aria-hidden="true">{index + 1}</div>
            <section className="timeline-content semester-timeline-card" aria-labelledby={`semester-${index}`}>
              <div className="timeline-heading">
                <div>
                  <p className="eyebrow">{index === 0 ? "Next semester" : `Semester ${index + 1}`}</p>
                  <h2 id={`semester-${index}`}>{semester.label}</h2>
                </div>
                <div className="semester-metrics">
                  <strong>{semester.credits} credits</strong>
                  <span>{difficultyLabel(Math.round(semester.averageDifficulty))} load</span>
                </div>
              </div>
              <div className="timeline-course-grid">
                {semester.courses.map((course) => (
                  <article className="timeline-course" key={course.code}>
                    <div className="timeline-course-top">
                      <strong>{course.code}</strong>
                      <button
                        aria-label={`Remove ${course.code} from suggested plan`}
                        className="remove-suggestion"
                        onClick={() => dismissCourse(course.code)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                    <span>{course.title}</span>
                    <small>{course.credits} credits · {difficultyLabel(course.difficulty)}</small>
                    {course.reasons.length > 0 && (
                      <div className="course-tags">
                        {course.reasons.map((reason) => (
                          <span className="course-tag" key={reason}>{reason}</span>
                        ))}
                      </div>
                    )}
                    {course.prerequisites.length > 0 && (
                      <small className="prerequisite-footnote">
                        Builds on {course.prerequisites.join(", ")}
                      </small>
                    )}
                  </article>
                ))}
              </div>
              {index === 0 && (
                <p className="term-note">
                  {firstSemesterCredits <= profile.targetCredits
                    ? `${firstSemesterCredits} of your ${profile.targetCredits}-credit target`
                    : `${firstSemesterCredits} credits suggested`}
                  {" · "}Difficulty preference: {profile.workload}
                </p>
              )}
            </section>
          </div>
        ))}

        {semesters.length === 0 && (
          <div className="empty-timeline no-plan">
            <h2>No courses could be suggested yet</h2>
            <p>Review your completed courses and planning preferences to generate a sequence.</p>
            <Link className="button" href="/academic-info">Review my preferences</Link>
          </div>
        )}
      </section>

      {profile.dismissedCourseCodes.length > 0 && (
        <button className="restore-link" onClick={restoreDismissedCourses} type="button">
          Restore removed suggestions ({profile.dismissedCourseCodes.length})
        </button>
      )}

      {allRecommended.length > 0 && (
        <p className="plan-footer-note">
          This is a planning aid, not a degree audit. Check official course offerings and degree requirements before registration.
        </p>
      )}
    </main>
  );
}
