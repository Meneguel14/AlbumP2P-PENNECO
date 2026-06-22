// ============================================================
// notificationService.js – Notificações com push para o frontend
// ============================================================

const notifications = [];
let pushCallback = null;

/** Registra a função que empurra eventos para os browsers via WebSocket. */
function setPushCallback(fn) {
    pushCallback = fn;
}

function addNotification(text) {
    const entry = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        time: new Date().toLocaleTimeString()
    };
    notifications.unshift(entry);

    // Empurra imediatamente para todos os browsers conectados
    if (pushCallback) {
        pushCallback({ type: 'NOTIFICATION', notification: entry });
    }
}

function getNotifications() {
    return notifications;
}

module.exports = { addNotification, getNotifications, setPushCallback };