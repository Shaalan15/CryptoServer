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
var index = 0;

class Block{
    constructor(from, to, amount, previoushash = ''){
        this.from=from;
        this.to=to;
        this.index=index;
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
        console.log("Block Mined: " + this.hash)
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty=4;
    }
    createGenesisBlock(){
        const newBlock = new Block("null", "null", 0,);
        newBlock.timestamp="1/1/1970";
        newBlock.previoushash="0";
        return newBlock;
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }
    addBlock(newBlock){
        index=index++;
        newBlock.index=index;
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

app.post('/postaction', (req,res) => {

})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

let yakhicoin= new Blockchain();


console.log("Mining Block 1...");
yakhicoin.addBlock(new Block("me","you", 4));

console.log("Mining Block 2...");
yakhicoin.addBlock(new Block("you", "me", 10));

//console.log(yakhicoin);
console.log("IS is valid?" + yakhicoin.isChainValid());

console.log(yakhicoin);
