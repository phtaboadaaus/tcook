const SETTINGS_KEY = "duckTimerSettings";

let settings = {
  language: "es",
  theme: "light",
  eggSound: "sound_quack.mp3",
  digitalSound: "sound_beep.mp3",
  maxTimers: 4,
  vibration: true
};

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) settings = JSON.parse(saved);
  currentLang = settings.language;
  document.body.dataset.theme = settings.theme;
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
