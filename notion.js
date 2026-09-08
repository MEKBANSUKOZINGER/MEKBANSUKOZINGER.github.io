(() => {
  const config = window.PORTFOLIO_CONFIG;
  const status = document.querySelector("#content-status");
  if (!config?.apiUrl) return;
  let busy = false;
  let loaded = false;
  let lastContent = "";
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  function safeUrl(value, mail = false) {
    try {
      const url = new URL(value);
      return (mail ? ["https:", "http:", "mailto:"] : ["https:", "http:"]).includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function link(label, url, className) {
    const node = element("a", className, label);
    node.href = url;
    if (!url.startsWith("mailto:")) { node.target = "_blank"; node.rel = "noopener noreferrer"; }
    return node;
  }
  function render(data) {
    document.querySelector(".slogan").textContent = data.slogan || "[한 줄 슬로건]";
    const tools = data.tools.map((group, index) => {
      const card = element("article", "tool-card");
      card.append(element("span", "tool-index", String(index + 1).padStart(2, "0")), element("h3", "", group.title), element("p", "", group.items.join(" · ")));
      return card;
    });
    document.querySelector(".tool-grid").replaceChildren(...(tools.length ? tools : [element("p", "empty-state", "아직 등록된 항목이 없습니다.")]));
    const projects = data.projects.map((project) => {
      const card = element("article", "project-card");
      const content = element("div");
      const imageUrl = safeUrl(project.image);
      if (imageUrl) {
        const image = element("img", "project-image");
        image.src = imageUrl;
        image.alt = project.title || "";
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove(), { once: true });
        content.append(image);
      }
      content.append(element("span", "project-type", project.kind === "main" ? "Main Project" : "Side Project"), element("h3", "", project.title || "[프로젝트명]"), element("p", "", project.description));
      if (project.date?.start) content.append(element("p", "project-meta", [project.date.start, project.date.end].filter(Boolean).join(" ~ ")));
      if (project.roles.length) content.append(element("p", "project-meta", project.roles.join(" · ")));
      if (project.tags.length) content.append(element("p", "project-meta", project.tags.join(" · ")));
      card.append(content);
      const url = safeUrl(project.url);
      if (url) card.append(link("프로젝트 보기", url, "project-link"));
      return card;
    });
    document.querySelector(".project-layout").replaceChildren(...(projects.length ? projects : [element("p", "empty-state", "아직 등록된 프로젝트가 없습니다.")]));
    const contacts = data.contacts.filter((item) => safeUrl(item.url, true)).map((item) => {
      const node = link("", safeUrl(item.url, true), "contact-link");
      node.append(element("span", "", item.url.startsWith("mailto:") ? "Email" : "Website"), element("strong", "", item.label));
      return node;
    });
    document.querySelector(".contact-grid").replaceChildren(...(contacts.length ? contacts : [element("p", "empty-state", "아직 등록된 연락처가 없습니다.")]));
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    if (!loaded) { status.hidden = false; status.textContent = "내용을 불러오는 중입니다."; }
    try {
      const response = await fetch(config.apiUrl, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json();
      if (typeof data.slogan !== "string" || !Array.isArray(data.tools) || !Array.isArray(data.projects) || !Array.isArray(data.contacts)) throw new Error("INVALID_DATA");
      const signature = JSON.stringify([data.slogan, data.tools, data.projects, data.contacts]);
      if (signature !== lastContent) { render(data); lastContent = signature; }
      loaded = true;
      status.textContent = "";
      status.hidden = true;
    } catch {
      status.hidden = false;
      status.textContent = loaded ? "새 내용을 불러오지 못했습니다. 잠시 후 다시 확인합니다." : "내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    } finally { busy = false; }
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
  setInterval(refresh, Math.max(60000, config.refreshIntervalMs || 60000));
  refresh();
})();
