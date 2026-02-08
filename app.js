// app.js - Versión Final con Canales de Notificación y Modos de Alarma
document.addEventListener("DOMContentLoaded", async () => {
  // 1. CARGA INICIAL
  loadSettings(); 
  if (typeof loadPinnedTimers === "function") {
      loadPinnedTimers();
      updateNextId();
  }

  // 2. CREAR CANAL DE NOTIFICACIÓN (Para que Android use tu sonido y vibración)
  const createNotificationChannel = async () => {
    if (window.Capacitor?.Plugins?.LocalNotifications) {
      try {
        await Capacitor.Plugins.LocalNotifications.createChannel({
          id: 'duck_alarm',
          name: 'Alarmas de Duck Timer',
          description: 'Canal para las alarmas de los temporizadores',
          importance: 5, // Importancia máxima: Sonido + Banner en pantalla
          visibility: 1,
          sound: 'sound_quack', // Sonido por defecto del canal
          vibration: true,
          lights: true
        });
      } catch (e) {
        console.error("Error creando canal:", e);
      }
    }
  };
  await createNotificationChannel();

  // 3. TRADUCCIÓN DE LA INTERFAZ
  const translateUI = () => {
    document.title = t("appTitle");
    const idsToTranslate = {
      "appTitle": "appTitle",
      "modalTitle": "settingsTitle",
      "labelDark": "labelAppearance",
      "labelLang": "labelLanguage",
      "openPrivacy": "labelPrivacy",
      "closeSettings": "btnAccept",
      "selectorTitle": "newTimerTitle",
      "closeSelector": "btnCancel",
      "stopAlarmBtn": "btnStopAlarm",
      "alarmMessage": "timeUpBody",
      "labelMaxTimers": "labelMaxTimers",
      "labelSupport": "labelSupport",
      "labelVersionText": "labelVersion",
      "closeInfoBtn": "btnAccept",
      "labelVibrate": "labelVibration",
      "labelAlarmMode": "labelAlarmMode" // Nueva llave para el modo de alarma
    };

    for (const [id, key] of Object.entries(idsToTranslate)) {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    }

    const eggBtn = document.getElementById("btnSelectEgg");
    if (eggBtn) eggBtn.querySelector("span").textContent = t("modeDuck");
    const digBtn = document.getElementById("btnSelectDigital");
    if (digBtn) digBtn.querySelector("span").textContent = t("modeDigital");
  };
  translateUI();

  // 4. REFERENCIAS Y ESTADOS
  const themeSwitch = document.getElementById("themeSwitch");
  const langSelect = document.getElementById("langSelect");
  const maxTimersInput = document.getElementById("maxTimersInput");
  const settingsModal = document.getElementById("settingsModal");
  const selectorModal = document.getElementById("selectorModal");
  const privacyModal = document.getElementById("privacyModal");
  const infoModal = document.getElementById("infoModal");
  const vibrateSwitch = document.getElementById("vibrateSwitch");
  const alarmModeSelect = document.getElementById("alarmModeSelect");

  // Cargar estados iniciales
  if (vibrateSwitch) vibrateSwitch.checked = settings.vibration;
  if (alarmModeSelect) alarmModeSelect.value = settings.alarmMode || "once";

  vibrateSwitch.onchange = (e) => {
      settings.vibration = e.target.checked;
      saveSettings();
  };

  alarmModeSelect.onchange = (e) => {
      settings.alarmMode = e.target.value;
      saveSettings();
  };

  window.showNotice = (message) => {
    const infoMsgEl = document.getElementById("infoModalMessage");
    if (infoMsgEl && infoModal) {
      infoMsgEl.textContent = message;
      infoModal.style.display = "flex";
    }
  };

  const closeInfoBtn = document.getElementById("closeInfoBtn");
  if (closeInfoBtn) {
    closeInfoBtn.onclick = () => {
      infoModal.style.display = "none";
    };
  }

  document.body.dataset.theme = settings.theme;
  if (themeSwitch) themeSwitch.checked = (settings.theme === "dark");
  if (langSelect) langSelect.value = settings.language;
  if (maxTimersInput) maxTimersInput.value = settings.maxTimers || 4;

  // 5. EVENTOS
  document.getElementById("addTimerBtn").onclick = () => {
    const limit = settings.maxTimers || 4;
    if (timers.length >= limit) {
      window.showNotice(`${t("maxTimersAlert")} ${limit}`);
      return;
    }
    selectorModal.style.display = "flex";
  };

  document.getElementById("btnSelectEgg").onclick = () => {
    addTimer("egg");
    selectorModal.style.display = "none";
  };

  document.getElementById("btnSelectDigital").onclick = () => {
    addTimer("digital");
    selectorModal.style.display = "none";
  };

  document.getElementById("closeSelector").onclick = () => {
    selectorModal.style.display = "none";
  };

  document.getElementById("settingsBtn").onclick = () => {
    settingsModal.style.display = "flex";
  };

  document.getElementById("closeSettings").onclick = () => {
    settingsModal.style.display = "none";
  };

  themeSwitch.onchange = (e) => {
    settings.theme = e.target.checked ? "dark" : "light";
    document.body.dataset.theme = settings.theme;
    saveSettings();
  };

  langSelect.onchange = (e) => {
    settings.language = e.target.value;
    saveSettings();
    location.reload(); 
  };

  if (maxTimersInput) {
    maxTimersInput.onchange = (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 20) val = 20; 
      settings.maxTimers = val;
      e.target.value = val;
      saveSettings();
    };
  }

  document.getElementById("openPrivacy").onclick = () => {
    privacyModal.style.display = "flex";
  };
  document.getElementById("closePrivacy").onclick = () => {
    privacyModal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  };

  await requestNotificationPermission();
  renderTimers();
});

const preloadImages = () => {
  ["1", "2", "3", "4", "5"].forEach(num => {
    const img = new Image();
    img.src = `assets/duck_1.png`; // Ajustado al nombre real de tus assets
  });
};
preloadImages();