const inventory = require('../models/inventory');

function processTradeOffer(ws, message, networkContext, myNodeId) {
    console.log(`[TRADE_OFFER] Recebida proposta de ${message.sender_peer_id}: Oferece ${message.offered_sticker} em troca da minha ${message.wanted_sticker}.`);

    const tenhoParaDar = inventory.getQuantidade(message.wanted_sticker) > 0;
    // Opcionalmente você poderia verificar se já possui a figurinha oferecida ou se quer ela

    if (tenhoParaDar) {
        console.log(`[TRADE] Aceitando proposta de ${message.sender_peer_id}.`);
        const acceptMsg = {
            type: "TRADE_ACCEPT",
            sender_peer_id: myNodeId,
            receiver_peer_id: message.sender_peer_id,
            offered_sticker: message.wanted_sticker, // O que ele queria, agora eu ofereço
            wanted_sticker: message.offered_sticker
        };
        networkContext.sendMessage(ws, acceptMsg);
    } else {
        console.log(`[TRADE] Rejeitando proposta. Não tenho ${message.wanted_sticker} no inventário.`);
        const rejectMsg = {
            type: "TRADE_REJECT",
            sender_peer_id: myNodeId,
            receiver_peer_id: message.sender_peer_id
        };
        networkContext.sendMessage(ws, rejectMsg);
    }
}

function processTradeAccept(ws, message, networkContext, myNodeId) {
    console.log(`[TRADE_ACCEPT] ${message.sender_peer_id} aceitou a troca! Confirmando transação...`);
    
    // Removemos a que demos, adicionamos a que recebemos
    const sucessoRemover = inventory.removerFigurinha(message.wanted_sticker, 1);
    
    if(sucessoRemover) {
        inventory.adicionarFigurinha(message.offered_sticker, 1);
        const confirmMsg = {
            type: "TRANSFER_CONFIRM",
            sender_peer_id: myNodeId,
            receiver_peer_id: message.sender_peer_id,
            transferred_sticker: message.wanted_sticker
        };
        networkContext.sendMessage(ws, confirmMsg);
        console.log(`[TRADE] Troca concluída localmente. Confirmação enviada!`);
    }
}

function processTransferConfirm(ws, message) {
    console.log(`[TRANSFER_CONFIRM] Confirmando recebimento da figurinha ${message.transferred_sticker} pelo nó ${message.sender_peer_id}.`);
    inventory.adicionarFigurinha(message.transferred_sticker, 1);
    // Removemos a nossa do inventário neste lado
    inventory.removerFigurinha(inventory.getInventario().figurinha_autoral, 1); 
    console.log(`[TRADE] Inventário atualizado com sucesso!`);
}

module.exports = { processTradeOffer, processTradeAccept, processTransferConfirm };


