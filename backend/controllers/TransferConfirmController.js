// ============================================================
// TransferConfirmController.js
// Protocolo TRANSFER_CONFIRM – Confirma conclusão da troca.
//
// Este nó recebe o CONFIRM enviado pelo accepter e atualiza
// seu inventário com base nos campos offer_sticker_id e
// want_sticker_id da mensagem.
//
// Campos na mensagem recebida (perspectiva do accepter que enviou):
//   offer_sticker_id = o que o accepter transferiu para NÓS (recebemos)
//   want_sticker_id  = o que o accepter recebeu de NÓS (demos a ele)
// ============================================================
const inventory = require('../models/inventory');
const notificationService = require('../services/notificationService');
const { MEU_NODE_ID } = require('../config');

class TransferConfirmController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem TRANSFER_CONFIRM recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { sender_peer_id, receiver_peer_id, offer_sticker_id, want_sticker_id } = this.message;

        // Só processa se a mensagem é destinada a este nó
        if (receiver_peer_id !== MEU_NODE_ID) {
            console.log(`[TRANSFER_CONFIRM] Ignorado – destinado a ${receiver_peer_id}, não a ${MEU_NODE_ID}.`);
            return;
        }

        console.log(
            `[TRANSFER_CONFIRM] Transferência confirmada por ${sender_peer_id}: ` +
            `recebemos ${offer_sticker_id}, demos ${want_sticker_id}.`
        );

        // Atualiza o inventário:
        // - Recebemos 'offer_sticker_id' (o que o accepter nos enviou)
        // - Demos 'want_sticker_id' (o que o accepter queria de nós)
        const removeSuccess = inventory.removerFigurinha(want_sticker_id, 1);
        if (removeSuccess) {
            inventory.adicionarFigurinha(offer_sticker_id, 1);
            const text = `Troca concluída com ${sender_peer_id}! Inventário atualizado.`;
            console.log(`[TRANSFER_CONFIRM] ${text}`);
            notificationService.addNotification(text);
        } else {
            console.log(`[TRANSFER_CONFIRM] Erro ao atualizar inventário para ${want_sticker_id}.`);
        }
    }
}

module.exports = TransferConfirmController;
