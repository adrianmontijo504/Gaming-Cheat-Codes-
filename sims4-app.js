(function () {
  const summaryEl = document.getElementById("cheatSummary");
  const categoriesEl = document.getElementById("cheatCategories");

  if (!summaryEl || !categoriesEl) return;

  const CATEGORY_ORDER = [
    "Getting Started",
    "Money",
    "Careers",
    "Lifestyle",
    "Aspirations",
    "Build / Buy",
    "Skills",
    "Relationships",
    "Occults",
    "Other"
  ];

  function getCheatData() {
    if (!Array.isArray(window.CHEAT_DATA)) {
      return [];
    }

    return window.CHEAT_DATA.filter((item) => {
      return item.game === "The Sims 4" && item.platform === "PS5";
    });
  }

  function getCategory(item) {
    const category = item.category || "Other";
    return CATEGORY_ORDER.includes(category) ? category : "Other";
  }

  function sortCategories(values) {
    return values.sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  function createBadge(text, extraClass = "") {
    const badge = document.createElement("span");
    badge.className = `cheat-badge${extraClass ? ` ${extraClass}` : ""}`;
    badge.textContent = text;
    return badge;
  }

  function createCopyButton(code) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cheat-copy-btn";
    button.textContent = "Copy Code";

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        const original = button.textContent;
        button.textContent = "Copied";

        setTimeout(() => {
          button.textContent = original;
        }, 1000);
      } catch (error) {
        button.textContent = "Copy Failed";

        setTimeout(() => {
          button.textContent = "Copy Code";
        }, 1200);
      }
    });

    return button;
  }

  function createCheatCard(item) {
    const card = document.createElement("article");
    card.className = "cheat-item";

    const top = document.createElement("div");
    top.className = "cheat-item__top";

    const titleWrap = document.createElement("div");

    const title = document.createElement("h4");
    title.className = "cheat-item__title";
    title.textContent = item.name || "Unnamed Cheat";

    const badges = document.createElement("div");
    badges.className = "cheat-badges";

    if (item.dlc) {
      badges.appendChild(createBadge(item.dlc));
    }

    if (item.needsTestingCheats) {
      badges.appendChild(createBadge("Needs testingcheats", "cheat-badge--warn"));
    }

    if (item.verification) {
      badges.appendChild(
        createBadge(
          item.verification === "official" ? "Official" : "Community",
          item.verification === "official" ? "cheat-badge--good" : ""
        )
      );
    }

    titleWrap.appendChild(title);
    titleWrap.appendChild(badges);

    top.appendChild(titleWrap);
    top.appendChild(createCopyButton(item.code || ""));

    const code = document.createElement("pre");
    code.className = "cheat-item__code";
    code.textContent = item.code || "";

    const effect = document.createElement("p");
    effect.className = "cheat-item__effect";
    effect.textContent = item.effect || "";

    card.appendChild(top);
    card.appendChild(code);
    card.appendChild(effect);

    if (item.notes) {
      const notes = document.createElement("p");
      notes.className = "cheat-item__notes";
      notes.textContent = item.notes;
      card.appendChild(notes);
    }

    return card;
  }

  function createCategoryBlock(categoryName, items, openByDefault = false) {
    const details = document.createElement("details");
    details.className = "cheat-category";
    if (openByDefault) {
      details.open = true;
    }

    const summary = document.createElement("summary");
    summary.className = "cheat-category__summary";

    const left = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "cheat-category__title";
    title.textContent = categoryName;

    const count = document.createElement("span");
    count.className = "cheat-category__count";
    count.textContent = `${items.length} cheat${items.length === 1 ? "" : "s"}`;

    left.appendChild(title);
    summary.appendChild(left);
    summary.appendChild(count);

    const body = document.createElement("div");
    body.className = "cheat-category__body";

    const list = document.createElement("div");
    list.className = "cheat-list";

    items
      .slice()
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .forEach((item) => {
        list.appendChild(createCheatCard(item));
      });

    body.appendChild(list);
    details.appendChild(summary);
    details.appendChild(body);

    return details;
  }

  function render() {
    const cheats = getCheatData();

    if (!Array.isArray(window.CHEAT_DATA)) {
      summaryEl.textContent = "Could not load cheats-data.js";
      categoriesEl.innerHTML = `<div class="empty-state">Make sure <strong>cheats-data.js</strong> is in the same folder and loads before <strong>sims4-app.js</strong>.</div>`;
      return;
    }

    if (!cheats.length) {
      summaryEl.textContent = "0 cheats found";
      categoriesEl.innerHTML = `<div class="empty-state">No PS5 Sims 4 cheats were found in <strong>cheats-data.js</strong>.</div>`;
      return;
    }

    const grouped = {};

    cheats.forEach((item) => {
      const category = getCategory(item);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    const categories = sortCategories(Object.keys(grouped));

    summaryEl.textContent = `${cheats.length} cheats in ${categories.length} categor${categories.length === 1 ? "y" : "ies"}`;
    categoriesEl.innerHTML = "";

    categories.forEach((categoryName, index) => {
      categoriesEl.appendChild(
        createCategoryBlock(categoryName, grouped[categoryName], index === 0)
      );
    });
  }

  render();
})();
