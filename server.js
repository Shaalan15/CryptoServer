const express = require('express');
const bodyParser = require('body-parser');
const expressFormData = require('express-form-data');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');
const http = require('http');
const port = 2000;
const DB = "mongodb+srv://admin:Qfwm3772@cluster0.cri1n.mongodb.net/Huawei?retryWrites=true&w=majority";
const SHA256 = require('crypto-js/sha256');
const blockModel = require('./models/blockModel');
const transactionModel = require('./models/transactionModel');
const feeModel = require('./models/feeModel');


class Block {
    constructor(from, to, amount, fee, miner, reward = 1) {
        this.index = 0;
        this.from = from;
        this.to = to;
        this.timestamp = Date.now();
        this.amount = amount;
        this.fee = fee;
        this.reward = reward;
        this.miner = miner;
        this.previoushash = 'null';
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash() {
        return SHA256(this.index + this.previoushash + this.timestamp + JSON.stringify(this.amount) + this.nonce).toString();
    }
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.difficulty = 4;
        this.index = 0;
    }
    createGenesisBlock() {
        const newBlock = new Block("null", "null", 0, 0, "null", 0);
        return newBlock;
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    addBlock(newBlock) {
        newBlock.index = this.index;
        this.index = this.index + 1;
        newBlock.previoushash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previoushash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
    getIndex() {
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

app.get('/', (req, res) => {
    res.send("YAKHICOIN SERVER");
})

app.get('/list-transactions', (req, res) => {
    transactionModel.find().then(
        (foundTransactions) => {
            res.send(foundTransactions);
        }
    )
})

app.get('/list-blocks', (req, res) => {
    blockModel.find().then(
        (foundBlocks) => {
            res.send(foundBlocks);
        }
    )
})

app.post('/add-transaction', (req, res) => {
        blockModel.find({ $or: [{ from: req.body.from }, { to: req.body.from }, { miner: req.body.from }] }).then((blocks) => {
            if (!blocks.length) {
                yakhicoin.addBlock(new Block("system", req.body.from, 1000, 0, "null", 0));
                const newblock = new blockModel(yakhicoin.getLatestBlock());
                newblock.save();
            }
            let balance = 0;
            for (const block of blocks) {
                if (block.from == req.body.from) {balance -= (block.amount + block.fee);}
                if (block.to == req.body.from) {balance += block.amount;}
                if (block.miner == req.body.from) {balance += (block.fee + block.reward);}
            }
            if (req.body.amount <= balance || (!blocks.length && req.body.amount <= 1000)) {
                const formData = {
                    "from": req.body.from,
                    "to": req.body.to,
                    "amount": req.body.amount,
                    "fee": req.body.fee
                }
                const newtransaction = new transactionModel(formData);
                newtransaction
                    .save() //  Promise
                    .then( //resolved...
                        (success) => {
                            res.send({"transaction" : success, "error" : 0});
                        }
                    )
                    .catch( //rejected...
                        (error) => {
                            res.send({"error" : error});
                        }
                    );
            }
            else
                res.json({"error" : 1})
        })
})

app.post('/mine-block', (req, res) => {
    transactionModel.findOne({ _id: req.body.id }).then((transaction) => {
        yakhicoin.addBlock(new Block(transaction.from, transaction.to, transaction.amount, transaction.fee, req.body.address));
        const newblock = new blockModel(yakhicoin.getLatestBlock());
        newblock
            .save() //  Promise
            .then( //resolved...
                (success) => {
                    ///////////////transactionModel.deleteOne({ _id: req.body.id }, () => {}));
                    res.send(success);
                }
            )
            .catch( //rejected...
                (error) => {
                    res.send(error);
                }
            );
    })
})

app.post('/view-address', (req, res) => {
    blockModel.find({ $or: [{ from: req.body.address }, { to: req.body.address }, { miner: req.body.address }] }).then((blocks) => {
        let balance = 0;
        for (const block of blocks) {
            if (block.from == req.body.address) {balance -= (block.amount + block.fee);}
            if (block.to == req.body.address) {balance += block.amount;}
            if (block.miner == req.body.address) {balance += (block.fee + block.reward);}
        }
        res.json({"transactions" : blocks, "balance" : balance});
    })
})

app.get('/reset', (req, res) => {
    mongoose.connection.db.dropCollection("blocks")
    mongoose.connection.db.dropCollection("transactions")
    yakhicoin.chain = [yakhicoin.createGenesisBlock()]
    const newblock = new blockModel(yakhicoin.getLatestBlock());
    newblock.save()
    yakhicoin.index = 1;
    res.send("RESET COMPLETE");
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

let yakhicoin = new Blockchain();
console.log("YakhiCoin is up and running!")

//console.log(yakhicoin);
//console.log("Is it valid?" + yakhicoin.isChainValid());