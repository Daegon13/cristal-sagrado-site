export function wireViewMore(list) {
  list.querySelectorAll(".serv-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const description = button.closest("li")?.querySelector(".serv-desc");
      if (!description) return;
      description.classList.toggle("clamp-3");
      button.textContent = description.classList.contains("clamp-3") ? "Ver descripción completa" : "Mostrar menos";
    });
  });
}

export function attachSearch(inputSelector = "#buscador-servicios", listSelector = "#lista-servicios") {
  const input = document.querySelector(inputSelector);
  const list = document.querySelector(listSelector);
  if (!input || !list) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    let matches = 0;
    list.querySelectorAll("li.serv-card").forEach((card) => {
      const title = (card.querySelector(".serv-title")?.textContent || "").toLowerCase();
      const description = (card.querySelector(".serv-desc")?.textContent || "").toLowerCase();
      const match = !term || title.includes(term) || description.includes(term);
      card.hidden = !match;
      card.style.display = match ? "" : "none";
      if (match) matches += 1;
    });
    let empty = list.querySelector(".serv-search-empty");
    if (term && !matches && !empty) {
      empty = document.createElement("li");
      empty.className = "service-state serv-search-empty";
      empty.textContent = "No encontré trabajos con esa búsqueda. Probá con otra palabra o consultame por WhatsApp.";
      list.appendChild(empty);
    }
    if (empty) empty.hidden = !term || matches > 0;
  });
}
