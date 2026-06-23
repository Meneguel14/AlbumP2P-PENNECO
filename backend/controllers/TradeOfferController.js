// ============================================================
// TradeOfferController.js
// Protocolo TRADE_OFFER – Recebe proposta de troca de outro nó.
//
// Correções aplicadas:
//   1. Só processa se receiver_peer_id === MEU_NODE_ID
//      (evita aceitar propostas destinadas a outros nós)
//   2. Deduplicação por message_id
//      (evita duplicatas quando o remetente tem múltiplas conexões)
// ============================================================
const tradeState = require('../services/tradeService');
const notificationService = require('../services/notificationService');
const { MEU_NODE_ID } = require('../config');

// Set para deduplicação de TRADE_OFFERs já processados
const processedOffers = new Set();

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
        const { message_id, sender_peer_id, receiver_peer_id, offer_sticker_id, want_sticker_id } = this.message;

        // 1. Verifica se a proposta é destinada a este nó
        if (receiver_peer_id !== MEU_NODE_ID) {
            console.log(`[TRADE_OFFER] Ignorado – destinado a ${receiver_peer_id}, não a ${MEU_NODE_ID}.`);
            return;
        }

        // 2. Evita duplicata (mesmo message_id chegando por múltiplos caminhos)
        if (processedOffers.has(message_id)) {
            console.log(`[TRADE_OFFER] Duplicata ignorada (message_id: ${message_id}).`);
            return;
        }
        processedOffers.add(message_id);

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
