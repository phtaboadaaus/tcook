function renderDigitalTimer(timer) {
  const div = document.createElement("div");
  div.className = "timerCard digital-card-complex";

  // --- FILA SUPERIOR: PIN, NOMBRE Y CERRAR ---
  const topRow = document.createElement("div");
  topRow.className = "timer-top-row";

  // Botón Pin
  const pinBtn = document.createElement("button");
  pinBtn.className = `pin-btn ${timer.isPinned ? 'active' : ''}`;
  pinBtn.innerHTML = `<span class="material-icons">push_pin</span>`;
  pinBtn.onclick = () => togglePin(timer.id);
  
  // Nombre Editable
  const nameInput = document.createElement("input");
  nameInput.className = "timer-name-edit";
  nameInput.value = timer.name || "Timer";
  nameInput.onchange = (e) => { 
    timer.name = e.target.value; 
    savePinnedTimers(); 
  };

  // Botón Cerrar
  const closeBtn = document.createElement("button");
  closeBtn.className = "delete-btn-corner";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => clearTimer(timer.id);

  topRow.append(pinBtn, nameInput, closeBtn);

  // --- CUERPO CENTRAL: DOS COLUMNAS ---
  const mainLayout = document.createElement("div");
  mainLayout.className = "digital-main-layout";

  // COLUMNA IZQUIERDA: Ajustes de tiempo (HR, MIN, SEG)
  const adjustCol = document.createElement("div");
  adjustCol.className = "digital-adjust-column";

  [['HR','h'],['MIN','m'],['SEG','s']].forEach(([label, unit]) => {
    const group = document.createElement("div");
    group.className = "adjust-group-horizontal";
    
    const p = document.createElement("button"); 
    p.className="btn-round"; p.textContent="+";
    p.onclick = () => adjustTime(timer.id, unit, 1);
    
    const l = document.createElement("span"); 
    l.className="unit-label"; l.textContent=label;
    
    const m = document.createElement("button"); 
    m.className="btn-round"; m.textContent="-";
    m.onclick = () => adjustTime(timer.id, unit, -1);
    
    group.append(p, l, m);
    adjustCol.appendChild(group);
  });

  // COLUMNA DERECHA: Start y Clear
  const actionsSide = document.createElement("div");
  actionsSide.className = "digital-actions-side";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn-dig-main";
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
  clearBtn.className = "btn-dig-clear";
  clearBtn.textContent = "C";
  clearBtn.onclick = () => resetTimerTime(timer.id);

  actionsSide.append(toggleBtn, clearBtn);

  // Unir columnas
  mainLayout.append(adjustCol, actionsSide);

  // --- FILA INFERIOR: TIEMPO GRANDE ---
  const timeDisplay = document.createElement("div");
  timeDisplay.className = "digital-time-large-bottom";
  timeDisplay.textContent = formatFullTime(timer.remaining);

  // Unir todo al div principal
  div.append(topRow, mainLayout, timeDisplay);

  return div;
}