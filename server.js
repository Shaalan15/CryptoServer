const express = require('express')
const bodyParser = require('body-parser')
const expressFormData = require('express-form-data');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express()
const fs = require('fs')
const http =  require('http')
const port = 2000
const DB = "mongodb+srv://admin:Qfwm3772@cluster0.cri1n.mongodb.net/Huawei?retryWrites=true&w=majority";
const SHA256 = require('crypto-js/sha256');
const blockModel = require('./models/blockModel');
const transactionModel=require('./models/transactionModel')

class Block{
    constructor(from, to, amount, previoushash = ''){
        this.index=0;
        this.from=from;
        this.to=to;
        this.timestamp=Date.now();
        this.amount=amount;
        this.previoushash=previoushash;
        this.hash=this.calculateHash();
        this.nonce = 0;
    }
    calculateHash(){
        return SHA256(this.index+this.previoushash+this.timestamp+JSON.stringify(this.amount) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined: " + this.hash)
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty=4;
        this.index = 1;
    }
    createGenesisBlock(){
        const newBlock = new Block("null", "null", 0);
        return newBlock;
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }
    addBlock(newBlock){
        newBlock.index=this.index;
        this.index=this.index+1;
        newBlock.previoushash=this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    isChainValid(){
        for(let i =1; i< this.chain.length; i++){
            const currentBlock=this.chain[i];
            const previousBlock=this.chain[i-1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previoushash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
    getIndex(){
        return this.index;
    }
}


mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => {
    console.log("DB connected successfully");
  });


// Configure app to be able to read body of packets, specifically urlencoded
app.use(express.urlencoded({ extended: false }));
// Configure app to read json data in body
app.use(express.json());
// Configure app to read form data, or files
app.use(expressFormData.parse());
// Allow Cross-Origin Resource Sharing
app.use(cors());

app.get('/', (req,res) => {
    res.json({
        success: true
    })
})
app.get('/list-transactions', (req,res) => {
    transactionModel.find().then(
        (foundTransactions) => {
            res.send(foundTransactions)
        }
    )
})

app.get('/list-blocks', (req,res) => {
    blockModel.find().then(
        (foundBlocks) => {
            res.send(foundBlocks)
        }
    )
})


app.post('/add-transaction', (req,res) => {
    let reqfrom=req.body.from;
    let reqto=req.body.to;
    let reqamount=req.body.amount;
    const formData = {
        "from": reqfrom,
        "to": reqto,
        "amount": reqamount,
    }
    
    const newtransaction = new transactionModel(formData);
    newtransaction
    .save() //  Promise
    .then( //resolved...
        (dbDocument) => {
              res.send(dbDocument);
        }
    )
    .catch( //rejected...
        (error) => {
            res.send(error)
        }
    );

})

app.post('/mine-block',(req,res) => {
    transactionModel.findOne({_id:req.body.id}).then((dbDocument) => {
    let previoushash=yakhicoin.getLatestBlock().hash
    const newblock = new Block(dbDocument.from, dbDocument.to, dbDocument.amount, previoushash);
    yakhicoin.addBlock(newblock);

    const formData = {
        "index": newblock.index,
        "from": newblock.from,
        "to": newblock.to,
        "timestamp":newblock.timestamp,
        "amount": newblock.amount,
        "previoushash": previoushash,
        "hash": newblock.hash,
        "nonce": newblock.nonce,
    }
    const newblockModel = new blockModel(formData);
    newblockModel
    .save() //  Promise
    .then( //resolved...
        (dbDocument) => {
              res.send(dbDocument);
        }
    )
    .catch( //rejected...
        (error) => {
            res.send(error)
        }
    );
    transactionModel.deleteOne({_id:req.body.id})
    })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

let yakhicoin = new Blockchain();
console.log("YakhiCoin is up and running!")

//console.log(yakhicoin);
//console.log("Is it valid?" + yakhicoin.isChainValid());
