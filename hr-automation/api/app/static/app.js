const statusEl = document.getElementById("status");
const statusText = document.getElementById("status-text");

async function checkHealth() {
  try {
    const res = await fetch("/health");
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    statusEl.classList.add("ok");
    statusEl.classList.remove("bad");
    statusText.textContent = `${data.service} · ready`;
  } catch {
    statusEl.classList.add("bad");
    statusEl.classList.remove("ok");
    statusText.textContent = "API offline";
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function postJson(url, body, outEl, button) {
  button.disabled = true;
  outEl.textContent = "Running…";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      outEl.textContent = JSON.stringify(data.detail || data, null, 2);
      return;
    }
    outEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    outEl.textContent = String(err);
  } finally {
    button.disabled = false;
  }
}

document.getElementById("form-screening").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = formToObject(e.target);
  const body = {
    ...raw,
    min_score_threshold: Number(raw.min_score_threshold || 60),
  };
  postJson(
    "/api/v1/screening/analyze",
    body,
    document.getElementById("out-screening"),
    e.target.querySelector("button"),
  );
});

document.getElementById("form-interview").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = formToObject(e.target);
  const body = {
    candidate_name: raw.candidate_name,
    candidate_email: raw.candidate_email,
    job_title: raw.job_title,
    interviewer_email: raw.interviewer_email,
    preferred_slots: raw.preferred_slots
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  postJson(
    "/api/v1/interviews/schedule",
    body,
    document.getElementById("out-interview"),
    e.target.querySelector("button"),
  );
});

document.getElementById("form-onboarding").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = formToObject(e.target);
  const body = {
    employee_name: raw.employee_name,
    employee_email: raw.employee_email,
    role: raw.role,
    department: raw.department,
    start_date: raw.start_date,
    manager_email: raw.manager_email || null,
  };
  postJson(
    "/api/v1/onboarding/start",
    body,
    document.getElementById("out-onboarding"),
    e.target.querySelector("button"),
  );
});

checkHealth();
setInterval(checkHealth, 15000);
