const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');

const currentNodeUrl = process.argv[2];

class Blockchain {
        
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = []
        this.createNewBlock(100, '0', '0'); 
    }
        

    createNewBlock = (nonce, previousBlockHash, hash) => {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash,        
        };
        
        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    }

    getLastBlock = () => {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction = (amount, sender, recipient) => {
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionID: uuidv4()
        };
        return newTransaction;
    }

    hashBlock = (previousBlockHash, currentBlockData, nonce) => {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData); 
        const hash = sha256(dataAsString);
        return hash; 
    }

    proofOfWork = (previousBlockHash, currentBlockData) => {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            while(hash.substring(0, 4) !== '0000') {
                nonce++;
                hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            }
        return nonce;
    }

    addTransactionToPendingTransactions = (transactionObj) => {
        this.pendingTransactions.push(transactionObj);
    }

}

module.exports = Blockchain;