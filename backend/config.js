// ============================================================
// config.js - Identificação central do nó na rede P2P
// Altere apenas este arquivo para mudar o ID do aluno.
// ============================================================

const MEU_NODE_ID = process.env.NODE_ID || 'ALUNO-22';      // Seu identificador na rede
const MINHA_FIGURINHA = process.env.NODE_FIGURINHA || 'FIG-22';    // Figurinha autoral (mesma numeração)
const MEU_IP = process.env.NODE_IP || '';       // IP atual da máquina na rede local
const INITIAL_QUANTITY = 28;          // Distribuição inicial obrigatória
const SEARCH_TTL = 7;                 // TTL inicial para buscas por inundação

module.exports = { MEU_NODE_ID, MINHA_FIGURINHA, MEU_IP, INITIAL_QUANTITY, SEARCH_TTL };
