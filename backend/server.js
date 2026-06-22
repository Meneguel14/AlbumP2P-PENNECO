const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { initP2PServer, connectToNeighbor, broadcast } = require('./network/p2p');
const inventory = require('./models/inventory');
const searchState = require('./services/searchService');
const notificationService = require('./services/notificationService');
const tradeService = require('./services/tradeService');
const SearchController = require('./controllers/SearchController');
const { MEU_NODE_ID } = require('./config');

const app = express();
app.use(express.json());

// ── Assets estáticos (frontend) ───────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Rota: imagem de figurinha ─────────────────────────────────
// Busca primeiro em AlbumCopa/Images/, depois na raiz AlbumCopa/.
app.get('/api/sticker-image/:sticker_id', (req, res) => {
    const cleanId = req.params.sticker_id.replace(/\.(png|PNG)$/i, '');
    const imagesDir  = path.join(__dirname, '../../Images', `${cleanId}.png`);
    const rootDir    = path.join(__dirname, '../../',       `${cleanId}.png`);
    const imagePath  = fs.existsSync(imagesDir) ? imagesDir : rootDir;
    res.sendFile(imagePath, (err) => {
        if (err) res.status(404).json({ error: 'Imagem não encontrada.' });
    });
});

// ── Rota: inventário ──────────────────────────────────────────
app.get('/api/inventory', (req, res) => {
    res.json(inventory.getInventario());
});

// ── Rota: busca por figurinha (flooding) ──────────────────────
app.post('/api/search', (req, res) => {
    const { sticker_id } = req.body;
    if (!sticker_id) return res.status(400).json({ error: 'sticker_id é obrigatório.' });

    SearchController.initiate(sticker_id, { broadcast });
    res.json({ success: true });
});

// ── Rota: notificações (long polling simples) ─────────────────
app.get('/api/notifications', (req, res) => {
    res.json(notificationService.getNotifications());
});

// ── Rota: propostas de troca pendentes ───────────────────────
app.get('/api/trade/pending', (req, res) => {
    res.json(tradeService.getPendingOffers());
});

// ── Rota: enviar proposta de troca ───────────────────────────
app.post('/api/trade/offer', (req, res) => {
    const { target_peer, offer_sticker_id, want_sticker_id } = req.body;
    if (!target_peer || !offer_sticker_id || !want_sticker_id) {
        return res.status(400).json({ error: 'target_peer, offer_sticker_id e want_sticker_id são obrigatórios.' });
    }

    const offerMsg = {
        type: 'TRADE_OFFER',
        message_id: crypto.randomUUID(),
        origin_peer_id: MEU_NODE_ID,
        sender_peer_id: MEU_NODE_ID,
        receiver_peer_id: target_peer,
        offer_sticker_id: offer_sticker_id,
        want_sticker_id: want_sticker_id
    };

    broadcast(offerMsg);
    notificationService.addNotification(`Proposta enviada para ${target_peer}.`);
    res.json({ success: true });
});

// ── Rota: aceitar proposta ────────────────────────────────────
app.post('/api/trade/accept', (req, res) => {
    const { peer_id } = req.body;
    const success = tradeService.processManualAccept(peer_id, { broadcast });
    res.json({ success });
});

// ── Rota: recusar proposta ────────────────────────────────────
app.post('/api/trade/reject', (req, res) => {
    const { peer_id } = req.body;
    const success = tradeService.processManualReject(peer_id, { broadcast });
    res.json({ success });
});

// ── Inicialização ─────────────────────────────────────────────
const neighborAddress = process.argv[2]; // ex: ws://localhost:8080
const P2P_PORT  = parseInt(process.argv[3]) || 8080;
const HTTP_PORT = parseInt(process.argv[4]) || 3000;

if (neighborAddress && neighborAddress !== 'none') {
    console.log(`[P2P] Conectando ao vizinho inicial: ${neighborAddress}`);
    connectToNeighbor(neighborAddress);
}

initP2PServer(P2P_PORT);

app.listen(HTTP_PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`  Nó: ${MEU_NODE_ID}`);
    console.log(`  [P2P]  Rede ativa na porta : ${P2P_PORT}`);
    console.log(`  [HTTP] Painel web em        : http://localhost:${HTTP_PORT}`);
    console.log(`=============================================================\n`);
});