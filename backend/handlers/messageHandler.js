// ============================================================
// messageHandler.js – Dispatcher central de mensagens P2P
//
// Cada tipo de mensagem é delegado ao seu Controller exclusivo.
// Para adicionar um novo protocolo: crie o Controller e adicione
// um case aqui.
// ============================================================
const HelloController          = require('../controllers/HelloController');
const SearchController         = require('../controllers/SearchController');
const SearchHitController      = require('../controllers/SearchHitController');
const SearchMissController     = require('../controllers/SearchMissController');
const TradeOfferController     = require('../controllers/TradeOfferController');
const TradeAcceptController    = require('../controllers/TradeAcceptController');
const TradeRejectController    = require('../controllers/TradeRejectController');
const TransferConfirmController = require('../controllers/TransferConfirmController');

function handleMessage(ws, message, networkContext) {
    switch (message.type) {

        case 'HELLO':
            new HelloController(ws, message, networkContext).handle();
            break;

        case 'SEARCH':
            new SearchController(ws, message, networkContext).handle();
            break;

        case 'SEARCH_HIT':
            new SearchHitController(ws, message, networkContext).handle();
            break;

        case 'SEARCH_MISS':
            new SearchMissController(ws, message, networkContext).handle();
            break;

        case 'TRADE_OFFER':
            new TradeOfferController(ws, message, networkContext).handle();
            break;

        case 'TRADE_ACCEPT':
            new TradeAcceptController(ws, message, networkContext).handle();
            break;

        case 'TRADE_REJECT':
            new TradeRejectController(ws, message, networkContext).handle();
            break;

        case 'TRANSFER_CONFIRM':
            new TransferConfirmController(ws, message, networkContext).handle();
            break;

        default:
            console.log(`[AVISO] Tipo de mensagem desconhecido: "${message.type}"`);
    }
}

module.exports = { handleMessage };