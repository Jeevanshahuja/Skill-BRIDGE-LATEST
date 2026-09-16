import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResumeHistory } from "../services/historyService";
import { getUserId } from "../utils/auth";
import { getProgress, updateProgress } from "../services/progressService";
import { getResources } from "../services/resourceService";
import { matchResume } from "../services/resumeService";
import toast from "react-hot-toast";

/* ---------------- Shared local UI helpers ---------------- */

const TONE = {
  success: { bg: "bg-success-100", text: "text-success-500" },
  danger: { bg: "bg-danger-100", text: "text-danger-500" },
  warning: { bg: "bg-warning-100", text: "text-warning-500" },
  accent: { bg: "bg-lime-400", text: "text-ink-700" },
};

function SectionIcon({ tone, path }) {
  const t = TONE[tone];
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink-700 ${t.bg} ${t.text}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d={path} />
      </svg>
    </span>
  );
}

const ICONS = {
  strengths:
    "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z",
  weaknesses:
    "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z",
  skills:
    "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z",
  projects:
    "M10 2a6 6 0 00-3.796 10.632C6.7 13.055 7 13.598 7 14.174V15a1 1 0 001 1h4a1 1 0 001-1v-.826c0-.576.3-1.119.796-1.542A6 6 0 0010 2zM8.5 17a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z",
  roadmap:
    "M4.25 5.5a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H4.25zm0 4.75a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H4.25zm0 4.75a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H4.25z",
  resources:
    "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z",
  play: "M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z",
};

function Card({ title, tone, icon, children, right }) {
  return (
    <div className="rounded-2xl border-2 border-ink-700 bg-cream-50 p-5 sm:p-6 mb-5 shadow-hard">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <SectionIcon tone={tone} path={icon} />
          <h2 className="font-bold text-ink-700">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function CompletionBadge({ done, total }) {
  if (!total) return null;
  return (
    <span className="text-xs font-bold text-ink-700 bg-cream-100 border-2 border-ink-700 rounded-full px-2.5 py-1">
      {done}/{total} done
    </span>
  );
}

function CheckboxRow({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border-2 border-ink-700/15 bg-cream-100 p-3 cursor-pointer transition-base hover:border-ink-700/40 has-[:checked]:border-ink-700 has-[:checked]:bg-lime-100">
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="h-5 w-5 rounded-md border-2 border-ink-700 bg-white transition-base peer-checked:bg-lime-400" />
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="absolute h-3 w-3 text-ink-700 opacity-0 peer-checked:opacity-100 transition-base pointer-events-none"
        >
          <path
            d="M4 10.5l3.5 3.5L16 5.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-sm text-ink-700 leading-relaxed">{children}</span>
    </label>
  );
}

function SkillChip({ checked, onChange, children }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border-2 border-ink-700/15 bg-cream-100 px-3 py-2 text-sm font-semibold text-ink-700 cursor-pointer transition-base hover:border-ink-700/40 has-[:checked]:border-ink-700 has-[:checked]:bg-lime-400">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="h-4 w-4 rounded border-2 border-ink-700 bg-white transition-base peer-checked:bg-ink-700" />
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="absolute h-2.5 w-2.5 text-lime-400 opacity-0 peer-checked:opacity-100 transition-base pointer-events-none"
        >
          <path
            d="M4 10.5l3.5 3.5L16 5.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {children}
    </label>
  );
}

function ScoreBadge({ score }) {
  const tone = score > 70 ? "success" : score > 40 ? "warning" : "danger";
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 border-ink-700 ${t.bg} ${t.text} px-3.5 py-1.5 text-sm font-extrabold`}
    >
      ATS Score: {score}
    </span>
  );
}

/* ---------------- Page ---------------- */

export default function ResumeReport() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [progress, setProgress] = useState({});
  const [resources, setResources] = useState([]);
  const [matching, setMatching] = useState(false);
  const [jobMatch, setJobMatch] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getResumeHistory(getUserId());

        const found = res.find((r) => r.resume_id == id);

        setItem(found);
        const resourceData = await getResources(id);
        setResources(resourceData.resources || []);
        if (found) {
          const saved = await getProgress(found.resume_id);

          const map = {};

          saved.forEach((p) => {
            map[p.type + "_" + p.name] = p.completed;
          });

          setProgress(map);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleProgress = async (type, name, checked) => {
    setProgress((prev) => ({
      ...prev,
      [type + "_" + name]: checked,
    }));

    try {
      await updateProgress(item.resume_id, type, name, checked);
    } catch (err) {
      console.log(err);
    }
  };

  const handleMatch = async () => {
    console.log("MATCH BUTTON CLICKED");

    try {
      setMatching(true);

      const result = await matchResume(item.resume_id, item.target_role, item.target_role);

      setJobMatch(result);

      toast.success("Resume matched successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Unable to match resume.");
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 px-4 py-10 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-32 rounded-2xl border-2 border-ink-700/10 bg-cream-50 animate-pulse mb-5" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border-2 border-ink-700/10 bg-cream-50 animate-pulse mb-5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-cream-100 px-4 py-16 text-center">
        <p className="text-ink-500/70">Resume not found.</p>
      </div>
    );
  }

  const a = item.analysis || {};
  const matchData = jobMatch || a.job_match;
  const missingSkills = a.missing_skills || [];
  const roadmap = a.roadmap || [];
  const skillsDone = missingSkills.filter((s) => progress["skill_" + s]).length;
  const roadmapDone = roadmap.filter((s) => progress["roadmap_" + s]).length;

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="rounded-2xl border-2 border-ink-700 bg-cream-50 p-6 sm:p-7 mb-5 shadow-hard">
          <h1 className="text-xl font-extrabold text-ink-700 truncate">
            {item.file_name}
          </h1>
          <p className="text-sm text-ink-500/70 mt-1 mb-4">
            <span className="font-bold text-ink-700">Target Role:</span>{" "}
            {item.target_role}
          </p>

          <ScoreBadge score={a.ats_score ?? 0} />

          {a.ats_explanation && (
            <>
              <div className="h-px bg-ink-700/10 my-5" />
              <h3 className="text-sm font-bold text-ink-700 mb-2">
                AI Explanation
              </h3>
              <p className="text-sm text-ink-500/70 leading-relaxed">
                {a.ats_explanation}
              </p>
            </>
          )}

          <div className="mt-5">
            <button
              onClick={handleMatch}
              disabled={matching}
              className="btn-hard bg-lime-400 text-ink-700 px-4 py-2 hover:bg-lime-300 disabled:opacity-60"
            >
              {matching ? "Matching..." : "Match Resume"}
            </button>
          </div>
        </div>

        {/* Strengths */}
        <Card title="Strengths" tone="success" icon={ICONS.strengths}>
          {(a.strengths || []).length === 0 ? (
            <p className="text-sm text-ink-500/50 italic">
              No strengths listed.
            </p>
          ) : (
            <ul className="space-y-2">
              {a.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-ink-700/80 leading-relaxed pl-3 border-l-2 border-success-500/50"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Weaknesses */}
        <Card title="Weaknesses" tone="danger" icon={ICONS.weaknesses}>
          {(a.weaknesses || []).length === 0 ? (
            <p className="text-sm text-ink-500/50 italic">
              No weaknesses listed.
            </p>
          ) : (
            <ul className="space-y-2">
              {a.weaknesses.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-ink-700/80 leading-relaxed pl-3 border-l-2 border-danger-500/50"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Missing Skills */}
        <Card
          title="Missing Skills"
          tone="warning"
          icon={ICONS.skills}
          right={
            <CompletionBadge done={skillsDone} total={missingSkills.length} />
          }
        >
          {missingSkills.length === 0 ? (
            <p className="text-sm text-ink-500/50 italic">
              No missing skills identified.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, i) => (
                <SkillChip
                  key={i}
                  checked={progress["skill_" + skill] || false}
                  onChange={(e) =>
                    handleProgress("skill", skill, e.target.checked)
                  }
                >
                  {skill}
                </SkillChip>
              ))}
            </div>
          )}
        </Card>

        {/* Projects */}
        <Card title="Recommended Projects" tone="accent" icon={ICONS.projects}>
          {(a.project_ideas || []).length === 0 ? (
            <p className="text-sm text-ink-500/50 italic">
              No project ideas yet.
            </p>
          ) : (
            <div className="space-y-3">
              {a.project_ideas.map((project, index) => (
                <div
                  key={index}
                  className="rounded-xl border-2 border-ink-700/15 bg-cream-100 p-4"
                >
                  {typeof project === "object" ? (
                    <>
                      <h3 className="font-bold text-ink-700 mb-1">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-ink-500/70 leading-relaxed mb-3">
                          {project.description}
                        </p>
                      )}
                      {project.skills_developed && (
                        <>
                          <h4 className="text-xs font-bold text-ink-500/60 uppercase tracking-wide mb-2">
                            Skills You'll Learn
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {project.skills_developed.map((skill, i) => (
                              <span
                                key={i}
                                className="rounded-full border border-ink-700/20 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-ink-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-ink-700">{project}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Roadmap */}
        <Card
          title="Learning Roadmap"
          tone="accent"
          icon={ICONS.roadmap}
          right={<CompletionBadge done={roadmapDone} total={roadmap.length} />}
        >
          {roadmap.length === 0 ? (
            <p className="text-sm text-ink-500/50 italic">
              No roadmap generated.
            </p>
          ) : (
            <div className="space-y-2.5">
              {roadmap.map((step, i) => (
                <CheckboxRow
                  key={i}
                  checked={progress["roadmap_" + step] || false}
                  onChange={(e) =>
                    handleProgress("roadmap", step, e.target.checked)
                  }
                >
                  {step}
                </CheckboxRow>
              ))}
            </div>
          )}
        </Card>

        {matchData && (
          <>
            {matchData.job_description && (
              <Card title="Job Description" tone="accent" icon={ICONS.projects}>
                <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
                  {matchData.job_description}
                </p>
              </Card>
            )}

            <Card title="Job Match Analysis" tone="accent" icon={ICONS.skills}>
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-lg text-ink-700">
                    Match Score: {matchData.match_score}%
                  </h3>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Matched Skills</h4>

                  <div className="flex flex-wrap gap-2">
                    {(matchData.matched_skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-success-100 border border-success-500 px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Missing Skills</h4>

                  <div className="flex flex-wrap gap-2">
                    {(matchData.missing_skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-danger-100 border border-danger-500 px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Recommendations</h4>

                  <ul className="list-disc ml-5 space-y-2">
                    {(matchData.recommendations || []).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {matchData.summary && (
                  <div>
                    <h4 className="font-bold mb-2">Summary</h4>

                    <p>{matchData.summary}</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Learning Resources */}
<Card title="Learning Resources" tone="success" icon={ICONS.resources}>
  {resources.length === 0 ? (
    <p className="text-sm text-ink-500/50 italic">
      No resources found.
    </p>
  ) : (
    <div className="space-y-5">
      {resources.map((resource, index) => (
        <div
          key={index}
          className="rounded-xl border-2 border-ink-700/15 bg-cream-100 p-4 sm:p-5"
        >
          {/* Skill */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-extrabold text-lg text-ink-700">
              {resource.skill}
            </h3>

            {resource.courses?.length > 0 && (
              <span className="shrink-0 rounded-full border-2 border-ink-700 bg-cream-50 px-2.5 py-1 text-xs font-bold text-ink-700">
                {resource.courses.length} courses
              </span>
            )}
          </div>

          {/* Coursera Courses */}
          {resource.courses?.length > 0 && (
            <div className="space-y-3">
              {resource.courses.map((course, i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-ink-700/15 bg-cream-50 p-4"
                >
                  {/* Course title + link */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400 border border-ink-700 text-xs font-extrabold text-ink-700">
                          {i + 1}
                        </span>

                        <h4 className="font-bold text-ink-700 leading-snug">
                          {course.name}
                        </h4>
                      </div>

                      {course.institution !== "N/A" && (
                        <p className="text-sm text-ink-500/70 ml-8">
                          {course.institution}
                        </p>
                      )}
                    </div>

                    {course.link && course.link !== "N/A" && (
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-hard shrink-0 bg-lime-400 text-ink-700 px-3 py-1.5 text-xs hover:bg-lime-300"
                      >
                        View Course
                      </a>
                    )}
                  </div>

                  {/* Course details */}
                  <div className="flex flex-wrap gap-2 mt-4 ml-8">
                    {course.rating && course.rating !== "N/A" && (
                      <span className="rounded-full border border-ink-700/20 bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        ★ {course.rating}
                      </span>
                    )}

                    {course.reviews && course.reviews !== "N/A" && (
                      <span className="rounded-full border border-ink-700/20 bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        {course.reviews}
                      </span>
                    )}

                    {course.difficulty &&
                      course.difficulty !== "N/A" && (
                        <span className="rounded-full border border-ink-700/20 bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                          {course.difficulty}
                        </span>
                      )}

                    {course.type && course.type !== "N/A" && (
                      <span className="rounded-full border border-ink-700/20 bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        {course.type}
                      </span>
                    )}

                    {course.duration && course.duration !== "N/A" && (
                      <span className="rounded-full border border-ink-700/20 bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                        {course.duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* YouTube */}
{resource.youtube?.length > 0 && (
  <div className="mt-5 pt-4 border-t-2 border-ink-700/10">
    <h4 className="flex items-center gap-1.5 text-xs font-bold text-ink-500/60 uppercase tracking-wide mb-2.5">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        <path d={ICONS.play} />
      </svg>
      YouTube
    </h4>

    <div className="space-y-2">
      {resource.youtube.map((video, i) => (
        <a
          key={i}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-ink-700/10 bg-cream-100 px-3 py-2.5 text-sm font-semibold text-ink-700 underline decoration-lime-400 decoration-2 underline-offset-2 hover:bg-lime-100 hover:border-ink-700/30 transition-base"
        >
          {video.title}
        </a>
      ))}
    </div>
  </div>
)}
        </div>
      ))}
    </div>
  )}
</Card>
      </div>
    </div>
  );
}
