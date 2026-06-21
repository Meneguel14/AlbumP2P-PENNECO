// ============================================================
// inventory.js – Estado em memória do inventário de figurinhas
// ============================================================
const { MINHA_FIGURINHA, INITIAL_QUANTITY } = require('../config');

let inventory = {
    figurinha_autoral: MINHA_FIGURINHA,
    figurinhas: {
        [MINHA_FIGURINHA]: INITIAL_QUANTITY // 28 cópias iniciais obrigatórias
    }
};

/** Retorna a quantidade disponível de uma figurinha. */
function getQuantidade(figurinhaId) {
    return inventory.figurinhas[figurinhaId] || 0;
}

/** Adiciona `quantidade` unidades de uma figurinha ao inventário. */
function adicionarFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    inventory.figurinhas[figurinhaId] = atual + quantidade;
    console.log(`[INVENTÁRIO] +${quantidade} ${figurinhaId} (total: ${inventory.figurinhas[figurinhaId]})`);
    return true;
}

/** Remove `quantidade` unidades de uma figurinha. Impede saldo negativo. */
function removerFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    if (atual - quantidade < 0) {
        console.log(`[INVENTÁRIO] Erro: saldo insuficiente para ${figurinhaId} (atual: ${atual}).`);
        return false;
    }
    inventory.figurinhas[figurinhaId] = atual - quantidade;
    console.log(`[INVENTÁRIO] -${quantidade} ${figurinhaId} (total: ${inventory.figurinhas[figurinhaId]})`);
    return true;
}

/** Retorna o inventário completo. */
function getInventario() {
    return inventory;
}

module.exports = { getQuantidade, adicionarFigurinha, removerFigurinha, getInventario };