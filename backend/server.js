const express = require('express');
const path = require('path');
const { initP2PServer, connectToNeighbor, broadcast } = require('./network/p2p');
const inventory = require('./models/inventory');
const searchService = require('./services/searchService');
const notificationService = require('./services/notificationService');
const tradeService = require('./services/tradeService');
const messageHandler = require('./handlers/messageHandler');

const app = express();
app.use(express.json());

// Serve os arquivos da pasta frontend de forma estática automaticamente
app.use(express.static(path.join(__dirname, '../frontend')));

// --- ROTAS DA API PARA O FRONTEND ---

// Rota para ler o inventário do nó
app.get('/api/inventory', (req, res) => {
    res.json(inventory.getInventario());
});

// Rota para iniciar uma busca por inundação
app.post('/api/search', (req, res) => {
    const { sticker_id } = req.body;
    if (!sticker_id) return res.status(400).json({ error: "sticker_id é obrigatório" });
    
    searchService.initiateSearch(sticker_id, { broadcast });
    res.json({ success: true });
});

// Rota para obter atualizações em tempo real (Long Polling)
app.get('/api/notifications', (req, res) => {
    res.json(notificationService.getNotifications());
});

app.post('/api/trade/accept', (req, res) => {
    const { peer_id } = req.body;
    tradeService.processManualAccept(peer_id, { broadcast }, searchService.MEU_NODE_ID);
    res.json({ success: true });
});

// Rota para Recusar
app.post('/api/trade/reject', (req, res) => {
    const { peer_id } = req.body;
    tradeService.processManualReject(peer_id, { broadcast }, searchService.MEU_NODE_ID);
    res.json({ success: true });
});

// Rota para enviar uma proposta de troca
app.post('/api/trade/offer', (req, res) => {
    const { target_peer, offered_sticker, wanted_sticker } = req.body;
    
    const tradeOfferMessage = {
        type: "TRADE_OFFER",
        sender_peer_id: searchService.MEU_NODE_ID,
        receiver_peer_id: target_peer,
        offered_sticker: offered_sticker,
        wanted_sticker: wanted_sticker
    };
    
    broadcast(tradeOfferMessage);
    notificationService.addNotification(`Você enviou uma proposta de troca para ${target_peer}`);
    res.json({ success: true });
});

// Parametrizando os argumentos do terminal para permitir múltiplos nós na mesma máquina de teste
const neighborAddress = process.argv[2]; // ex: ws://localhost:8080
const P2P_PORT = parseInt(process.argv[3]) || 8080;
const HTTP_PORT = parseInt(process.argv[4]) || 3000;

if (neighborAddress && neighborAddress !== "none") {
    console.log(`Conectando ao vizinho inicial em ${neighborAddress}...`);
    connectToNeighbor(neighborAddress);
}

// Inicializa a rede P2P
initP2PServer(P2P_PORT);

// Inicializa o servidor Web do Frontend
app.listen(HTTP_PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`[P2P] Servidor de Rede ativo na porta: ${P2P_PORT}`);
    console.log(`[HTTP] Painel Web do Aluno rodando em: http://localhost:${HTTP_PORT}`);
    console.log(`=============================================================\n`);
});