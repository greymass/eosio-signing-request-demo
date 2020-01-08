# eosio-signing-request-demo (ESR - Revision 2)

Example code using nodejs to demo out the [eosio-signing-request protocol](https://github.com/greymass/eosio-signing-request).

### Setup

Before running the demos, install the required packages.

#### NPM

```npm install```

#### Yarn

```yarn install```

### Running

The `examples` folder contains all of the various demos to perform different operations on a signing request.

##### Encoding a Signing Request

This example will take a set of actions and encode them into a signing request.

```node examples/encode.js```

##### Decoding a Signing Request

This example will take an encoded signing request (URI string) and decode them into a signing request object.

```node examples/decode.js```

##### Resolving a Signing Request

This example will take an encoded signing request (URI string), decode it, and resolve the transaction for a signature from a specific account.

```node examples/resolve.js```

### Developer Chat

We have a telegram channel dedicated to the development of this protocol which you can find here:

https://t.me/eosio_signing_request
