// ============================================================
// TradeOfferController.js
// Protocolo TRADE_OFFER – Recebe ou encaminha proposta de troca.
// ============================================================
const tradeService = require('../services/tradeService');
const { MEU_NODE_ID } = require('../config');
const inventory = require('../models/inventory');

// Set para evitar processar a mesma oferta múltiplas vezes (loop de rede)
const processedOffers = new Set();

class TradeOfferController {
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        // Desestruturando a mensagem. 
        // ATENÇÃO: Verifique se no seu JSON a figurinha está em this.message.want_sticker_id 
        // ou this.message.offer.want_sticker_id. Ajustei abaixo para o formato mais comum.
        const { message_id, receiver_peer_id, sender_peer_id, want_sticker_id } = this.message;

        // 1. Deduplicação: ignora se já processamos esta mensagem
        if (processedOffers.has(message_id)) {
            return; 
        }

        // 2. Validação de Disponibilidade (Só verificamos se for para nós)
        if (receiver_peer_id === MEU_NODE_ID) {
            if (inventory.getQuantidade(want_sticker_id) <= 0) {
                console.log(`[TRADE_OFFER] Rejeitado: ${want_sticker_id} não disponível.`);
                // Opcional: Enviar um TRADE_REJECT para o remetente aqui
                return;
            }
        }

        processedOffers.add(message_id);

        // 3. Roteamento
        if (receiver_peer_id === MEU_NODE_ID) {
            console.log(`[TRADE_OFFER] Proposta de ${sender_peer_id} recebida para mim.`);
            tradeService.addOffer(this.message);
        } else {
            console.log(`[TRADE_OFFER] Repassando oferta de ${sender_peer_id} para ${receiver_peer_id}.`);
            this.networkContext.broadcast(this.message);
        }
    }
}

module.exports = TradeOfferController;