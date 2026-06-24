// backend/controllers/TransferConfirmController.js
const inventory = require('../models/inventory');
const { MEU_NODE_ID } = require('../config');

// ADICIONE ISSO AQUI: A variável que estava faltando
const processedMessages = new Set(); 

class TransferConfirmController {
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { message_id, receiver_peer_id, offer_sticker_id, want_sticker_id } = this.message;

        // 1. Deduplicação
        if (processedMessages.has(message_id)) return;
        processedMessages.add(message_id);

        // 2. Roteamento (A CHAVE DO PROBLEMA)
        if (receiver_peer_id !== MEU_NODE_ID) {
            console.log(`[TRANSFER_CONFIRM] Repassando para ${receiver_peer_id}...`);
            this.networkContext.broadcast(this.message);
            return;
        }

        // 3. É para mim, atualiza inventário
        console.log(`[TRANSFER_CONFIRM] Confirmação recebida. Atualizando inventário.`);
        inventory.removerFigurinha(want_sticker_id, 1);
        inventory.adicionarFigurinha(offer_sticker_id, 1);
    }
}
module.exports = TransferConfirmController;