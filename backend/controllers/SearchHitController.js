// ============================================================
// SearchHitController.js
// Protocolo SEARCH_HIT – Resposta positiva a uma busca.
//
// Se a mensagem é para nós (receiver_peer_id === MEU_NODE_ID),
// notificamos o usuário. Caso contrário, repassamos em direção
// ao nó de origem.
// ============================================================
const notificationService = require('../services/notificationService');
const { MEU_NODE_ID } = require('../config');

class SearchHitController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem SEARCH_HIT recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { sticker_id, origin_peer_id, receiver_peer_id } = this.message;

        if (receiver_peer_id === MEU_NODE_ID) {
            // O HIT chegou ao destino: sou eu quem iniciou a busca
            const text = `[HIT] Figurinha ${sticker_id} encontrada no nó ${origin_peer_id}!`;
            console.log(text);
            notificationService.addNotification(text);
        } else {
            // Ainda não chegou na origem – repasso pelo flood reverso
            console.log(`[SEARCH_HIT] Repassando HIT (destino: ${receiver_peer_id})...`);
            this.networkContext.broadcast(this.message, this.ws);
        }
    }
}

module.exports = SearchHitController;
