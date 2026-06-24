// ============================================================
// SearchController.js
// Protocolo SEARCH – Busca por inundação (flooding).
//
// Responsabilidades:
//   handle()  – Processa SEARCH recebido de um vizinho.
//   initiate() – Inicia uma nova busca a partir deste nó.
// ============================================================
const crypto = require('crypto');
const os = require('os');
const inventory = require('../models/inventory');
const notificationService = require('../services/notificationService');
const searchState = require('../services/searchService');
const { MEU_NODE_ID, MEU_IP, SEARCH_TTL } = require('../config');

class SearchController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem SEARCH recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { query_id, sticker_id, origin_peer_id, ttl } = this.message;

        // Ignora busca originada por este próprio nó (não propaga/responde a sua própria busca)
        if (origin_peer_id === MEU_NODE_ID) return;

        // Evita loop: ignora se essa query já foi processada
        if (searchState.hasProcessed(query_id)) return;
        searchState.markProcessed(query_id);

        console.log(`[SEARCH] Recebido: busca por ${sticker_id} de ${origin_peer_id} (TTL: ${ttl})`);

        const quantidade = inventory.getQuantidade(sticker_id);

        if (quantidade > 0) {
            // Possuo a figurinha – respondo com SEARCH_HIT de volta por onde veio
            const hitMessage = {
                type: 'SEARCH_HIT',
                message_id: crypto.randomUUID(),
                origin_peer_id: MEU_NODE_ID,
                sender_peer_id: MEU_NODE_ID,
                receiver_peer_id: origin_peer_id,
                query_id: query_id,
                sticker_id: sticker_id
            };
            this.networkContext.sendMessage(this.ws, hitMessage);
            console.log(`[SEARCH_HIT] ${sticker_id} encontrada! Enviando resposta para ${origin_peer_id}.`);
        }
        // SEARCH_MISS é OPCIONAL no protocolo (making.md) e gera tráfego excessivo
        // em redes grandes. Não enviamos MISS para reduzir congestionamento.

        // Repassa a busca para os demais vizinhos se o TTL ainda permite
        if (ttl > 1) {
            const forwardMessage = {
                ...this.message,
                message_id: crypto.randomUUID(),
                sender_peer_id: MEU_NODE_ID,
                ttl: ttl - 1
            };
            this.networkContext.broadcast(forwardMessage, this.ws);
        }
    }


    /**
     * Inicia uma busca por inundação a partir deste nó.
     * @param {string} sticker_id     – ID da figurinha a buscar
     * @param {Object} networkContext – { broadcast }
     * @returns {string} query_id gerado
     */
    static initiate(sticker_id, networkContext) {
        const queryId = crypto.randomUUID();
        searchState.markProcessed(queryId); // Marca para não reprocessar eco

        const searchMessage = {
            type: 'SEARCH',
            message_id: crypto.randomUUID(),
            origin_peer_id: MEU_NODE_ID,
            origin_peer_ip: SearchController._getLocalIp(),
            sender_peer_id: MEU_NODE_ID,
            receiver_peer_id: '',  // Broadcast – destinatário é cada vizinho
            query_id: queryId,
            ttl: SEARCH_TTL,
            sticker_id: sticker_id
        };

        console.log(`[SEARCH] Iniciando busca por ${sticker_id} (Query ID: ${queryId})`);
        networkContext.broadcast(searchMessage);
        return queryId;
    }

    /** Obtém o IP local da máquina (IPv4 não-loopback). Usa MEU_IP do config como fallback. */
    static _getLocalIp() {
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) return net.address;
            }
        }
        return MEU_IP || '127.0.0.1'; // Fallback configurado em config.js
    }
}

module.exports = SearchController;
