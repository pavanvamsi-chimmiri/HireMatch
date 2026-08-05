import { useEffect, useMemo, useState } from "react";
import { fetchJobMatches, fetchJobs } from "./api";
import type { CandidateMatch, Job } from "./types";

function scoreClass(score: number): string {
  if (score >= 80) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
}

function Pill({ label, kind }: { label: string; kind: "matched" | "missing" }) {
  return <span className={`pill pill-${kind}`}>{label}</span>;
}

function MatchCard({ match }: { match: CandidateMatch }) {
  const { candidate, score, breakdown, matchedSkills, missingSkills } = match;
  return (
    <li className="match-card">
      <div className="match-card__head">
        <div>
          <h3>{candidate.name}</h3>
          <p className="muted">
            {candidate.title} · {candidate.location}
            {candidate.remote ? " · Open to remote" : ""}
          </p>
        </div>
        <div className={`score ${scoreClass(score)}`} title="Overall match score">
          {score}
          <span className="score__pct">%</span>
        </div>
      </div>

      <div className="bars">
        <Bar label="Skills" value={breakdown.skillScore} />
        <Bar label="Experience" value={breakdown.experienceScore} />
        <Bar label="Location" value={breakdown.locationScore} />
      </div>

      <div className="skills">
        {matchedSkills.map((s) => (
          <Pill key={`m-${s}`} label={s} kind="matched" />
        ))}
        {missingSkills.map((s) => (
          <Pill key={`x-${s}`} label={s} kind="missing" />
        ))}
      </div>
      <p className="muted summary">{candidate.summary}</p>
    </li>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bar">
      <span className="bar__label">{label}</span>
      <span className="bar__track">
        <span className="bar__fill" style={{ width: `${value}%` }} />
      </span>
      <span className="bar__value">{value}</span>
    </div>
  );
}

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setLoading(true);
    setError(null);
    fetchJobMatches(selectedId)
      .then(({ matches }) => setMatches(matches))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? null,
    [jobs, selectedId],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">◆</span> HireMatch
        </div>
        <p className="tagline">Match the right people to the right roles.</p>
      </header>

      <main className="layout">
        <aside className="jobs-panel">
          <h2>Open roles</h2>
          <ul className="jobs-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <button
                  className={`job-item ${job.id === selectedId ? "job-item--active" : ""}`}
                  onClick={() => setSelectedId(job.id)}
                >
                  <span className="job-item__title">{job.title}</span>
                  <span className="muted">
                    {job.company} · {job.remote ? "Remote" : job.location}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="matches-panel">
          {error && <div className="error">{error}</div>}
          {selectedJob && (
            <div className="job-detail">
              <h2>{selectedJob.title}</h2>
              <p className="muted">
                {selectedJob.company} · {selectedJob.remote ? "Remote" : selectedJob.location} ·{" "}
                {selectedJob.minYearsExperience}+ yrs
              </p>
              <p>{selectedJob.description}</p>
              <div className="skills">
                {selectedJob.skills.map((s) => (
                  <span key={s} className="pill pill-required">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h2 className="matches-title">
            Ranked candidates {loading ? "…" : `(${matches.length})`}
          </h2>
          <ul className="match-list">
            {matches.map((m) => (
              <MatchCard key={m.candidate.id} match={m} />
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
