const { initP2PServer, connectToNeighbor } = require('./network/p2p');

// Pega a porta dos argumentos do terminal (ex: node server.js 5001)
const port = process.env.PORT || 5001;
initP2PServer(port);

// Se passarmos um endereço de um vizinho no terminal, ele conecta (ex: node server.js 5002 ws://localhost:5001)
const neighborAddress = process.argv[3];
if (neighborAddress) {
    console.log(`Conectando ao vizinho inicial em ${neighborAddress}...`);
    connectToNeighbor(neighborAddress);
}