const { JsonRpc, Api } = require('eosjs')

const fetch = require('node-fetch')
const util = require('util')
const zlib = require('zlib')

const textEncoder = new util.TextEncoder()
const textDecoder = new util.TextDecoder()

const rpc = new JsonRpc('https://eos.greymass.com', {
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

async function main() {
    // An encoded eosio:voteproducer transaction
    const uri = 'esr://gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA'

    // Decode the URI
    const decoded = SigningRequest.from(uri, opts)

    // In order to resolve the transaction, we need a recent block to form it into a signable transaction
    const head = (await rpc.get_info(true)).head_block_num;
    const block = await rpc.get_block(head);

    // Fetch the ABIs needed for decoding
    const abis = await decoded.fetchAbis();

    // An authorization to resolve the transaction to
    const authorization = {
        actor: 'teamgreymass',
        permission: 'active',
    }

    // Resolve the transaction as a specific user
    const resolved = await decoded.resolve(abis, authorization, block);

    console.log(util.inspect(resolved, false, null, true))
}

main().catch(console.error)
