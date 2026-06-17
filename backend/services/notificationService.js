const notifications = [];

function addNotification(message) {
    notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        text: message,
        time: new Date().toLocaleTimeString()
    });
}

function getNotifications() {
    return notifications;
}

module.exports = { addNotification, getNotifications };