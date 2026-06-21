// ============================================================
// p2p.js – Camada de rede WebSocket P2P
// ============================================================
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { handleMessage } = require('../handlers/messageHandler');
const { MEU_NODE_ID, MEU_IP } = require('../config');

const neighbors = [];
const neighborsFile = path.join(__dirname, '../../vizinhos.json');

// ── Persistência de vizinhos ────────────────────────────────

function getSavedNeighbors() {
    if (!fs.existsSync(neighborsFile)) return [];
    try {
        return JSON.parse(fs.readFileSync(neighborsFile, 'utf8'));
    } catch {
        return [];
    }
}

function saveNeighbor(address) {
    // Não salva localhost ou o próprio IP para evitar conexão consigo mesmo
    if (
        address.includes('localhost') || 
        address.includes('127.0.0.1') || 
        address.includes('::1') || 
        (MEU_IP && address.includes(MEU_IP))
    ) {
        return;
    }

    const saved = getSavedNeighbors();
    if (!saved.includes(address)) {
        saved.push(address);
        fs.writeFileSync(neighborsFile, JSON.stringify(saved, null, 2));
        console.log(`[P2P] Novo vizinho salvo: ${address}`);
    }
}

// ── Servidor P2P ─────────────────────────────────────────────

function initP2PServer(port) {
    const server = new WebSocket.Server({ port });

    server.on('connection', (ws, req) => {
        initConnection(ws);

        let ip = req.socket.remoteAddress;
        if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
        saveNeighbor(`ws://${ip}:8080`);

        // Ao receber uma conexão, também nos apresentamos (sem esperar HELLO do outro lado)
        const helloMsg = {
            type: 'HELLO',
            message_id: crypto.randomUUID(),
            sender_peer_id: MEU_NODE_ID,
            peers: getSavedNeighbors()
        };
        sendMessage(ws, helloMsg);
    });

    console.log(`[P2P] Servidor de rede rodando na porta ${port}`);

    // Reconecta aos vizinhos persistidos
    const saved = getSavedNeighbors();
    if (saved.length > 0) {
        console.log(`[P2P] Carregando ${saved.length} vizinho(s) salvos...`);
        saved.forEach(addr => connectToNeighbor(addr));
    }
}

// ── Conexão com vizinhos ──────────────────────────────────────

function connectToNeighbor(peerAddress) {
    const ws = new WebSocket(peerAddress);

    ws.on('open', () => {
        initConnection(ws);
        saveNeighbor(peerAddress);

        // Envia HELLO conforme especificação
        const helloMsg = {
            type: 'HELLO',
            message_id: crypto.randomUUID(),
            sender_peer_id: MEU_NODE_ID,
            peers: getSavedNeighbors()
        };
        sendMessage(ws, helloMsg);
        console.log(`[HELLO] Enviado para ${peerAddress}`);
    });

    ws.on('error', () => {
        console.log(`[Erro P2P] Vizinho não responde: ${peerAddress}`);
    });
}

// ── Gerenciamento de conexões ─────────────────────────────────

function initConnection(ws) {
    neighbors.push(ws);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message, { broadcast, sendMessage });
        } catch (error) {
            console.error('[P2P] Erro ao fazer parse da mensagem:', error);
        }
    });

    ws.on('close', () => {
        const index = neighbors.indexOf(ws);
        if (index !== -1) neighbors.splice(index, 1);
        console.log('[P2P] Vizinho desconectado.');
    });
}

// ── Envio de mensagens ────────────────────────────────────────

/** Envia para todos os vizinhos, exceto o remetente original. */
function broadcast(message, senderWs = null) {
    neighbors.forEach(neighbor => {
        if (neighbor !== senderWs && neighbor.readyState === WebSocket.OPEN) {
            sendMessage(neighbor, message);
        }
    });
}

/** Envia uma mensagem para um vizinho específico. */
function sendMessage(ws, message) {
    ws.send(JSON.stringify(message));
}

module.exports = { initP2PServer, connectToNeighbor, broadcast, sendMessage };