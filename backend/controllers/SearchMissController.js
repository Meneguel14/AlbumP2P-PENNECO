// ============================================================
// SearchMissController.js
// Protocolo SEARCH_MISS – Resposta negativa a uma busca.
// (Opcional conforme especificação – apenas loga a ocorrência.)
// ============================================================

class SearchMissController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem SEARCH_MISS recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const { origin_peer_id, sticker_id } = this.message;
        console.log(`[SEARCH_MISS] Nó ${origin_peer_id} não possui ${sticker_id}.`);
        // Não há ação obrigatória – resposta negativa é informativa.
    }
}

module.exports = SearchMissController;
