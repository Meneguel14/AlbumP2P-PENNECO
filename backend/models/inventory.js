// Estado inicial do nó em memória
let inventory = {
    figurinha_autoral: "FIG-01", // Substitua "01" pelo seu número de chamada
    figurinhas: {
        "FIG-01": 28 // Distribuição inicial obrigatória: 28 cópias lógicas
    }
};

function getQuantidade(figurinhaId) {
    return inventory.figurinhas[figurinhaId] || 0;
}

function adicionarFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    inventory.figurinhas[figurinhaId] = atual + quantidade;
    return true;
}

function removerFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    
    // O sistema deve impedir inventário negativo
    if (atual - quantidade < 0) {
        console.log(`Erro: Saldo insuficiente. A ação geraria inventário negativo para ${figurinhaId}.`);
        return false;
    }
    
    inventory.figurinhas[figurinhaId] = atual - quantidade;
    return true;
}

function getInventario() {
    return inventory;
}

module.exports = {
    getQuantidade,
    adicionarFigurinha,
    removerFigurinha,
    getInventario
};