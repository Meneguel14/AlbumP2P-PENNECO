const searchService = require('../services/searchService');

function handleMessage(ws, message, networkContext) {
    switch (message.type) {
        case 'HELLO':
            console.log(`[HELLO] Vizinho disse: ${message.payload.message}`);
            break;
            
        case 'SEARCH':
            searchService.processSearch(ws, message, networkContext);
            break;
            
        case 'SEARCH_HIT':
            console.log(`[HIT] A figurinha ${message.sticker_id} foi encontrada no nó ${message.sender_peer_id}!`);
            break;

        case 'SEARCH_MISS':
            console.log(`[MISS] O nó ${message.sender_peer_id} não possui a figurinha ${message.sticker_id}.`);
            break;

        // Futuramente colocaremos aqui TRADE_OFFER, TRADE_ACCEPT, etc.
            
        default:
            console.log(`[AVISO] Tipo de mensagem desconhecido: ${message.type}`);
    }
}

module.exports = { handleMessage };