// Auto-detect API host (works for file:// and http(s):// on LAN/mobile)
const API_BASE = (() => {
  const host = window.location.hostname || "localhost";
  const proto = (window.location.protocol === "file:") ? "http:" : window.location.protocol;
  return `${proto}//${host}:3000/api`;
})();

const authSection = document.getElementById("authSection");
const eventsSection = document.getElementById("eventsSection");
const authForm = document.getElementById("authForm");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const eventsList = document.getElementById("eventsList");
const eventForm = document.getElementById("eventForm");
const refreshBtn = document.getElementById("refreshBtn");

let token = localStorage.getItem("token");

function setAuthUI() {
  if (token) {
    authSection.classList.add("hidden");
    eventsSection.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    authSection.classList.remove("hidden");
    eventsSection.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }
}

async function api(path, method="GET", data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: data ? JSON.stringify(data) : undefined
  });
  const text = await res.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { error: text }; }
  if (!res.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    const result = await api("/login", "POST", { username, password });
    token = result.token;
    localStorage.setItem("token", token);
    setAuthUI();
    await loadEvents();
  } catch (err) {
    alert(err.message || "Login failed");
  }
});

registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Enter username & password");
  try {
    await api("/register", "POST", { username, password });
    alert("Registered! You can now login.");
  } catch (err) {
    alert(err.message || "Registration failed");
  }
});

logoutBtn.addEventListener("click", () => {
  token = null;
  localStorage.removeItem("token");
  setAuthUI();
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const details = document.getElementById("details").value.trim();
  try {
    await api("/events", "POST", { title, date, location, details });
    eventForm.reset();
    await loadEvents();
  } catch (err) {
    alert(err.message || "Failed to add event");
  }
});

refreshBtn.addEventListener("click", loadEvents);

async function loadEvents() {
  try {
    const data = await api("/events");
    eventsList.innerHTML = "";
    data.forEach(ev => {
      const li = document.createElement("li");
      li.innerHTML = \`
        <div>
          <strong>\${ev.title}</strong>
          <span class="badge">\${new Date(ev.date).toLocaleDateString()}</span>
          <div class="meta">@ \${ev.location}</div>
          <div class="meta">\${ev.details || ""}</div>
        </div>
        <div class="actions">
          <button data-id="\${ev.id}" class="del">Delete</button>
        </div>\`;
      li.querySelector(".del").addEventListener("click", async () => {
        await api("/events/" + ev.id, "DELETE");
        await loadEvents();
      });
      eventsList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

setAuthUI();
if (token) loadEvents();
