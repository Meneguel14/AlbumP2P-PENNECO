# Álbum P2P – Copa do Mundo

Este é um sistema distribuído P2P (Peer-to-Peer) para troca de figurinhas da Copa do Mundo, desenvolvido utilizando **Node.js**, **WebSockets** (com a biblioteca `ws`) e **Express** para a interface Web.

O sistema permite que múltiplos nós se conectem, publiquem e busquem figurinhas no inventário uns dos outros de forma descentralizada por meio de propagação em inundação (flooding) e realizem propostas de troca de forma totalmente P2P.

---

## 🚀 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
* **Node.js** (versão 18 ou superior recomendada)

---

## 📦 Instalação

1. Abra o terminal na pasta raiz do projeto (`AlbumP2P-PENNECO`).
2. Instale as dependências executando:
   ```bash
   npm install
   ```

---

## 🏃 Como Rodar o Projeto

A inicialização do servidor recebe três argumentos opcionais na linha de comando:
```bash
node backend/server.js <vizinho_inicial> <porta_p2p> <porta_http>
```
* `<vizinho_inicial>`: Endereço WebSocket de um nó ativo na rede para se conectar (use `none` se este for o primeiro nó).
* `<porta_p2p>`: Porta onde este nó escutará conexões P2P (padrão: `8080`).
* `<porta_http>`: Porta para o painel web frontend (padrão: `3000`).

### 1. Rodando um Nó Único (Principal)

Para iniciar o seu primeiro nó local (com ID e figurinha autoral definidos em `backend/config.js`):
```bash
node backend/server.js none 8080 3000
```
Acesse o painel web em: [http://localhost:3000](http://localhost:3000)

---

## 👥 Como Simular uma Rede P2P Localmente (Vários Nós)

Para validar a troca de mensagens, buscas por inundação e propostas de troca, você pode rodar múltiplos nós na mesma máquina utilizando portas e IDs diferentes.

### Passo 1: Iniciar o Nó A (ALUNO-22)
```bash
node backend/server.js none 8080 3000
```
* **ID do Nó:** `ALUNO-22` (Configuração padrão de `config.js`)
* **Porta P2P:** `8080`
* **Porta HTTP (Web):** `3000`

### Passo 2: Iniciar o Nó B (ALUNO-99) em outro terminal
Para evitar conflito de IDs e portas, use variáveis de ambiente temporárias no terminal para iniciar o segundo nó:

**No Windows (PowerShell):**
```powershell
$env:NODE_ID="ALUNO-99"; $env:NODE_FIGURINHA="FIG-99"; node backend/server.js ws://localhost:8080 8081 3001
```

**No Linux / macOS (Bash):**
```bash
NODE_ID="ALUNO-99" NODE_FIGURINHA="FIG-99" node backend/server.js ws://localhost:8080 8081 3001
```

* **ID do Nó:** `ALUNO-99`
* **Porta P2P:** `8081`
* **Porta HTTP (Web):** `3001`
* **Vizinho Conectado:** Conecta automaticamente ao Nó A em `ws://localhost:8080`

---

## 🧪 Como Testar no Navegador (Localhost)

Com os dois nós rodando (Nó A na porta 3000 e Nó B na porta 3001):

1. **Acessar as interfaces:**
   * Abra o painel do Nó A em [http://localhost:3000](http://localhost:3000)
   * Abra o painel do Nó B em [http://localhost:3001](http://localhost:3001)

2. **Verificar Conexão (HELLO):**
   * Nos consoles dos terminais você deverá ver a troca de mensagens `HELLO` ocorrendo instantaneamente ao conectar o Nó B.
   * Exemplo: `[HELLO] Nó ALUNO-99 se apresentou.` no console do Nó A.

3. **Fazer uma Busca (SEARCH):**
   * No painel do **Nó A** (porta 3000), vá para a aba **Trocas**.
   * Insira o código da figurinha pertencente ao Nó B (`FIG-99`) e clique em **Buscar**.
   * O Nó A enviará uma busca por inundação na rede. O Nó B receberá a busca, identificará que possui a figurinha em seu inventário e responderá com um `SEARCH_HIT`.
   * A resposta de que a figurinha foi encontrada no nó `ALUNO-99` aparecerá no log de atividades do Nó A.

4. **Propor e Realizar uma Troca (TRADE):**
   * No painel do **Nó A**, preencha a proposta informando:
     * **ID do Nó de Destino:** `ALUNO-99`
     * **Figurinha que Oferece:** `FIG-22` (figurinha do Nó A)
     * **Figurinha que Deseja:** `FIG-99` (figurinha do Nó B)
     * Clique em **Enviar Proposta de Troca**.
   * No painel do **Nó B** (porta 3001), vá para a aba **Trocas**.
   * Você verá a proposta recebida de `ALUNO-22` na lista de **Propostas Pendentes**.
   * Clique em **Aceitar**.
   * Isso enviará uma confirmação de aceitação (`TRADE_ACCEPT`) seguida pela confirmação de transferência (`TRANSFER_CONFIRM`), atualizando automaticamente os inventários de ambos os nós.
   * Acesse a aba **Inventário** em ambos os painéis para verificar a atualização de saldo das figurinhas.

---

## 🌐 Como Conectar com Outros Computadores (Rede Física ou Radmin VPN)

O projeto está preparado para rodar em computadores diferentes conectados na mesma rede local física (como a WiFi da faculdade) ou em uma rede local virtual (como o **Radmin VPN**).

### Passo 1: Configurar seus dados no arquivo `config.js`
Cada integrante ou grupo deve configurar sua identificação única, sua figurinha autoral e o seu respectivo endereço IP no arquivo [config.js](file:///c:/Users/Pedro/Desktop/Tr/SD/AlbumCopa/AlbumP2P-PENNECO/backend/config.js):

1. **IP na rede:** Descubra o IP que a sua máquina possui na rede (seja o IP da faculdade obtido via `ipconfig` ou o IP virtual exibido no painel do Radmin VPN, por exemplo: `26.57.185.95`).
2. **Identificação e Figurinha:** Altere os campos de identificação para corresponder aos dados atribuídos ao seu grupo (ex: ID do aluno e figurinha autoral).

Exemplo de configuração no arquivo:
```javascript
const MEU_NODE_ID = 'ALUNO-XX';      // Seu identificador único (ex: ALUNO-17 no computador do amigo)
const MINHA_FIGURINHA = 'FIG-XX';    // Sua figurinha autoral (ex: FIG-17 no computador do amigo)
const MEU_IP = '26.57.185.95';       // Seu IP na rede (Radmin VPN ou rede física local)
```

### Passo 2: Executar o seu nó
No seu terminal, inicie o seu servidor indicando `none` para o primeiro parâmetro para escutar conexões P2P na porta `8080`:
```bash
node backend/server.js none 8080 3000
```

### Passo 3: Seu amigo conecta no seu computador
No computador do seu amigo (que também deve estar na mesma rede do Radmin VPN ou de qualquer lugaar), ele deve rodar o projeto apontando para o **seu endereço IP**:
```bash
node backend/server.js ws://26.57.185.95:8080 8080 3000
```
*(Ao fazer isso, a conexão P2P será estabelecida automaticamente via protocolo `HELLO` e ambos os computadores já poderão buscar e propor trocas de figurinhas).*

---

## 📂 Estrutura do Projeto

* `backend/server.js`: Inicialização do servidor HTTP Express e do servidor P2P WebSocket.
* `backend/config.js`: Parâmetros do nó (como ID do aluno, figurinha autoral, IP e TTL).
* `backend/network/p2p.js`: Gerenciamento das conexões de rede WebSocket e salvamento de novos vizinhos.
* `backend/controllers/`: Módulos controladores individuais para cada protocolo de comunicação (ex: `HelloController.js`, `SearchController.js`, `TradeOfferController.js`, etc.).
* `backend/models/inventory.js`: Gerenciamento local do inventário de figurinhas.
* `frontend/`: Arquivos estáticos da interface web (HTML, CSS e JavaScript).
* `vizinhos.json`: Arquivo de persistência de endereços IP de vizinhos descobertos na rede.
