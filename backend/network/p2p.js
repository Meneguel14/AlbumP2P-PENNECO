const WebSocket = require('ws');
const crypto = require('crypto');
const { handleMessage } = require('../handlers/messageHandler');

const neighbors = [];

function initP2PServer(port) {
    const server = new WebSocket.Server({ port });
    
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log(`[P2P] Servidor rodando na porta ${port}`);
}

function connectToNeighbor(peerAddress) {
    const ws = new WebSocket(peerAddress);
    ws.on('open', () => {
        initConnection(ws);
        sendMessage(ws, { type: 'HELLO', payload: { message: 'Novo nó na rede' } });
    });
    ws.on('error', (err) => console.log(`[Erro P2P] Falha ao conectar em ${peerAddress}`));
}

function initConnection(ws) {
    neighbors.push(ws);
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            // Injeção de dependência rudimentar: passamos as funções de rede para o handler
            handleMessage(ws, message, { broadcast, sendMessage });
        } catch (error) {
            console.error("Erro ao fazer parse do JSON:", error);
        }
    });

    ws.on('close', () => {
        const index = neighbors.indexOf(ws);
        if (index !== -1) neighbors.splice(index, 1);
        console.log('[P2P] Vizinho desconectado.');
    });
}

function broadcast(message, senderWs = null) {
    neighbors.forEach(neighbor => {
        if (neighbor !== senderWs && neighbor.readyState === WebSocket.OPEN) {
            sendMessage(neighbor, message);
        }
    });
}

function sendMessage(ws, message) {
    ws.send(JSON.stringify(message));
}

module.exports = { initP2PServer, connectToNeighbor };