// ============================================================
// searchService.js – Estado compartilhado do serviço de busca
//
// Mantém apenas o Set de queries já processadas para evitar
// loops no flooding. A lógica de negócio está no SearchController.
// ============================================================

const processedQueries = new Set();

/** Verifica se uma query_id já foi processada por este nó. */
function hasProcessed(queryId) {
    return processedQueries.has(queryId);
}

/** Marca uma query_id como processada. */
function markProcessed(queryId) {
    processedQueries.add(queryId);
}

/** Limpa o histórico (útil para testes). */
function clearProcessed() {
    processedQueries.clear();
}

module.exports = { hasProcessed, markProcessed, clearProcessed };