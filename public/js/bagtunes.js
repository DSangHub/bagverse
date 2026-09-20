const qs = Bag.qs();
const storeId = qs.get("store") || Bag.unlock().store || Bag.storeId();
const token = qs.get("unlock") || Bag.unlock().token || "";
Bag.rememberStore(storeId);
document.getElementById("back").href = "/trickbag/?store=" + encodeURIComponent(storeId);

Bag.get(`/api/bagtunes/unlock?store=${encodeURIComponent(storeId)}&unlock=${encodeURIComponent(token)}`)
  .then((data) => {
    const s = data.store;
    document.getElementById("place").textContent = s ? s.neighborhood : "Sacramento";
    document.getElementById("status").textContent = data.unlocked
      ? "TrickBag unlocked this week’s block. Clip only — production links out to Spotify."
      : "Listening anyway. Solve a trick on the bag to mark this visit.";
    document.getElementById("tracks").innerHTML = (data.artists || []).map((a) => `
      <div class="card">
        <div class="player">
          <div class="muted">${a.neighborhood}</div>
          <strong>${a.name}</strong>
          <div>${a.song}</div>
          <div class="bar"><i></i></div>
          <div class="muted">${a.clip}</div>
        </div>
      </div>
    `).join("") || `<div class="card">No artists tagged to this store yet.</div>`;
  });
