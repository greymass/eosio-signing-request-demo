const { JsonRpc, Api, Serialize } = require('eosjs')

const fetch = require('node-fetch')
const util = require('util')
const zlib = require('zlib')

const textEncoder = new util.TextEncoder()
const textDecoder = new util.TextDecoder()

const rpc = new JsonRpc('https://jungle.greymass.com', {
    fetch // only needed if running in nodejs, not required in browsers
})

const eos = new Api({
    rpc,
    textDecoder,
    textEncoder,
})

const { SigningRequest } = require("eosio-signing-request")

// options for the signing request
const opts = {
    // string encoder
    textEncoder,
    // string decoder
    textDecoder,
    // zlib string compression (optional, recommended)
    zlib: {
        deflateRaw: (data) => new Uint8Array(zlib.deflateRawSync(Buffer.from(data))),
        inflateRaw: (data) => new Uint8Array(zlib.inflateRawSync(Buffer.from(data))),
    },
    // Customizable ABI Provider used to retrieve contract data
    abiProvider: {
        getAbi: async (account) => (await eos.getAbi(account))
    }
}

function usage() {
    console.log(`
    Create URI from the command line 
    node encode-transaction <actor> <permission>
    ex: node encode-transaction.js eosio active
    `);
}

async function main() {
    if(process.argv.length !== 4) {
        usage()
        return;
    }
    const actor = process.argv[2];
    const permission = process.argv[3];
    const info = await rpc.get_info();
    const head_block = await rpc.get_block(info.last_irreversible_block_num);
    const chainId = info.chain_id;
    // set to an hour from now.
    const expiration = Serialize.timePointSecToDate(Serialize.dateToTimePointSec(head_block.timestamp) + 3600)
    const transaction = {
        expiration,
        ref_block_num: head_block.block_num & 0xffff, // 
        ref_block_prefix: head_block.ref_block_prefix,
        max_net_usage_words: 0,
        delay_sec: 0,
        context_free_actions: [],
        actions:[{
            account: "eosio",
            name: "voteproducer",
            authorization: [{
                actor,
                permission
              }
            ],
            data: {
                voter: actor,
                proxy: "greymassvote",
                producers: []
            }
        }],
        transaction_extensions: [],
        signatures: [],
        context_free_data: []
    };
    console.log(transaction);
    const request = await SigningRequest.create({ transaction, chainId }, opts );
    const uri = request.encode();
    console.log(`\nURI: ${ uri }`)
}

main().catch(console.error)
