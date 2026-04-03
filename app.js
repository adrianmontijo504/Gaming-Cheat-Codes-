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

function initPs5FloatingSymbols() {
  const wrapper = document.querySelector(".ps-bg-icons");
  const symbols = Array.from(document.querySelectorAll(".ps-bg-icons .ps-symbol"));

  if (!wrapper || !symbols.length) return;

  const sizes = {
    md: { min: 68, max: 88, speed: 1.4 },
    lg: { min: 92, max: 118, speed: 1.7 },
    xl: { min: 120, max: 156, speed: 2.0 }
  };

  const items = [];

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setInitialState() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    items.length = 0;

    symbols.forEach((el, index) => {
      const sizeKey = el.dataset.size || "lg";
      const config = sizes[sizeKey] || sizes.lg;
      const base = randomBetween(config.min, config.max);
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(config.speed * 0.7, config.speed * 1.25);
      const rotation = randomBetween(-18, 18);

      const x = randomBetween(0, Math.max(20, width - base));
      const y = randomBetween(0, Math.max(20, height - base));

      el.style.width = `${base}px`;
      el.style.height = `${base}px`;
      el.style.fontSize = `${base * 0.64}px`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      items.push({
        el,
        x,
        y,
        size: base,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation,
        rotationSpeed: randomBetween(-0.16, 0.16),
        pulseOffset: index * 0.9 + randomBetween(0, 3)
      });
    });
  }

  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTime) / 16.6667, 2);
    lastTime = now;

    const width = window.innerWidth;
    const height = window.innerHeight;

    items.forEach((item, index) => {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rotation += item.rotationSpeed * dt * 8;

      if (item.x <= 0) {
        item.x = 0;
        item.vx *= -1;
      } else if (item.x + item.size >= width) {
        item.x = width - item.size;
        item.vx *= -1;
      }

      if (item.y <= 0) {
        item.y = 0;
        item.vy *= -1;
      } else if (item.y + item.size >= height) {
        item.y = height - item.size;
        item.vy *= -1;
      }

      const pulse = 1 + Math.sin(now / 420 + item.pulseOffset + index * 0.13) * 0.045;

      item.el.style.left = `${item.x}px`;
      item.el.style.top = `${item.y}px`;
      item.el.style.transform = `rotate(${item.rotation}deg) scale(${pulse})`;
    });

    requestAnimationFrame(tick);
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setInitialState();
    }, 120);
  });

  setInitialState();
  requestAnimationFrame(tick);
}

if (pageType === "home") {
  renderHomePage();
}

if (pageType === "system") {
  renderSystemPage();
}

if (document.body.classList.contains("ps5-page")) {
  initPs5FloatingSymbols();
}
