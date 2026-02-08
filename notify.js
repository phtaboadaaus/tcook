/**
 * notify.js - Sistema de Alarmas Nativa con Sonidos Diferenciados y Bucle
 */

let webAudio = null; 

async function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }
    if (window.Capacitor?.Plugins?.LocalNotifications) {
        await Capacitor.Plugins.LocalNotifications.requestPermissions();
    }
}

function stopAlarmSound() {
    if (webAudio) {
        webAudio.pause();
        webAudio.currentTime = 0;
    }
    if ("vibrate" in navigator) {
        navigator.vibrate(0);
    }
}

async function scheduleNotification(timer, soundFile) {
    const delay = timer.endTime - Date.now();
    if (delay <= 0) return;

    // Diferenciar sonido: si es modo digital usamos sound_beep, si no sound_quack
    let finalSound = (timer.mode === "digital") ? "sound_beep.mp3" : "sound_quack.mp3";

    const timerName = timer.name || (timer.mode === "egg" ? t('modeDuck') : t('modeDigital'));
    const bodyText = t('timeUpBody');

    // --- 📱 ANDROID / CAPACITOR (Segundo plano) ---
    if (window.Capacitor?.Plugins?.LocalNotifications) {
        await Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [{
                id: timer.id,
                title: timerName,
                body: bodyText,
                schedule: { at: new Date(timer.endTime) },
                channelId: 'duck_alarm',
                sound: finalSound.replace('.mp3', ''),
                smallIcon: "ic_stat_duck", // Tu icono blanco en drawable
                ongoing: (settings.alarmMode === "loop"), // No se puede quitar si está en bucle
                priority: 2
            }]
        });
    }

    // --- LÓGICA CUANDO EL TIEMPO LLEGA A CERO (Primer plano) ---
    setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(timerName, {
                body: bodyText,
                icon: "assets/duck_1.png",
                tag: 'timer-' + timer.id,
                requireInteraction: true 
            });
        }

        // Reproducción de sonido
        if (webAudio) { webAudio.pause(); }
        webAudio = new Audio(`assets/${finalSound}`);
        
        // Aplicar modo bucle según ajustes
        webAudio.loop = (settings.alarmMode === "loop");
        
        webAudio.play().catch(e => console.log("Bloqueo de audio:", e));

        // Vibración
        if (settings.vibration) {
            if (window.Capacitor?.Plugins?.Haptics) {
                Capacitor.Plugins.Haptics.vibrate({ duration: 1000 });
            } else if ("vibrate" in navigator) {
                navigator.vibrate([500, 300, 500, 300, 500]);
            }
        }

    }, delay);
}