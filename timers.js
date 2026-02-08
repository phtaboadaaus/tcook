let timers = [];
let nextId = 1;
let globalInterval = null;

function updateNextId() {
    if (timers.length === 0) {
        nextId = 1;
        return;
    }
    const maxId = Math.max(...timers.map(t => t.id));
    nextId = maxId + 1;
}
// Esta función ahora solo abre el modal de selección
function openTimerSelector() {
  if (timers.length >= 4) {
    alert("Máximo 4 timers"); // Puedes cambiar esto por un toast más adelante
    return;
  }
  document.getElementById("selectorModal").style.display = "flex";
}

function addTimer(mode) {
    updateNextId(); // Nos aseguramos de tener el ID correcto antes de crear
    
    // Generar un nombre que no choque con los existentes
    let indexName = 1;
    let defaultName = mode === "egg" ? `Pato ${indexName}` : `Timer ${indexName}`;
    
    // Bucle para evitar nombres duplicados tipo "Pato 1" si ya existe uno fijado
    while (timers.some(t => t.name === defaultName)) {
        indexName++;
        defaultName = mode === "egg" ? `Pato ${indexName}` : `Timer ${indexName}`;
    }

    timers.push({
        id: nextId++,
        mode: mode,
        name: defaultName,
        duration: 0,
        remaining: 0,
        endTime: null,
        state: "idle"
    });
    
    document.getElementById("selectorModal").style.display = "none";
    renderTimers();
}

function startTimer(id) {
  const timer = timers.find(t => t.id === id);
  if (!timer || timer.state === "running") return;

  // Calculamos el tiempo exacto de finalización
  timer.endTime = Date.now() + timer.remaining * 1000;
  timer.state = "running";

  const sound = timer.mode === "egg" ? settings.eggSound : settings.digitalSound;
  // Programamos la notificación externa
  scheduleNotification(timer, sound);

  // IMPORTANTE: Si no hay intervalo, lo creamos
  if (!globalInterval) {
    // Bajamos a 500ms para mayor precisión visual
    globalInterval = setInterval(updateAllTimers, 500); 
  }
  renderTimers();
}

function updateAllTimers() {
  const now = Date.now();
  let anyRunning = false;

  timers.forEach(timer => {
    if (timer.state === "running") {
      anyRunning = true;
      
      // Cálculo preciso del tiempo restante
      const diff = Math.ceil((timer.endTime - now) / 1000);
      timer.remaining = Math.max(0, diff);

      if (timer.remaining <= 0) {
        timer.state = "finished";
        // 1. Primero mostramos el modal (esto dispara el sonido en loop)
        showAlarmModal(timer); 
      }
    }
    // Mantenemos el bucle vivo si hay alarmas activas
    if (timer.state === "finished") anyRunning = true;
  });

  // LLAVE MAESTRA: Si no llamas a renderTimers aquí, el reloj no se mueve
  renderTimers(); 

  if (!anyRunning) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
}

function showAlarmModal(timer) {
  const modal = document.getElementById("alarmModal");
  if (!modal || modal.style.display === "flex") return; // Evitar duplicados

  const nameDisplay = document.getElementById("alarmTimerName");
  const stopBtn = document.getElementById("stopAlarmBtn");

  nameDisplay.textContent = timer.name.toUpperCase();
  modal.style.display = "flex";

  stopBtn.onclick = () => {
    stopAlarmSound(); // Para el audio
    timer.state = "idle";
    timer.remaining = timer.duration; 
    modal.style.display = "none";
    renderTimers(); // Refrescar para quitar el estado 'finished'
  };
}

function clearTimer(id) {
  stopAlarmSound(); // Importante detener el audio al borrar
  timers = timers.filter(t => t.id !== id);
  renderTimers();
}


function renderTimers() {
  const grid = document.getElementById("timerGrid");
  if(!grid) return;
  grid.innerHTML = "";
  grid.className = `timers-${timers.length}`;

  timers.forEach(timer => {
    const el = timer.mode === "egg" ? renderEggTimer(timer) : renderDigitalTimer(timer);
    grid.appendChild(el);
  });
}
// Añade estas funciones a timers.js

function adjustTime(id, unit, amount) {
  const timer = timers.find(t => t.id === id);
  if (timer.state === "running") return;

  if (unit === 'h') timer.remaining += amount * 3600;
  if (unit === 'm') timer.remaining += amount * 60;
  if (unit === 's') timer.remaining += amount;

  if (timer.remaining < 0) timer.remaining = 0;
  timer.duration = timer.remaining; // Actualizar duración base
  renderTimers();
}

function toggleTimer(id) {
  const timer = timers.find(t => t.id === id);
  if (timer.state === "running") {
    timer.state = "paused";
  } else {
    startTimer(id);
  }
  renderTimers();
}

// Formateador pro: HH:MM:SS
function formatFullTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const parts = [
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ];
  if (h > 0) parts.unshift(h.toString().padStart(2, '0'));
  return parts.join(':');
}
function resetTimerTime(id) {
  const timer = timers.find(t => t.id === id);
  if (timer) {
    timer.state = "idle";
    timer.remaining = 0;
    timer.duration = 0;
    renderTimers();
  }
}

/*--------------------- PINS-----------------*/
// Al cargar la app (DOMContentLoaded), llamar a esta función:
function loadPinnedTimers() {
  const saved = localStorage.getItem("pinnedDuckTimers");
  if (saved) {
    const pinned = JSON.parse(saved);
    // Mapeamos para asegurar que el estado sea 'idle' al cargar
    timers = pinned.map(t => ({
      ...t,
      id: nextId++, 
      state: "idle",
      remaining: t.duration // Empiezan con su tiempo original
    }));
    renderTimers();
  }
}

function togglePin(id) {
  const timer = timers.find(t => t.id === id);
  if (timer) {
    timer.isPinned = !timer.isPinned;
    savePinnedTimers();
    renderTimers();
  }
}

function savePinnedTimers() {
  const pinned = timers.filter(t => t.isPinned);
  localStorage.setItem("pinnedDuckTimers", JSON.stringify(pinned));
}