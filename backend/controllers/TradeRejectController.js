// ============================================================
// TradeRejectController.js
// Protocolo TRADE_REJECT – O outro nó recusou nossa proposta.
// Nenhum inventário é alterado.
// ============================================================
const notificationService = require('../services/notificationService');

class TradeRejectController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem TRADE_REJECT recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { sender_peer_id, offer_sticker_id, want_sticker_id } = this.message;

        console.log(
            `[TRADE_REJECT] ${sender_peer_id} recusou a proposta ` +
            `(${offer_sticker_id} por ${want_sticker_id}).`
        );

        notificationService.addNotification(
            `Troca recusada por ${sender_peer_id}. Proposta: ${offer_sticker_id} ↔ ${want_sticker_id}`
        );

        // Nenhum inventário é alterado conforme especificação.
    }
}

module.exports = TradeRejectController;
