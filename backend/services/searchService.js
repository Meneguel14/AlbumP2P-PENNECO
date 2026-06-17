const inventory = require('../models/inventory');

// Guarda o histórico de buscas para evitar loops infinitos (supressão de duplicatas)
const processedQueries = new Set();
const MEU_NODE_ID = "ALUNO-" + Math.floor(Math.random() * 1000); // Simulando o ID do nó local

function processSearch(ws, message, networkContext) {
    console.log(`[SEARCH] Buscando: ${message.sticker_id} | Query: ${message.query_id}`);

    // 1. Verifica duplicatas 
    if (processedQueries.has(message.query_id)) {
        console.log(`[SEARCH] Descartando mensagem duplicada: ${message.query_id}`);
        return;
    }

    // 2. Regista o identificador [cite: 19]
    processedQueries.add(message.query_id);

    // 3. Verifica inventário local
    const quantidadeLocal = inventory.getQuantidade(message.sticker_id);
    
    if (quantidadeLocal > 0) {
        // Encontrou! Responde com SEARCH_HIT
        const hitMessage = {
            type: "SEARCH_HIT",
            sticker_id: message.sticker_id,
            origin_peer_id: message.origin_peer_id,
            sender_peer_id: MEU_NODE_ID,
            receiver_peer_id: message.sender_peer_id,
            query_id: message.query_id
        };
        networkContext.sendMessage(ws, hitMessage);
        console.log(`[SEARCH] Figurinha ${message.sticker_id} encontrada! Enviando SEARCH_HIT.`);
    } else {
        // Opcional: Responde com SEARCH_MISS [cite: 13]
        const missMessage = {
            type: "SEARCH_MISS",
            sticker_id: message.sticker_id,
            sender_peer_id: MEU_NODE_ID,
            query_id: message.query_id
        };
        networkContext.sendMessage(ws, missMessage);
    }

    // 4. Reenvia a consulta aos vizinhos com ttl - 1 [cite: 19]
    if (message.ttl > 1) {
        const forwardMessage = {
            ...message,
            sender_peer_id: MEU_NODE_ID, 
            ttl: message.ttl - 1
        };
        console.log(`[SEARCH] Repassando busca. TTL atual: ${forwardMessage.ttl}`);
        // Faz broadcast, mas passa o 'ws' original para não devolver a mensagem de volta para quem nos enviou
        networkContext.broadcast(forwardMessage, ws);
    } else {
        console.log(`[SEARCH] Busca finalizada. TTL esgotado.`);
    }
}

module.exports = { processSearch };