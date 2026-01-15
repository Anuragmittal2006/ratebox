/***********************
 * PWA INSTALL LOGIC
 ***********************/
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});


/***********************
 * BASIC ELEMENTS
 ***********************/
const search = document.getElementById("search");
const clearBtn = document.getElementById("clear");
const results = document.getElementById("results");
const sortBtn = document.getElementById("sortBtn");
const sortPanel = document.getElementById("sortPanel");


/***********************
 * UTILS
 ***********************/
const normalize = str =>
  (str || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");


/***********************
 * DATA LOAD
 ***********************/
let tyres = [];

fetch("tyres.json")
  .then(res => res.json())
  .then(data => tyres = data);


/***********************
 * SORT STATE
 ***********************/
let activeSort = "";


/***********************
 * EVENTS
 ***********************/
search.addEventListener("input", render);

clearBtn.addEventListener("click", () => {
  search.value = "";
  activeSort = "";
  results.className = "home";
  results.innerHTML = `
    <div class="welcome">
      <h2>Quick Price Search</h2>
      <p>Type size or name to see prices instantly.</p>
    </div>
  `;
});

sortBtn.addEventListener("click", () => {
  if (!search.value) return;   // no sort without search
  sortPanel.classList.toggle("hidden");
});

document.querySelectorAll(".sort-item").forEach(item => {
  item.addEventListener("click", () => {
    activeSort = item.dataset.sort;
    sortPanel.classList.add("hidden");
    render();
  });
});


/***********************
 * RENDER (UI SAFE)
 ***********************/
function render() {
  const value = normalize(search.value);
  results.innerHTML = "";
  results.className = "";

  if (!value) return;

  // 1️⃣ base filter
  let list = tyres.filter(t =>
    normalize(t["SIZE/DESCRIPTION"]).includes(value)
  );

  // 2️⃣ sorting / filtering (logic only)
  if (activeSort === "priceLow") {
    list.sort((a, b) => a.Invoice - b.Invoice);
  }

  if (activeSort === "priceHigh") {
    list.sort((a, b) => b.Invoice - a.Invoice);
  }

  if (activeSort === "tubeless") {
    list = list.filter(t => /tl/i.test(t["SIZE/DESCRIPTION"]));
  }

  if (activeSort === "tubetype") {
    list = list.filter(t => /tt/i.test(t["SIZE/DESCRIPTION"]));
  }

  if (activeSort === "newest") {
    list.sort((a, b) => b.CODE - a.CODE);
  }

  // 3️⃣ UI render (UNCHANGED STRUCTURE)
  list.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-header">
        <span>${t["SIZE/DESCRIPTION"]}</span>
        <span class="price">₹${t.Invoice}</span>
      </div>
      <div class="details">
        <div>Code: ${t.CODE}</div>
        <div>Tyre: ₹${t.TYRE}</div>
        <div>Tube: ${t.TUBE || "-"}</div>
        <div>Set: ₹${t.SET}</div>
        <div>TD: ${t.TD}</div>
        <div>NBP: ₹${t.NBP}</div>
      </div>
    `;

    card.querySelector(".card-header")
      .onclick = () => card.classList.toggle("open");

    results.appendChild(card);
  });
}

//iska icon do, future ke hisaab se ki isme hum apni shop pr mozood aur kisi cheez ki bhi prices list kr paye, tb hum isme upr toggle bhi bna denge for specific search ki like jk tyres, pipes, lohe hi chaddar etc, to icon usi hisaab se design krna
