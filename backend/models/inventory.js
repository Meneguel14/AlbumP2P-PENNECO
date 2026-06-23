// ============================================================
// inventory.js – Inventário persistido em arquivo JSON
// O arquivo é lido na inicialização e gravado após cada alteração.
// Nome do arquivo inclui o ID do nó para evitar conflitos ao
// rodar múltiplos nós de teste na mesma máquina.
// ============================================================
const fs   = require('fs');
const path = require('path');
const { MEU_NODE_ID, MINHA_FIGURINHA, INITIAL_QUANTITY } = require('../config');

const inventoryFile = path.join(__dirname, `../../inventario_${MEU_NODE_ID}.json`);

// ── Carrega do disco (ou cria o estado inicial) ──────────────

function carregarInventario() {
    if (fs.existsSync(inventoryFile)) {
        try {
            const dados = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
            console.log(`[INVENTÁRIO] Carregado de ${inventoryFile}`);
            return dados;
        } catch (e) {
            console.error('[INVENTÁRIO] Arquivo corrompido – carregando inventário padrão.');
        }
    }
    console.log('[INVENTÁRIO] Nenhum arquivo salvo encontrado – criando inventário inicial.');
    return {
        figurinha_autoral: MINHA_FIGURINHA,
        figurinhas: {
            [MINHA_FIGURINHA]: INITIAL_QUANTITY // 28 cópias iniciais obrigatórias
        }
    };
}

// ── Salva no disco ───────────────────────────────────────────

function salvarInventario() {
    try {
        fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2), 'utf8');
    } catch (e) {
        console.error('[INVENTÁRIO] Erro ao salvar inventário:', e.message);
    }
}

// ── Estado em memória (carregado do arquivo ao iniciar) ──────

let inventory = carregarInventario();

// ── API pública ──────────────────────────────────────────────

/** Retorna a quantidade disponível de uma figurinha. */
function getQuantidade(figurinhaId) {
    return inventory.figurinhas[figurinhaId] || 0;
}

/** Adiciona `quantidade` unidades de uma figurinha ao inventário e persiste. */
function adicionarFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    inventory.figurinhas[figurinhaId] = atual + quantidade;
    console.log(`[INVENTÁRIO] +${quantidade} ${figurinhaId} (total: ${inventory.figurinhas[figurinhaId]})`);
    salvarInventario();
    return true;
}

/** Remove `quantidade` unidades de uma figurinha. Impede saldo negativo. Persiste em caso de sucesso. */
function removerFigurinha(figurinhaId, quantidade = 1) {
    const atual = getQuantidade(figurinhaId);
    if (atual - quantidade < 0) {
        console.log(`[INVENTÁRIO] Erro: saldo insuficiente para ${figurinhaId} (atual: ${atual}).`);
        return false;
    }
    inventory.figurinhas[figurinhaId] = atual - quantidade;
    console.log(`[INVENTÁRIO] -${quantidade} ${figurinhaId} (total: ${inventory.figurinhas[figurinhaId]})`);
    salvarInventario();
    return true;
}

/** Retorna o inventário completo. */
function getInventario() {
    return inventory;
}

module.exports = { getQuantidade, adicionarFigurinha, removerFigurinha, getInventario };