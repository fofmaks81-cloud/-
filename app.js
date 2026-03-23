
const $ = (sel) => document.querySelector(sel);

function readEmbeddedJson(scriptId) {
  const el = document.getElementById(scriptId);
  const text = el?.textContent;
  if (!text || typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function setOpenLinkState(linkEl, protocol) {
  if (!linkEl) return;
  const href = protocol?.href && typeof protocol.href === "string" ? protocol.href.trim() : "";
  if (!href) {
    linkEl.href = "#";
    linkEl.setAttribute("aria-disabled", "true");
    return;
  }
  linkEl.href = href;
  linkEl.setAttribute("aria-disabled", "false");
}

function setFrameState(frameEl, hintEl, protocol) {
  if (!frameEl) return;
  const href = protocol?.href && typeof protocol.href === "string" ? protocol.href.trim() : "";
  if (!href) {
    frameEl.removeAttribute("src");
    frameEl.style.display = "none";
    if (hintEl) hintEl.style.display = "";
    return;
  }
  frameEl.src = href;
  frameEl.style.display = "";
  if (hintEl) hintEl.style.display = "none";
}

function renderOptions(selectEl, items, selectedId) {
  const safeItems = Array.isArray(items) ? items : [];
  selectEl.innerHTML = '<option value="">Выберите протокол</option>';

  for (const p of safeItems) {
    if (!p?.id) continue;
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.title || p.id;
    selectEl.appendChild(option);
  }

  if (selectedId && safeItems.some((x) => x?.id === selectedId)) {
    selectEl.value = selectedId;
  } else if (safeItems.length > 0) {
    selectEl.value = safeItems[0].id;
  } else {
    selectEl.value = "";
  }
}

function initOrtopediaProtocols() {
  const selectEl = $("#ortopediaProtocolSelect");
  const searchEl = $("#ortopediaProtocolSearch");
  const openLinkEl = $("#ortopediaOpenLink");
  const frameEl = $("#ortopediaProtocolFrame");
  const hintEl = $("#ortopediaProtocolHint");
  if (!selectEl) return;

  const embedded = readEmbeddedJson("ortopediaData");
  const protocolsAll = Array.isArray(embedded?.protocols) ? embedded.protocols : [];

  if (protocolsAll.length === 0) {
    selectEl.innerHTML = '<option value="">Протоколы отсутствуют</option>';
    setOpenLinkState(openLinkEl, null);
    setFrameState(frameEl, hintEl, null);
    return;
  }

  const getFiltered = () => {
    const q = (searchEl?.value || "").trim().toLowerCase();
    if (!q) return protocolsAll;
    return protocolsAll.filter((p) => {
      const title = String(p?.title || "").toLowerCase();
      const id = String(p?.id || "").toLowerCase();
      return title.includes(q) || id.includes(q);
    });
  };

  const setById = (id) => {
    const protocol = protocolsAll.find((x) => x.id === id) || null;
    setOpenLinkState(openLinkEl, protocol);
    setFrameState(frameEl, hintEl, protocol);
  };

  renderOptions(selectEl, protocolsAll, protocolsAll[0]?.id);
  setById(selectEl.value);

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      const prevSelected = selectEl.value;
      const filtered = getFiltered();
      renderOptions(selectEl, filtered, prevSelected);
      setById(selectEl.value);
    });
  }

  selectEl.addEventListener("change", () => {
    setById(selectEl.value);
  });
}

document.addEventListener("DOMContentLoaded", initOrtopediaProtocols);

