const EthCrypto = require('eth-crypto');

export const getPrivateKey = async function (account) {
    let keys = window.localStorage.getItem("keys");
    if (keys) {
        if ((account in keys) === false) {
            let obj = await EthCrypto.createIdentity();
            keys[account] = {
                "public": obj.publicKey,
                "private": obj.privateKey
            };
            window.localStorage.setItem("keys", keys);
        }
    } else {
        let obj = await EthCrypto.createIdentity();
        let keys = {
            account: {
                "public": obj.publicKey,
                "private": obj.privateKey
            }
        };
        window.localStorage.setItem("keys", keys);
    }
    return keys[account].private;
}

export const getPublicKey = async function (account) {
    let keys = window.localStorage.getItem("keys");
    console.log(keys);
    if (keys) {
        if ((account in keys) === false) {
            let obj = await EthCrypto.createIdentity();
            keys[account] = {
                "public": obj.publicKey,
                "private": obj.privateKey
            };
            window.localStorage.setItem("keys", keys);
        }
    } else {
        let obj = await EthCrypto.createIdentity();
        let keys = {
            account: {
                "public": obj.publicKey,
                "private": obj.privateKey
            }
        };
        window.localStorage.setItem("keys", keys);
    }
    return keys[account].private;
}

export const get_secret = async function (b_pub_key,secret_item_string) {
    const encrypted_message = await EthCrypto.encryptWithPublicKey(
        b_pub_key, // publicKey
        secret_item_string // message
    );
    //convert the cypher text to string off chain
    let secret_cipher_string = await EthCrypto.cipher.stringify(encrypted_message);
    return secret_cipher_string;
}