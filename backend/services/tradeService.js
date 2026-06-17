const inventory = require('../models/inventory');

// Guarda as propostas recebidas aguardando ação do usuário
let pendingOffers = [];

function getPendingOffers() {
    return pendingOffers;
}

function processTradeOffer(ws, message, networkContext, myNodeId) {
    console.log(`[TRADE_OFFER] Proposta recebida de ${message.sender_peer_id}. Aguardando decisão do usuário...`);
    
    // Adiciona a proposta na lista para o frontend ler
    pendingOffers.push(message);
}

// Quando o usuário clica no HTML em "Aceitar"
function processManualAccept(offerId, networkContext, myNodeId) {
    // Busca a oferta na lista pelo ID de quem mandou (simplificado)
    const offerIndex = pendingOffers.findIndex(o => o.sender_peer_id === offerId);
    if (offerIndex === -1) return false;

    const offer = pendingOffers[offerIndex];
    pendingOffers.splice(offerIndex, 1); // Remove da lista de pendentes

    console.log(`[TRADE] Você aceitou a proposta de ${offer.sender_peer_id}.`);
    
    const acceptMsg = {
        type: "TRADE_ACCEPT",
        sender_peer_id: myNodeId,
        receiver_peer_id: offer.sender_peer_id,
        offered_sticker: offer.wanted_sticker, 
        wanted_sticker: offer.offered_sticker
    };
    
    // Faz o broadcast para avisar o outro nó que aceitamos
    networkContext.broadcast(acceptMsg);
    return true;
}

// Quando o usuário clica no HTML em "Recusar"
function processManualReject(offerId, networkContext, myNodeId) {
    const offerIndex = pendingOffers.findIndex(o => o.sender_peer_id === offerId);
    if (offerIndex === -1) return false;

    const offer = pendingOffers[offerIndex];
    pendingOffers.splice(offerIndex, 1);

    const rejectMsg = {
        type: "TRADE_REJECT",
        sender_peer_id: myNodeId,
        receiver_peer_id: offer.sender_peer_id
    };
    networkContext.broadcast(rejectMsg);
    return true;
}

function processTradeAccept(ws, message, networkContext, myNodeId) {
    console.log(`[TRADE_ACCEPT] ${message.sender_peer_id} aceitou sua proposta!`);
    
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
        console.log(`[TRADE] Confirmação de transferência enviada!`);
    }
}

function processTransferConfirm(ws, message) {
    console.log(`[TRANSFER_CONFIRM] Transferência concluída pelo nó ${message.sender_peer_id}.`);
    inventory.adicionarFigurinha(message.transferred_sticker, 1);
    inventory.removerFigurinha(inventory.getInventario().figurinha_autoral, 1); 
}

module.exports = { 
    processTradeOffer, 
    processTradeAccept, 
    processTransferConfirm,
    getPendingOffers,
    processManualAccept,
    processManualReject
};