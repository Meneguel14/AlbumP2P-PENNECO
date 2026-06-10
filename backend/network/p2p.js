const WebSocket = require('ws');
const crypto = require('crypto');

// Estado local do nó 
const neighbors = [];
const processedQueries = new Set(); // Guarda os query_ids para evitar loops 

function initP2PServer(port) {
    const server = new WebSocket.Server({ port });
    
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log(`Servidor P2P rodando na porta ${port}`);
}

function connectToNeighbor(peerAddress) {
    const ws = new WebSocket(peerAddress);
    ws.on('open', () => {
        initConnection(ws);
        // Anuncia a presença assim que conecta 
        sendMessage(ws, { type: 'HELLO', payload: { message: 'Novo nó na rede' } });
    });
}

function initConnection(ws) {
    neighbors.push(ws);
    
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        handleMessage(ws, message);
    });

    ws.on('close', () => {
        neighbors.splice(neighbors.indexOf(ws), 1);
    });
}

function handleMessage(ws, message) {
    switch (message.type) {
        case 'HELLO': // Anuncia a presença de um nó para um vizinho 
            console.log('Vizinho conectado:', message.payload);
            break;
            
        case 'SEARCH': // Busca uma figurinha específica na rede [cite: 11]
            if (processedQueries.has(message.query_id)) {
                // Se já processou, descarta a mensagem [cite: 19]
                console.log(`Mensagem duplicada descartada: ${message.query_id}`);
                return; 
            }
            
            // Registra o identificador [cite: 19]
            processedQueries.add(message.query_id);
            console.log(`Buscando figurinha: ${message.figurinha_id}`);

            // TODO: Verificar o inventário local aqui...

            // Reenvia a consulta aos vizinhos com ttl - 1 [cite: 19]
            if (message.ttl > 1) {
                broadcast({
                    type: 'SEARCH',
                    query_id: message.query_id,
                    figurinha_id: message.figurinha_id,
                    ttl: message.ttl - 1
                }, ws);
            }
            break;
            
        // Adicionaremos TRADE_OFFER, TRADE_ACCEPT, etc., na próxima etapa.
    }
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

function generateQueryId() {
    return crypto.randomUUID();
}

module.exports = { initP2PServer, connectToNeighbor, broadcast, generateQueryId };