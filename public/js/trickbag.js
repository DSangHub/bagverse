const storeId = Bag.storeId();
Bag.rememberStore(storeId);
document.getElementById("tricks").textContent = Bag.tricks() + " tricks";

let puzzle = null;
let picked = null;

Bag.get("/api/stores/" + storeId).then((data) => {
  const s = data.store;
  puzzle = data.puzzle;
  document.getElementById("storeLine").textContent =
    s.name + " · treat: " + s.treat + " · " + data.treatsLeft + " left this week";
  document.getElementById("puzzle").innerHTML = `
    <div class="muted">${puzzle.title}</div>
    <p>${puzzle.prompt}</p>
    <div class="choices" id="choices">
      ${puzzle.choices.map((c) => `<button class="choice" data-a="${c}">${c}</button>`).join("")}
    </div>
    <button class="btn" id="check" disabled>Check</button>
  `;
  document.querySelectorAll(".choice").forEach((btn) => {
    btn.onclick = () => {
      picked = btn.dataset.a;
      document.querySelectorAll(".choice").forEach((b) => b.classList.remove("pick"));
      btn.classList.add("pick");
      document.getElementById("check").disabled = false;
    };
  });
  document.getElementById("check").onclick = submit;
});

async function submit() {
  const check = await Bag.post("/api/puzzle/check", {
    puzzleId: puzzle.id,
    answer: picked
  });
  const buttons = [...document.querySelectorAll(".choice")];
  buttons.forEach((b) => {
    if (b.dataset.a === picked) b.classList.add(check.correct ? "good" : "bad");
  });
  if (!check.correct) {
    document.getElementById("result").innerHTML =
      `<p class="err">Not yet. Hint: ${check.hint}</p>`;
    return;
  }
  const n = Bag.addTrick();
  document.getElementById("tricks").textContent = n + " tricks";
  const unlock = await Bag.post("/api/unlock", { storeId });
  Bag.setUnlock(unlock.token, storeId);
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="ok">Solved.</div>
      <p class="muted">Ask a grown-up. Show this code at the counter. One use, 2 hours, this shop only.</p>
      <div class="code">${unlock.code}</div>
      <p class="muted">Treat: ${unlock.treat} · ${unlock.treatsLeft} still in the weekly cap</p>
      <a class="btn alt" href="${unlock.bagtunesUrl}">Unlock this block’s song</a>
      <a class="btn ghost" href="/cashier/?store=${storeId}">Cashier check</a>
    </div>
  `;
}
