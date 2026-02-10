/***********************
 * PWA INSTALL
 ***********************/
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.classList.add("hidden");
};


/***********************
 * ELEMENTS
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
 * DATA
 ***********************/
let allData = {};
let activeCategory = "all";
let activeSort = "";

fetch("data.json")
  .then(r => r.json())
  .then(d => {
    allData = d;
    createCategoryButtons();
  });


/***********************
 * EVENTS
 ***********************/
search.addEventListener("input", render);

clearBtn.onclick = () => {
  search.value = "";
  activeSort = "";

  results.className = "home";
  results.innerHTML = `
    <div class="welcome">
      <h2>Quick Price Search</h2>
      <p>Type tyre size to see prices instantly.</p>
    </div>
  `;
};

sortBtn.onclick = () => {
  if (!search.value) return;
  sortPanel.classList.toggle("hidden");
};

document.querySelectorAll(".sort-item").forEach(item => {
  item.onclick = () => {
    activeSort = item.dataset.sort;
    sortPanel.classList.add("hidden");
    render();
  };
});


/***********************
 * RENDER
 ***********************/
function render() {
  const value = normalize(search.value);

  results.innerHTML = "";
  results.className = "";

  if (!value) return;

  let source =
    activeCategory === "all"
      ? Object.values(allData).flat()
      : allData[activeCategory] || [];


  // 🔍 FILTER
  let list = source.filter(t =>
    normalize(t.size).includes(value)
  );


  // 🔽 SORTS
  if (activeSort === "priceLow")
    list.sort((a, b) => a.invoice - b.invoice);

  if (activeSort === "priceHigh")
    list.sort((a, b) => b.invoice - a.invoice);

  if (activeSort === "tubeless")
    list = list.filter(t => /tl/i.test(t.size));

  if (activeSort === "tubetype")
    list = list.filter(t => /tt/i.test(t.size));

  if (activeSort === "newest")
    list.sort((a, b) => b.code - a.code);


  // ⭐ highlight cheapest
  const cheapest = Math.min(...list.map(x => x.invoice));


  // 🎨 UI
  list.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";

    if (t.invoice === cheapest)
      card.classList.add("cheapest");

    card.innerHTML = `
      <div class="card-header">
        <span>${t.size}</span>
        <span class="price">₹${t.invoice}</span>
      </div>

      <div class="details">
        <div>Code: ${t.code}</div>
        <div>Category: ${activeCategory.toUpperCase()}</div>
      </div>
    `;

    card.querySelector(".card-header").onclick =
      () => card.classList.toggle("open");

    results.appendChild(card);
  });
}


/***********************
 * CATEGORY BUTTONS
 ***********************/
function createCategoryButtons() {
  const container = document.getElementById("categories");

  const keys = ["all", ...Object.keys(allData)];

  keys.forEach(k => {
    const btn = document.createElement("div");
    btn.className = "cat-btn";
    btn.innerText = k.toUpperCase();

    btn.onclick = () => {
      activeCategory = k;

      document.querySelectorAll(".cat-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      render();
    };

    container.appendChild(btn);
  });
}
