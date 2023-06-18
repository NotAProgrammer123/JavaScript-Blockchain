const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');

const VioletCoin = new Blockchain();
const app = express();
const port = process.argv[2].replace("http://localhost:", "");


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    
    app.get('/', (req, res) => {
        res.send('Hello World');
    });

    app.get('/blockchain', (req, res) => {
        res.send(VioletCoin);
        
    });

    app.get('/mine', (req, res) => {
      const lastBlock = VioletCoin.getLastBlock();
      const previousBlockHash = lastBlock['hash'];
      
      const currentBlockData = {
          transactions: VioletCoin.pendingTransactions,
          index: lastBlock.index + 1
      };

      app.post('/transaction/broadcast', (req, res) => {
        const newTransaction = VioletCoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
        VioletCoin.addTransactionToPendingTransactions(newTransaction);
        const requestPromises = [];
            VioletCoin.networkNodes.forEach(networkNodeUrl => {
                const requestOptions = {
                    uri: networkNodeUrl + '/transaction',
                    method: 'POST',
                    body: newTransaction,
                    json: true
                };
                requestPromises.push( rp(requestOptions) );
          });

          Promise.all(requestPromises).then(data => {
              res.json({note: 'Transaction created and broadcast successfully'});
        });
      });

      app.post('/transaction', (req, res) => {
        const newTransaction = req.body;
        VioletCoin.addTransactionToPendingTransactions(newTransaction);
        const blockIndex = VioletCoin.chain.length + 1;
        res.json({note: `Transaction will be added in block ${blockIndex}`});
      });

   app.post('/register-and-broadcast-node', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;
        const notCurrentNode = VioletCoin.currentNodeUrl !== newNodeUrl;
        const NodeIsNotInNetwork = VioletCoin.networkNodes.indexOf(newNodeUrl) == -1;

        
        if(NodeIsNotInNetwork && notCurrentNode) {
            VioletCoin.networkNodes.push(newNodeUrl);
        };  
        
        const regNodesPromises = [];

        VioletCoin.networkNodes.forEach(networkNodeUrl => {
            
            const requestOptions = {
                uri: networkNodeUrl + '/register-node',
                method: 'POST',
                body: {newNodeUrl: newNodeUrl},
                json: true
            };

            regNodesPromises.push( rp(requestOptions) );
        });

   
        
        Promise.all(regNodesPromises).then(data => {
           res.json({note: 'Node registered and broadcasted to network succesfully'});
        }).catch(
            res.json({note: 'Error'})
        )
       

    });

   app.post('/register-node', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;
        const NodeIsNotInNetwork = VioletCoin.networkNodes.indexOf(newNodeUrl) == -1;
        const notCurrentNode = VioletCoin.currentNodeUrl !== newNodeUrl;

        if (NodeIsNotInNetwork && notCurrentNode) {
            VioletCoin.networkNodes.push(newNodeUrl);
        };
   });

   app.post('/register-nodes-bulk', (req, res) => {
       
            const allNetworkNodes = req.body.allNetworkNodes;
            
            allNetworkNodes.forEach(networkNodeUrl => {
                
                const NodeIsNotInNetwork = VioletCoin.networkNodes.indexOf(networkNodeUrl) == -1
                const notCurrentNode = VioletCoin.currentNodeUrl !== networkNodeUrl;
                
                if(NodeIsNotInNetwork && notCurrentNode) {
                    VioletCoin.networkNodes.push(networkNodeUrl);
                }; 
        
        });
        
   });
      
      const nonce = VioletCoin.proofOfWork(previousBlockHash, currentBlockData);
      const blockHash = VioletCoin.hashBlock(previousBlockHash, currentBlockData, nonce);
      const nodeAddress = uuidv4();
      VioletCoin.createNewTransaction(12.5, '00', nodeAddress);
      const newBlock = VioletCoin.createNewBlock(nonce, previousBlockHash, blockHash);
      res.json({note: 'New block mined successfully', block: newBlock});
    }); 



app.listen(port, () => console.log(`Listening on Port ${port}`));