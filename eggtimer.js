function renderEggTimer(timer) {
  const div = document.createElement("div");
  div.className = "timerCard egg-card-complex";

  // --- FILA SUPERIOR: PIN, NOMBRE Y CERRAR ---
  const topRow = document.createElement("div");
  topRow.className = "timer-top-row";

  const pinBtn = document.createElement("button");
  pinBtn.className = `pin-btn ${timer.isPinned ? 'active' : ''}`;
  pinBtn.innerHTML = `<span class="material-icons">push_pin</span>`;
  pinBtn.onclick = () => togglePin(timer.id);
  
  const nameInput = document.createElement("input");
  nameInput.className = "timer-name-edit";
  nameInput.value = timer.name || "Pato";
  nameInput.onchange = (e) => { timer.name = e.target.value; savePinnedTimers(); };

  const closeBtn = document.createElement("button");
  closeBtn.className = "delete-btn-corner";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => clearTimer(timer.id);

  topRow.append(pinBtn, nameInput, closeBtn);

  // --- CUERPO CENTRAL: DOS COLUMNAS ---
  const bodyCenter = document.createElement("div");
  bodyCenter.className = "timer-body-center";

  // COLUMNA IZQUIERDA: Ajustes + Botones de Acción
  const leftCol = document.createElement("div");
  leftCol.className = "egg-controls-column";

  const createRow = (label, unit) => {
    const row = document.createElement("div");
    row.className = "adjust-group-horizontal";
    const p = document.createElement("button");
    p.className = "btn-round"; p.textContent = "+";
    p.onclick = () => adjustTime(timer.id, unit, 1);
    const l = document.createElement("span");
    l.className = "unit-label"; l.textContent = label;
    const m = document.createElement("button");
    m.className = "btn-round"; m.textContent = "-";
    m.onclick = () => adjustTime(timer.id, unit, -1);
    row.append(p, l, m);
    return row;
  };
  
  // Añadimos HRS, MIN, SEG
  leftCol.append(createRow("HR", "h"), createRow("MIN", "m"), createRow("SEG", "s"));

  // Añadimos botones de acción DEBAJO en la misma columna
  const actionGroup = document.createElement("div");
  actionGroup.className = "egg-action-group-vertical";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn-egg-action";
  const icon = timer.state === "running" ? "pause" : "play_arrow";
  toggleBtn.innerHTML = `<span class="material-icons">${icon}</span>`;
  toggleBtn.onclick = () => {
    if (timer.remaining <= 0 && timer.state !== "running") {
      alert(t("emptyTimeAlert"));
      return;
    }
    toggleTimer(timer.id);
  };

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn-egg-clear";
  clearBtn.textContent = "C";
  clearBtn.onclick = () => resetTimerTime(timer.id);

  actionGroup.append(toggleBtn, clearBtn);
  leftCol.appendChild(actionGroup);

  // COLUMNA DERECHA: Imagen del Pato
  const rightCol = document.createElement("div");
  rightCol.className = "egg-visual-column";
  const img = document.createElement("img");
  img.className = "egg-image-main";
  
  const progress = timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0;

// Si ya terminó O si falta muy poquito (más del 98% de progreso)
if (timer.state === "finished" || progress >= 97) {
    img.src = "assets/duck_5.png";
} 
else if (progress >= 75) {
    img.src = "assets/duck_4.png";
} 
else if (progress >= 50) {
    img.src = "assets/duck_3.png";
} 
else if (progress >= 25) {
    img.src = "assets/duck_2.png";
} 
else {
    img.src = "assets/duck_1.png";
}
  rightCol.appendChild(img);

  bodyCenter.append(leftCol, rightCol);

  // --- FILA INFERIOR: SOLO EL TIEMPO ---
  const bottomRow = document.createElement("div");
  bottomRow.className = "timer-bottom-row";
  const timeText = document.createElement("div");
  timeText.className = "egg-time-display-large";
  timeText.textContent = formatFullTime(timer.remaining);
  bottomRow.appendChild(timeText);

  div.append(topRow, bodyCenter, bottomRow);
  return div;
}