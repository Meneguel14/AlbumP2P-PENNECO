// ============================================================
// tradeService.js – Estado e ações de troca iniciadas manualmente
//
// Mantém a fila de propostas recebidas aguardando decisão do
// usuário e fornece as funções chamadas pelas rotas HTTP.
//
// Nota sobre os campos:
//   offer_sticker_id = figurinha que o REMETENTE está oferecendo
//   want_sticker_id  = figurinha que o REMETENTE deseja receber
// ============================================================
const crypto = require('crypto');
const inventory = require('../models/inventory');
const notificationService = require('../services/notificationService');
const { MEU_NODE_ID } = require('../config');

let pendingOffers = [];
let pushCallback = null;

/** Registra a função que empurra eventos para os browsers via WebSocket. */
function setPushCallback(fn) {
    pushCallback = fn;
}

/** Adiciona uma proposta recebida à fila de pendentes e notifica o browser. */
function addOffer(offer) {
    pendingOffers.push(offer);
    if (pushCallback) {
        pushCallback({ type: 'PENDING_OFFERS', pending: pendingOffers });
    }
}

/** Retorna todas as propostas ainda aguardando decisão. */
function getPendingOffers() {
    return pendingOffers;
}

/**
 * Aceita uma proposta da fila (chamado pela rota HTTP do frontend).
 *
 * Fluxo (conforme especificação):
 *   1. Atualiza o inventário local (damos a figurinha que pediram, recebemos a oferecida).
 *   2. Envia TRADE_ACCEPT.
 *   3. Envia TRANSFER_CONFIRM para que o proponente atualize o inventário dele.
 *
 * @param {string} offerId       – sender_peer_id da proposta a aceitar
 * @param {Object} networkContext – { broadcast }
 * @returns {boolean} true se a proposta foi encontrada e aceita com sucesso
 */
function processManualAccept(offerId, networkContext) {
    const idx = pendingOffers.findIndex(o => o.sender_peer_id === offerId);
    if (idx === -1) return false;

    const offer = pendingOffers.splice(idx, 1)[0];
    // offer.offer_sticker_id = figurinha que o proponente nos envia (receberemos)
    // offer.want_sticker_id  = figurinha que o proponente quer de nós (daremos)

    // 1. Verificar saldo e atualizar inventário
    const removeSuccess = inventory.removerFigurinha(offer.want_sticker_id, 1);
    if (!removeSuccess) {
        notificationService.addNotification(
            `Saldo insuficiente para ${offer.want_sticker_id}. Proposta não aceita.`
        );
        return false;
    }
    inventory.adicionarFigurinha(offer.offer_sticker_id, 1);

    // 2. Enviar TRADE_ACCEPT (da perspectiva de quem aceita)
    const acceptMsg = {
        type: 'TRADE_ACCEPT',
        message_id: crypto.randomUUID(),
        origin_peer_id: MEU_NODE_ID,
        sender_peer_id: MEU_NODE_ID,
        receiver_peer_id: offer.sender_peer_id,
        offer_sticker_id: offer.want_sticker_id,   // O que NÓS oferecemos = o que eles queriam
        want_sticker_id: offer.offer_sticker_id    // O que NÓS queremos   = o que eles ofereciam
    };
    networkContext.broadcast(acceptMsg);

    // 3. Enviar TRANSFER_CONFIRM para o proponente atualizar o inventário dele
    const confirmMsg = {
        type: 'TRANSFER_CONFIRM',
        message_id: crypto.randomUUID(),
        origin_peer_id: MEU_NODE_ID,
        sender_peer_id: MEU_NODE_ID,
        receiver_peer_id: offer.sender_peer_id,
        offer_sticker_id: offer.want_sticker_id,   // O que transferimos para eles
        want_sticker_id: offer.offer_sticker_id    // O que recebemos deles
    };
    networkContext.broadcast(confirmMsg);

    notificationService.addNotification(
        `Você aceitou a proposta de ${offer.sender_peer_id}. Inventário atualizado!`
    );
    console.log(`[TRADE] Proposta de ${offer.sender_peer_id} aceita. Inventário atualizado.`);
    return true;
}

/**
 * Rejeita uma proposta da fila (chamado pela rota HTTP do frontend).
 * Nenhum inventário é alterado.
 *
 * @param {string} offerId       – sender_peer_id da proposta a rejeitar
 * @param {Object} networkContext – { broadcast }
 * @returns {boolean} true se a proposta foi encontrada
 */
function processManualReject(offerId, networkContext) {
    const idx = pendingOffers.findIndex(o => o.sender_peer_id === offerId);
    if (idx === -1) return false;

    const offer = pendingOffers.splice(idx, 1)[0];

    const rejectMsg = {
        type: 'TRADE_REJECT',
        message_id: crypto.randomUUID(),
        origin_peer_id: MEU_NODE_ID,
        sender_peer_id: MEU_NODE_ID,
        receiver_peer_id: offer.sender_peer_id,
        offer_sticker_id: offer.want_sticker_id,   // Campos espelhados como no TRADE_ACCEPT
        want_sticker_id: offer.offer_sticker_id
    };
    networkContext.broadcast(rejectMsg);

    notificationService.addNotification(
        `Você recusou a proposta de ${offer.sender_peer_id}.`
    );
    console.log(`[TRADE] Proposta de ${offer.sender_peer_id} recusada.`);
    return true;
}

module.exports = {
    addOffer,
    getPendingOffers,
    processManualAccept,
    processManualReject,
    setPushCallback
};