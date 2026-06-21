// ============================================================
// HelloController.js
// Protocolo HELLO – Processa apresentação de um vizinho.
//
// Cada lado ENVIA seu próprio HELLO ao estabelecer a conexão
// (iniciador em connectToNeighbor, receptor em server.on('connection')).
// Portanto, ao RECEBER um HELLO, apenas registramos — sem responder,
// pois isso causaria um loop infinito.
// ============================================================
const notificationService = require('../services/notificationService');

class HelloController {
    /**
     * @param {WebSocket} ws             – Conexão de onde veio a mensagem
     * @param {Object}    message        – Mensagem HELLO recebida
     * @param {Object}    networkContext – { broadcast, sendMessage }
     */
    constructor(ws, message, networkContext) {
        this.ws = ws;
        this.message = message;
        this.networkContext = networkContext;
    }

    handle() {
        const sender = this.message.sender_peer_id || 'desconhecido';
        const peers  = this.message.peers || [];

        console.log(`[HELLO] Nó ${sender} se apresentou. Peers conhecidos por ele: ${peers.length}`);
        notificationService.addNotification(`Vizinho ${sender} conectou na rede.`);

        // Se o vizinho nos enviou peers conhecidos, podemos usá-los futuramente
        // para expandir a rede (feature de descoberta avançada).
        // NÃO respondemos aqui — evita loop infinito.
    }
}

module.exports = HelloController;
