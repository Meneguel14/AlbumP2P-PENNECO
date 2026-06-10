// Estado inicial do nó em memória
// Representa o inventário atual do aluno 
let inventory = {
    figurinha_autoral: "id_da_minha_figurinha",
    figurinhas: {
        "id_da_minha_figurinha": 29 // O upload inicial já entra com o limite de 29 
    }
};

/**
 * Retorna a quantidade disponível de uma figurinha específica.
 */
function getQuantidade(figurinhaId) {
    return inventory.figurinhas[figurinhaId] || 0;
}

/**
 * Adiciona uma figurinha ao inventário, respeitando o limite máximo.
 */
function adicionarFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    
    // Só vai poder ter um número limitado de 29 de cada 
    if (atual + quantidade > 29) {
        console.log(`Erro: Limite de 29 excedido para a figurinha ${figurinhaId}.`);
        return false; 
    }
    
    inventory.figurinhas[figurinhaId] = atual + quantidade;
    return true;
}

/**
 * Remove uma figurinha do inventário após uma troca.
 */
function removerFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    
    // O sistema deve impedir inventário negativo 
    if (atual - quantidade < 0) {
        console.log(`Erro: Saldo insuficiente. A ação geraria inventário negativo para ${figurinhaId}.`);
        return false;
    }
    
    // O sistema controla a quantidade disponível para troca no inventário, 
    // mas a figurinha autoral não precisa ser removida do disco [cite: 23]
    inventory.figurinhas[figurinhaId] = atual - quantidade;
    return true;
}

/**
 * Retorna todo o inventário atual.
 */
function getInventario() {
    return inventory;
}

module.exports = {
    getQuantidade,
    adicionarFigurinha,
    removerFigurinha,
    getInventario
};