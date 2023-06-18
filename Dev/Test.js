const Blockchain = require('./Blockchain');
const VioletCoin = new Blockchain();
const previousBlockHash = '87765DA6CCF0668238C1D27C35';
const currentBlockData = [
    {
        amount: 10, 
        sender: 'B4CEE9C0E5CD571',
        recipient: '3A3F6E462D48E9'
    },
    
    {
        amount: 200, 
        sender: 'DJH896775BHJB',
        recipient: 'HG60KNH7845GH'
    },
    
    {
        amount: 600, 
        sender: 'GDSF887BNC887',
        recipient: 'JHGFC564KJ098'
    }
];
//const nonce = VioletCoin.proofOfWork(previousBlockHash, currentBlockData);
//console.log( VioletCoin.hashBlock(previousBlockHash, currentBlockData, nonce) );
console.log(VioletCoin);