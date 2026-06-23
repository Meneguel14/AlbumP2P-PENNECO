// ============================================================
// TradeAcceptController.js
// Protocolo TRADE_ACCEPT – O outro nó aceitou nossa proposta.
//
// Neste ponto, o ACCEPTER (quem aceitou) JÁ enviou o
// TRANSFER_CONFIRM junto com o TRADE_ACCEPT (conforme spec).
// Portanto, aqui apenas registramos o aceite e aguardamos o
// TRANSFER_CONFIRM chegar para atualizar o inventário.
// ============================================================
const notificationService = require('../services/notificationService');

class TradeAcceptController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem TRADE_ACCEPT recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { sender_peer_id, offer_sticker_id, want_sticker_id } = this.message;
        // offer_sticker_id = o que o accepter está nos dando
        // want_sticker_id  = o que o accepter quer de nós (já oferecemos antes)

        console.log(
            `[TRADE_ACCEPT] ${sender_peer_id} aceitou! ` +
            `Enviará ${offer_sticker_id} e receberá ${want_sticker_id}.`
        );

        notificationService.addNotification(
            `Troca aceita por ${sender_peer_id}! Aguardando confirmação de transferência...`
        );

        // O inventário será atualizado ao receber o TRANSFER_CONFIRM.
    }
}

module.exports = TradeAcceptController;
