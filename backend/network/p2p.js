const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { handleMessage } = require('../handlers/messageHandler');

const neighbors = [];
// Cria um arquivo vizinhos.json na pasta principal do projeto
const neighborsFile = path.join(__dirname, '../../vizinhos.json'); 

// 1. Função para carregar IPs salvos
function getSavedNeighbors() {
    if (!fs.existsSync(neighborsFile)) return [];
    try {
        return JSON.parse(fs.readFileSync(neighborsFile));
    } catch (e) {
        return [];
    }
}

// 2. Função para salvar novos IPs sem repetir
function saveNeighbor(address) {
    // Ignora localhost para não salvar a si mesmo
    if (address.includes('localhost') || address.includes('127.0.0.1') || address.includes('[::1]')) return;

    const saved = getSavedNeighbors();
    if (!saved.includes(address)) {
        saved.push(address);
        fs.writeFileSync(neighborsFile, JSON.stringify(saved, null, 2));
        console.log(`[P2P] Novo vizinho salvo no JSON: ${address}`);
    }
}

function initP2PServer(port) {
    const server = new WebSocket.Server({ port });
    
    server.on('connection', (ws, req) => {
        initConnection(ws);
        
        // Pega o IP de quem acabou de bater na nossa porta
        let ip = req.socket.remoteAddress;
        
        // Limpa o formato IPv6 (se vier como ::ffff:192.168.1.X)
        if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
        
        // Salva assumindo que o outro nó também roda na 8080
        saveNeighbor(`ws://${ip}:8080`);
    });
    console.log(`[P2P] Servidor rodando na porta ${port}`);
    
    // 3. Tenta reconectar a todo mundo que estava no JSON
    const savedNeighbors = getSavedNeighbors();
    if (savedNeighbors.length > 0) {
        console.log(`[P2P] Carregando ${savedNeighbors.length} vizinho(s) do json...`);
        savedNeighbors.forEach(addr => connectToNeighbor(addr));
    }
}

function connectToNeighbor(peerAddress) {
    const ws = new WebSocket(peerAddress);
    ws.on('open', () => {
        initConnection(ws);
        saveNeighbor(peerAddress); // Salva quem NÓS chamamos
        sendMessage(ws, { type: 'HELLO', payload: { message: 'Novo nó na rede' } });
    });
    ws.on('error', (err) => {
        // Se der erro, ele está offline no momento.
        console.log(`[Erro P2P] Vizinho não responde: ${peerAddress}`);
    });
}

function initConnection(ws) {
    neighbors.push(ws);
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message, { broadcast, sendMessage });
        } catch (error) {
            console.error("Erro ao fazer parse do JSON:", error);
        }
    });

    ws.on('close', () => {
        const index = neighbors.indexOf(ws);
        if (index !== -1) neighbors.splice(index, 1);
        console.log('[P2P] Vizinho desconectado da rede.');
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

module.exports = { initP2PServer, connectToNeighbor, broadcast };