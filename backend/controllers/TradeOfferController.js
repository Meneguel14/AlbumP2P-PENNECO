// ============================================================
// TradeOfferController.js
// Protocolo TRADE_OFFER – Recebe proposta de troca de outro nó.
//
// A proposta é armazenada na fila de pendentes para que o
// usuário possa aceitar ou recusar pelo frontend.
// ============================================================
const tradeState = require('../services/tradeService');
const notificationService = require('../services/notificationService');

class TradeOfferController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem TRADE_OFFER recebida
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
            `[TRADE_OFFER] Proposta de ${sender_peer_id}: ` +
            `oferece ${offer_sticker_id} e quer ${want_sticker_id}`
        );

        // Armazena para decisão do usuário via frontend
        tradeState.addOffer(this.message);

        notificationService.addNotification(
            `Proposta de ${sender_peer_id}: oferece ${offer_sticker_id} e quer ${want_sticker_id}`
        );
    }
}

module.exports = TradeOfferController;
