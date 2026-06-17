const searchService = require('../services/searchService');
const tradeService = require('../services/tradeService');
const notificationService = require('../services/notificationService');

function handleMessage(ws, message, networkContext) {
    switch (message.type) {
        case 'HELLO':
            console.log(`[HELLO] Vizinho disse: ${message.payload.message}`);
            notificationService.addNotification(`Vizinho conectado na rede.`);
            break;
            
        case 'SEARCH':
            searchService.processSearch(ws, message, networkContext);
            break;
            
        case 'SEARCH_HIT':
            const hitText = `[HIT] Figurinha ${message.sticker_id} encontrada no nó ${message.sender_peer_id}!`;
            console.log(hitText);
            notificationService.addNotification(hitText);
            break;

        case 'SEARCH_MISS':
            break;

        case 'TRADE_OFFER':
            const offerText = `Proposta de ${message.sender_peer_id}: Quer ${message.wanted_sticker} e oferece ${message.offered_sticker}`;
            notificationService.addNotification(offerText);
            tradeService.processTradeOffer(ws, message, networkContext, searchService.MEU_NODE_ID);
            break;
            
        case 'TRADE_ACCEPT':
            notificationService.addNotification(`Troca aceita por ${message.sender_peer_id}!`);
            tradeService.processTradeAccept(ws, message, networkContext, searchService.MEU_NODE_ID);
            break;

        case 'TRADE_REJECT':
            notificationService.addNotification(`Troca recusada por ${message.sender_peer_id}.`);
            break;

        case 'TRANSFER_CONFIRM':
            notificationService.addNotification(`Transferência confirmada com ${message.sender_peer_id}!`);
            tradeService.processTransferConfirm(ws, message);
            break;
            
        default:
            console.log(`[AVISO] Tipo de mensagem desconhecido: ${message.type}`);
    }
}

module.exports = { handleMessage };