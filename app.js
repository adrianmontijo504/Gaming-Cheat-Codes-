const pageType = document.documentElement.dataset.page || "";

function createTag(text) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = text;
  return span;
}

function createOpenLink(href, label) {
  const link = document.createElement("a");
  link.className = "open-link";
  link.href = href || "#";
  link.textContent = label;

  if (href === "#") {
    link.addEventListener("click", event => {
      event.preventDefault();
    });
  }

  return link;
}

function renderHomePage() {
  const systemGrid = document.getElementById("systemGrid");
  const systemCount = document.getElementById("systemCount");
  const gameCount = document.getElementById("gameCount");
  const homeSummary = document.getElementById("homeSummary");

  if (!systemGrid) return;

  const systems = window.SYSTEMS || [];
  const allGames = Object.values(window.GAMES_BY_SYSTEM || {}).flat();

  systemGrid.innerHTML = "";
  systemCount.textContent = String(systems.length);
  gameCount.textContent = String(allGames.length);
  homeSummary.textContent = `${systems.length} system${systems.length === 1 ? "" : "s"} available`;

  if (!systems.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No systems found.";
    systemGrid.appendChild(empty);
    return;
  }

  systems.forEach(system => {
    const card = document.createElement("article");
    card.className = "system-card";

    const tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    tagRow.appendChild(createTag(system.status));

    const title = document.createElement("h3");
    title.className = "system-card__title";
    title.textContent = system.name;

    const desc = document.createElement("p");
    desc.className = "system-card__desc";
    desc.textContent = system.description;

    const footer = document.createElement("div");
    footer.className = "system-card__footer";
    footer.appendChild(createOpenLink(system.href, system.status === "Live" ? "Open System" : "Coming Soon"));

    card.appendChild(tagRow);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    systemGrid.appendChild(card);
  });
}

function renderSystemPage() {
  const systemName = document.documentElement.dataset.system || "";
  const gameGrid = document.getElementById("gameGrid");
  const systemSummary = document.getElementById("systemSummary");

  if (!gameGrid) return;

  const games = (window.GAMES_BY_SYSTEM && window.GAMES_BY_SYSTEM[systemName]) || [];
  gameGrid.innerHTML = "";
  systemSummary.textContent = `${games.length} game${games.length === 1 ? "" : "s"} found`;

  if (!games.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No games found for this system yet.";
    gameGrid.appendChild(empty);
    return;
  }

  games.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    tagRow.appendChild(createTag(systemName));
    tagRow.appendChild(createTag(game.status));

    const title = document.createElement("h3");
    title.className = "game-card__title";
    title.textContent = game.name;

    const desc = document.createElement("p");
    desc.className = "game-card__desc";
    desc.textContent = game.description;

    const footer = document.createElement("div");
    footer.className = "game-card__footer";
    footer.appendChild(createOpenLink(game.href, game.status === "Live" ? "Open Game" : "Coming Soon"));

    card.appendChild(tagRow);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    gameGrid.appendChild(card);
  });
}

if (pageType === "home") {
  renderHomePage();
}

if (pageType === "system") {
  renderSystemPage();
}
