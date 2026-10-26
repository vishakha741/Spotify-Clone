(() => {
  const $ = (id) => document.getElementById(id);

  // Login nahi hai, to browser ka random id hi "user" hai
  let listenerId = localStorage.getItem("listenerId");
  if (!listenerId) {
    listenerId = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("listenerId", listenerId);
  }

  const api = async (url, opts = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
    return res.json();
  };
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const srcOf = (s) => s.audioUrl || s.audio || s.src || s.url || "";

  // ================= PLAYER + LISTEN TRACKING =================
  const audio = $("fx-audio");
  let current = null;
  let lastTime = 0;
  let listened = 0;

  audio.addEventListener("timeupdate", () => {
    const delta = audio.currentTime - lastTime;
    if (delta > 0 && delta < 1.5) listened += delta;
    lastTime = audio.currentTime;
  });
  const flushLog = () => {
    if (current && listened >= 5) {
      api("/api/stats/log", {
        method: "POST",
        body: { listenerId, songId: current._id, seconds: listened },
      }).then(loadStats).catch(() => {});
    }
    listened = 0;
    lastTime = 0;
  };
  audio.addEventListener("pause", flushLog);
  audio.addEventListener("ended", flushLog);
  window.addEventListener("beforeunload", flushLog);

  function play(song) {
    flushLog();
    current = song;
    audio.src = srcOf(song);
    audio.play().catch(() => {});
    $("fx-now").textContent = `Now playing: ${song.title} — ${song.artist}`;
  }
  window.FX = { play, listenerId };

  // ================= 1. MOOD HOME =================
  let songsCache = [];
  async function loadSongs(mood = "All") {
    songsCache = await api("/api/songs?mood=" + encodeURIComponent(mood));
    const box = $("fx-songs");
    if (!songsCache.length) {
      box.innerHTML = `<p class="fx-sub">No songs for this mood yet.</p>`;
    } else {
      box.innerHTML = songsCache
        .map(
          (s, i) => `
        <div class="fx-song-row">
          <div><b>${esc(s.title)}</b><br><span class="fx-sub">${esc(s.artist)} · ${esc(s.mood || "")}</span></div>
          <button data-play="${i}">▶</button>
        </div>`
        )
        .join("");
      box.querySelectorAll("[data-play]").forEach((b) =>
        b.addEventListener("click", () => play(songsCache[b.dataset.play]))
      );
    }
    renderPlaylists();
  }
  $("fx-moods").addEventListener("click", (e) => {
    const btn = e.target.closest(".mood-btn");
    if (!btn) return;
    document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadSongs(btn.dataset.mood);
  });

  // ================= 2. STUDY MODE (POMODORO) =================
  let phase = "focus", remaining = 25 * 60, ticker = null, sessions = 0, started = false;
  const fmt = (t) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  const mins = (id, d) => Math.max(1, parseInt($(id).value) || d) * 60;
  const render = () => {
    $("fx-timer").textContent = fmt(remaining);
    $("fx-phase").textContent =
      phase === "focus" ? "🔥 Focus time — music on" : "☕ Break — music paused";
  };
  function startPhase(p) {
    phase = p;
    remaining = p === "focus" ? mins("fx-focus-min", 25) : mins("fx-break-min", 5);
    if (p === "focus") {
      if (!current) {
        const pick =
          songsCache.find((s) => /chill|focus|study/i.test(s.mood || "")) || songsCache[0];
        if (pick) play(pick);
      } else audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    render();
  }
  function tick() {
    remaining--;
    if (remaining <= 0) {
      if (phase === "focus") {
        sessions++;
        $("fx-sessions").textContent = sessions;
        startPhase("break");
      } else startPhase("focus");
    }
    render();
  }
  $("fx-start").addEventListener("click", () => {
    if (ticker) return;
    if (!started) {
      started = true;
      startPhase("focus");
    } else if (phase === "focus") audio.play().catch(() => {});
    ticker = setInterval(tick, 1000);
    render();
  });
  $("fx-pause").addEventListener("click", () => {
    clearInterval(ticker);
    ticker = null;
    audio.pause();
  });
  $("fx-reset").addEventListener("click", () => {
    clearInterval(ticker);
    ticker = null;
    audio.pause();
    started = false;
    phase = "focus";
    remaining = mins("fx-focus-min", 25);
    $("fx-timer").textContent = fmt(remaining);
    $("fx-phase").textContent = "Ready to focus";
  });

  // ================= 3. LISTENING STATS =================
  async function loadStats() {
    try {
      const d = await api("/api/stats?listenerId=" + listenerId);
      $("fx-total").textContent = d.totalMinutes;
      $("fx-top-songs").innerHTML =
        d.topSongs
          .map((s) => `<li>${esc(s.title)} <span class="fx-sub">(${Math.round(s.seconds / 60)} min)</span></li>`)
          .join("") || "<li>No data yet</li>";
      $("fx-top-artists").innerHTML =
        d.topArtists
          .map((a) => `<li>${esc(a._id)} <span class="fx-sub">(${Math.round(a.seconds / 60)} min)</span></li>`)
          .join("") || "<li>No data yet</li>";
    } catch (e) {
      console.error(e);
    }
  }
  $("fx-refresh-stats").addEventListener("click", loadStats);

  // ================= 4. PLAYLISTS + SHARE LINK =================
  async function renderPlaylists() {
    const list = await api("/api/playlists?ownerId=" + listenerId);
    const opts = songsCache.map((s) => `<option value="${s._id}">${esc(s.title)}</option>`).join("");
    $("fx-playlists").innerHTML =
      list
        .map(
          (p) => `
      <div class="fx-pl">
        <b>${esc(p.name)}</b> <span class="fx-sub">(${p.songs.length} songs)</span>
        <div class="fx-row">
          <select data-sel="${p._id}">${opts}</select>
          <button data-add="${p._id}">Add</button>
          <button class="ghost" data-share="${p.shareId}">🔗 Copy link</button>
        </div>
      </div>`
        )
        .join("") || `<p class="fx-sub">No playlists yet.</p>`;

    $("fx-playlists").querySelectorAll("[data-add]").forEach((b) =>
      b.addEventListener("click", async () => {
        const songId = $("fx-playlists").querySelector(`[data-sel="${b.dataset.add}"]`).value;
        if (!songId) return;
        await api(`/api/playlists/${b.dataset.add}/songs`, {
          method: "POST",
          body: { songId, ownerId: listenerId },
        });
        renderPlaylists();
      })
    );
    $("fx-playlists").querySelectorAll("[data-share]").forEach((b) =>
      b.addEventListener("click", async () => {
        const link = `${location.origin}/share/${b.dataset.share}`;
        try {
          await navigator.clipboard.writeText(link);
          b.textContent = "✅ Copied!";
        } catch {
          prompt("Copy this link:", link);
        }
        setTimeout(() => (b.textContent = "🔗 Copy link"), 1500);
      })
    );
  }
  $("fx-pl-create").addEventListener("click", async () => {
    const name = $("fx-pl-name").value.trim();
    if (!name) return;
    await api("/api/playlists", { method: "POST", body: { name, ownerId: listenerId } });
    $("fx-pl-name").value = "";
    renderPlaylists();
  });

  // ================= INIT =================
  loadSongs().then(loadStats);
})();