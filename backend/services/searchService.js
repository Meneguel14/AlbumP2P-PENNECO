const crypto = require('crypto');
const inventory = require('../models/inventory');

const processedQueries = new Set();
// Identificador do nó obrigatório no formato ALUNO-YY
const MEU_NODE_ID = "ALUNO-17"; // Substitua pelo seu número

// Função NOVA: Inicia uma busca a partir do SEU nó
function initiateSearch(sticker_id, networkContext) {
    const query_id = crypto.randomUUID(); // Identificador único UUID global
    processedQueries.add(query_id); // Já salva para não reprocessar ecos

    const searchMessage = {
        type: "SEARCH",
        query_id: query_id,
        origin_peer_id: MEU_NODE_ID,
        sender_peer_id: MEU_NODE_ID,
        sticker_id: sticker_id,
        ttl: 7 // Campo obrigatório
    };

    console.log(`[SEARCH] Iniciando busca por ${sticker_id} (Query ID: ${query_id})`);
    networkContext.broadcast(searchMessage);
}

function processSearch(ws, message, networkContext) {
    if (processedQueries.has(message.query_id)) return; // Evita loop
    processedQueries.add(message.query_id);

    const quantidadeLocal = inventory.getQuantidade(message.sticker_id);
    
    if (quantidadeLocal > 0) {
        const hitMessage = {
            type: "SEARCH_HIT",
            sticker_id: message.sticker_id,
            origin_peer_id: message.origin_peer_id,
            sender_peer_id: MEU_NODE_ID,
            receiver_peer_id: message.sender_peer_id,
            query_id: message.query_id
        };
        networkContext.sendMessage(ws, hitMessage);
        console.log(`[SEARCH_HIT] Figurinha ${message.sticker_id} encontrada! Enviando resposta.`);
    } else {
        const missMessage = {
            type: "SEARCH_MISS",
            sticker_id: message.sticker_id,
            sender_peer_id: MEU_NODE_ID,
            query_id: message.query_id
        };
        networkContext.sendMessage(ws, missMessage);
    }

    if (message.ttl > 1) {
        const forwardMessage = { ...message, sender_peer_id: MEU_NODE_ID, ttl: message.ttl - 1 };
        networkContext.broadcast(forwardMessage, ws); // Repassa sem voltar para quem mandou
    }
}

module.exports = { processSearch, initiateSearch, MEU_NODE_ID };