const pageType = document.documentElement.dataset.page || "";
const currentSystem = document.documentElement.dataset.system || "all";
const currentFile = window.location.pathname.split("/").pop() || "index.html";

const menuState = {
  search: "",
  activeSystem: currentSystem === "" ? "all" : currentSystem
};

function getSystems() {
  return window.SYSTEMS || [];
}

function getAllGames() {
  return Object.entries(window.GAMES_BY_SYSTEM || {}).flatMap(([system, games]) =>
    (games || []).map(game => ({ ...game, system }))
  );
}

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function matchesSearch(text, search) {
  return normalize(text).includes(normalize(search));
}

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

  if (!href || href === "#") {
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

  const systems = getSystems();
  const allGames = getAllGames();

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
    footer.appendChild(
      createOpenLink(system.href, system.status === "Live" ? "Open System" : "Coming Soon")
    );

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
    footer.appendChild(
      createOpenLink(game.href, game.status === "Live" ? "Open Game" : "Coming Soon")
    );

    card.appendChild(tagRow);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    gameGrid.appendChild(card);
  });
}

function initMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const closeMenuBtn = document.getElementById("closeMenu");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuSearch = document.getElementById("menuSearch");
  const menuSystemList = document.getElementById("menuSystemList");
  const menuGameList = document.getElementById("menuGameList");
  const showAllSystemsBtn = document.getElementById("showAllSystemsBtn");

  if (!menuToggle || !sideMenu || !menuOverlay || !menuSystemList || !menuGameList) return;

  function openMenu() {
    sideMenu.classList.add("is-open");
    menuOverlay.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    sideMenu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    sideMenu.classList.remove("is-open");
    menuOverlay.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    sideMenu.setAttribute("aria-hidden", "true");
  }

  function createSystemButton(system) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-system-btn";
    if (menuState.activeSystem === system.name) {
      button.classList.add("is-active");
    }
    button.textContent = system.name;
    button.addEventListener("click", () => {
      menuState.activeSystem = system.name;
      renderMenu();
    });
    return button;
  }

  function createGameLink(game) {
    const item = document.createElement("a");
    item.className = "menu-game-link";
    item.href = game.href || "#";

    if (game.href === currentFile) {
      item.classList.add("is-current");
    }

    if (!game.href || game.href === "#") {
      item.addEventListener("click", event => {
        event.preventDefault();
      });
    }

    const top = document.createElement("div");
    top.className = "menu-game-link__top";

    const title = document.createElement("span");
    title.className = "menu-game-link__title";
    title.textContent = game.name;

    const status = document.createElement("span");
    status.className = "menu-game-link__status";
    status.textContent = game.status;

    const desc = document.createElement("span");
    desc.className = "menu-game-link__desc";
    desc.textContent = game.description || "";

    top.appendChild(title);
    top.appendChild(status);
    item.appendChild(top);
    item.appendChild(desc);

    return item;
  }

  function renderMenu() {
    const systems = getSystems();
    const search = normalize(menuState.search);
    const allGames = getAllGames();

    menuSystemList.innerHTML = "";
    menuGameList.innerHTML = "";

    if (menuState.activeSystem === "all") {
      showAllSystemsBtn.classList.add("is-active");
    } else {
      showAllSystemsBtn.classList.remove("is-active");
    }

    const filteredSystems = systems.filter(system => {
      if (!search) return true;
      const matchingSystem = matchesSearch(system.name, search);
      const matchingGame = allGames.some(
        game => game.system === system.name && (matchesSearch(game.name, search) || matchesSearch(game.description, search))
      );
      return matchingSystem || matchingGame;
    });

    filteredSystems.forEach(system => {
      menuSystemList.appendChild(createSystemButton(system));
    });

    if (!filteredSystems.length) {
      const emptySystem = document.createElement("div");
      emptySystem.className = "empty-state empty-state--menu";
      emptySystem.textContent = "No systems matched.";
      menuSystemList.appendChild(emptySystem);
    }

    const visibleGames = allGames.filter(game => {
      const searchMatch =
        !search ||
        matchesSearch(game.name, search) ||
        matchesSearch(game.description, search) ||
        matchesSearch(game.system, search);

      const systemMatch =
        menuState.activeSystem === "all" || game.system === menuState.activeSystem;

      return searchMatch && systemMatch;
    });

    if (!visibleGames.length) {
      const emptyGame = document.createElement("div");
      emptyGame.className = "empty-state empty-state--menu";
      emptyGame.textContent = "No games matched.";
      menuGameList.appendChild(emptyGame);
      return;
    }

    if (menuState.activeSystem === "all") {
      const grouped = {};
      visibleGames.forEach(game => {
        if (!grouped[game.system]) grouped[game.system] = [];
        grouped[game.system].push(game);
      });

      Object.keys(grouped).forEach(systemName => {
        const group = document.createElement("div");
        group.className = "menu-game-group";

        const heading = document.createElement("div");
        heading.className = "menu-game-group__title";
        heading.textContent = systemName;

        group.appendChild(heading);

        grouped[systemName].forEach(game => {
          group.appendChild(createGameLink(game));
        });

        menuGameList.appendChild(group);
      });
    } else {
      visibleGames.forEach(game => {
        menuGameList.appendChild(createGameLink(game));
      });
    }
  }

  menuToggle.addEventListener("click", openMenu);
  menuOverlay.addEventListener("click", closeMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);

  if (menuSearch) {
    menuSearch.addEventListener("input", event => {
      menuState.search = event.target.value;
      renderMenu();
    });
  }

  if (showAllSystemsBtn) {
    showAllSystemsBtn.addEventListener("click", () => {
      menuState.activeSystem = "all";
      renderMenu();
    });
  }

  renderMenu();
}

function initPs5FloatingSymbols() {
  const symbols = Array.from(document.querySelectorAll(".ps-bg-icons .ps-symbol"));
  if (!symbols.length) return;

  const sizeMap = {
    md: { min: 54, max: 72, speed: 0.45 },
    lg: { min: 72, max: 96, speed: 0.55 },
    xl: { min: 96, max: 124, speed: 0.65 }
  };

  const items = [];
  let rafId = null;
  let lastTime = 0;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setupSymbols() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    items.length = 0;

    symbols.forEach((el, index) => {
      const sizeKey = el.dataset.size || "lg";
      const config = sizeMap[sizeKey] || sizeMap.lg;
      const size = randomBetween(config.min, config.max);
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(config.speed * 0.85, config.speed * 1.15);
      const rotation = randomBetween(-18, 18);
      const rotationSpeed = randomBetween(-0.025, 0.025);

      const x = randomBetween(0, Math.max(10, width - size));
      const y = randomBetween(0, Math.max(10, height - size));

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.fontSize = `${size * 0.62}px`;

      items.push({
        el,
        x,
        y,
        size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation,
        rotationSpeed,
        pulseOffset: index * 0.6
      });
    });
  }

  function animate(time) {
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 16.6667, 1.5);
    lastTime = time;

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const item of items) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rotation += item.rotationSpeed * dt * 60;

      if (item.x <= 0) {
        item.x = 0;
        item.vx = Math.abs(item.vx);
      } else if (item.x + item.size >= width) {
        item.x = width - item.size;
        item.vx = -Math.abs(item.vx);
      }

      if (item.y <= 0) {
        item.y = 0;
        item.vy = Math.abs(item.vy);
      } else if (item.y + item.size >= height) {
        item.y = height - item.size;
        item.vy = -Math.abs(item.vy);
      }

      const pulse = 1 + Math.sin(time / 1200 + item.pulseOffset) * 0.02;

      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg) scale(${pulse})`;
    }

    rafId = requestAnimationFrame(animate);
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupSymbols();
    }, 120);
  });

  setupSymbols();
  rafId = requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
}

initMenu();

if (pageType === "home") {
  renderHomePage();
}

if (pageType === "system") {
  renderSystemPage();
}

if (document.body.classList.contains("ps5-page")) {
  initPs5FloatingSymbols();
}
