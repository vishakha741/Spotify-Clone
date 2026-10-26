(function () {
  const audio = new Audio();
  audio.volume = 0.8;

  const cards = Array.from(document.querySelectorAll(".card"));
  const pImg = document.getElementById("p-img");
  const pTitle = document.getElementById("p-title");
  const pArtist = document.getElementById("p-artist");
  const btnPlay = document.getElementById("p-play");
  const btnPrev = document.getElementById("p-prev");
  const btnNext = document.getElementById("p-next");
  const progress = document.getElementById("p-progress");
  const volume = document.getElementById("p-volume");
  const curEl = document.getElementById("p-cur");
  const durEl = document.getElementById("p-dur");
  const toastEl = document.getElementById("toast");

  let index = -1;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function fmt(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  function setPlayingUI(isPlaying) {
    btnPlay.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
    cards.forEach((c, i) => c.classList.toggle("playing", isPlaying && i === index));
  }

  function loadSong(i) {
    const card = cards[i];
    if (!card) return;
    const src = card.dataset.audio;
    if (!src) {
      toast("Is song ki audio file nahi hai");
      return;
    }
    index = i;
    audio.src = src;
    pTitle.textContent = card.dataset.title;
    pArtist.textContent = card.dataset.artist;
    if (card.dataset.image) {
      pImg.src = card.dataset.image;
      pImg.hidden = false;
    }
    audio.play().catch(() => toast("Audio play nahi ho paya"));
  }

  function next() {
    if (!cards.length) return;
    loadSong((index + 1) % cards.length);
  }
  function prev() {
    if (!cards.length) return;
    // 3 sec se zyada chal chuka ho to same song dobara shuru
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadSong((index - 1 + cards.length) % cards.length);
  }

  // Card click = song play (buttons ko chhod kar)
  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-btn")) return;
      loadSong(i);
    });
  });

  btnPlay.addEventListener("click", () => {
    if (index === -1) {
      if (cards.length) loadSong(0);
      return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
  });
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  audio.addEventListener("play", () => setPlayingUI(true));
  audio.addEventListener("pause", () => setPlayingUI(false));
  audio.addEventListener("ended", next);
  audio.addEventListener("loadedmetadata", () => {
    durEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
    curEl.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("error", () => {
    if (audio.src) toast("Audio file load nahi hui");
  });

  progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
  });
  volume.addEventListener("input", () => {
    audio.volume = volume.value;
  });

  // Space = play/pause, Arrow keys = next/prev
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (e.code === "Space") {
      e.preventDefault();
      btnPlay.click();
    } else if (e.code === "ArrowRight") next();
    else if (e.code === "ArrowLeft") prev();
  });

  // ---------- Like ----------
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.closest(".card").dataset.id;
      try {
        const res = await fetch("/api/songs/" + id + "/like", { method: "POST" });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        btn.classList.toggle("liked", data.liked);
        toast(data.liked ? "Liked songs mein add hua" : "Liked songs se hata diya");
      } catch (err) {
        toast("Kuch galat ho gaya");
      }
    });
  });

  // ---------- Add to playlist ----------
  const modal = document.getElementById("playlist-modal");
  const modalAdd = document.getElementById("modal-add");
  const modalCancel = document.getElementById("modal-cancel");
  const select = document.getElementById("playlist-select");
  let pendingSongId = null;

  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      pendingSongId = btn.closest(".card").dataset.id;
      modal.hidden = false;
    });
  });

  function closeModal() {
    modal.hidden = true;
    pendingSongId = null;
  }
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (modalAdd) {
    modalAdd.addEventListener("click", async () => {
      if (!pendingSongId || !select) return;
      try {
        const res = await fetch("/api/playlists/" + select.value + "/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songId: pendingSongId }),
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        toast(res.ok ? data.name + " mein add ho gaya" : data.error || "Add nahi ho paya");
      } catch (err) {
        toast("Kuch galat ho gaya");
      }
      closeModal();
    });
  }
})();