const Bag = {
  qs() {
    return new URLSearchParams(location.search);
  },
  storeId() {
    return this.qs().get("store") || localStorage.getItem("bag.store") || "ROSE";
  },
  rememberStore(id) {
    localStorage.setItem("bag.store", id);
  },
  tricks() {
    return Number(localStorage.getItem("bag.tricks") || "0");
  },
  addTrick() {
    const n = this.tricks() + 1;
    localStorage.setItem("bag.tricks", String(n));
    return n;
  },
  setUnlock(token, storeId) {
    localStorage.setItem("bag.unlock", token);
    localStorage.setItem("bag.unlockStore", storeId);
  },
  unlock() {
    return {
      token: localStorage.getItem("bag.unlock"),
      store: localStorage.getItem("bag.unlockStore")
    };
  },
  async get(path) {
    const res = await fetch(path);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};
