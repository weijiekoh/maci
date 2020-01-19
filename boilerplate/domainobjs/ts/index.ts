import {
    Ciphertext,
    Plaintext,
    EcdhSharedKey,
    Signature,
    SnarkBigInt,
    PubKey,
    PrivKey,
    encrypt,
    decrypt,
    sign,
    hash,
    verifySignature,
} from 'maci-crypto'


interface IStateLeaf {
    pubKey: PubKey;
    voteOptionTreeRoot: SnarkBigInt;
    voiceCreditBalance: SnarkBigInt;
    nonce: SnarkBigInt;
}

interface VoteOptionTreeLeaf {
    votes: SnarkBigInt;
}

type Message = Ciphertext

class StateLeaf implements IStateLeaf {
    public pubKey: PubKey
    public voteOptionTreeRoot: SnarkBigInt
    public voiceCreditBalance: SnarkBigInt
    public nonce: SnarkBigInt

    constructor (
        pubKey: PubKey,
        voteOptionTreeRoot: SnarkBigInt,
        voiceCreditBalance: SnarkBigInt,
        nonce: SnarkBigInt,
    ) {
        this.pubKey = pubKey
        this.voteOptionTreeRoot = voteOptionTreeRoot
        this.voiceCreditBalance = voiceCreditBalance
        this.nonce = nonce
    }
}

interface ICommand {
    stateIndex: SnarkBigInt;
    encPubKey: PubKey;
    newPubKey: PubKey;
    voteOptionIndex: SnarkBigInt;
    newVoteWeight: SnarkBigInt;
    nonce: SnarkBigInt;

    sign: (PrivKey) => Signature;
    encrypt: (EcdhSharedKey, Signature) => Ciphertext;
}

class Command implements ICommand {
    public stateIndex: SnarkBigInt
    public encPubKey: PubKey
    public newPubKey: PubKey
    public voteOptionIndex: SnarkBigInt
    public newVoteWeight: SnarkBigInt
    public nonce: SnarkBigInt

    constructor (
        stateIndex: SnarkBigInt,
        encPubKey: PubKey,
        newPubKey: PubKey,
        voteOptionIndex: SnarkBigInt,
        newVoteWeight: SnarkBigInt,
        nonce: SnarkBigInt,
    ) {
        this.stateIndex = stateIndex
        this.encPubKey = encPubKey
        this.newPubKey = newPubKey
        this.voteOptionIndex = voteOptionIndex
        this.newVoteWeight = newVoteWeight
        this.nonce = nonce
    }

    private asArray = () => {

        return [
            this.stateIndex,
            this.encPubKey[0],
            this.encPubKey[1],
            this.newPubKey[0],
            this.newPubKey[1],
            this.voteOptionIndex,
            this.newVoteWeight,
            this.nonce,
        ]
    }

    /*
     * Check whether this command has deep equivalence to another command
     */
    public equals = (command: Command): boolean => {
        return this.stateIndex == command.stateIndex &&
            this.encPubKey[0] == command.encPubKey[0] &&
            this.encPubKey[1] == command.encPubKey[1] &&
            this.newPubKey[0] == command.newPubKey[0] &&
            this.newPubKey[1] == command.newPubKey[1] &&
            this.voteOptionIndex == command.voteOptionIndex &&
            this.newVoteWeight == command.newVoteWeight &&
            this.nonce == command.nonce
    }

    /*
     * Signs this command and returns a Signature.
     */
    public sign = (
        privKey: PrivKey,
    ): Signature => {

        return sign(privKey, hash(this.asArray()))
    }

    /*
     * Returns true if the given signature is a correct signature of this
     * command and signed by the private key associated with the given public
     * key.
     */
    public verifySignature = (
        signature: Signature,
        pubKey: PubKey,
    ): boolean => {

        return verifySignature(
            hash(this.asArray()),
            signature,
            pubKey,
        )
    }

    /*
     * Encrypts this command along with a signature to produce a Message.
     */
    public encrypt = (
        sharedKey: EcdhSharedKey,
        signature: Signature,
    ): Message => {

        const plaintext: Plaintext = [
            ...this.asArray(),
            signature.R8[0],
            signature.R8[1],
            signature.S,
        ]

        const ciphertext: Message = encrypt(plaintext, sharedKey)
        
        return ciphertext
    }

    /*
     * Decrypts a Message to produce a Command.
     */
    public static decrypt = (
        sharedKey: EcdhSharedKey,
        message: Message,
    ): Command => {

        const decrypted = decrypt(message, sharedKey)

        return new Command(
            decrypted[0],
            [decrypted[1], decrypted[2]],
            [decrypted[3], decrypted[4]],
            decrypted[5],
            decrypted[6],
            decrypted[7],
        )
    }
}

export {
    StateLeaf,
    VoteOptionTreeLeaf,
    Command,
    Message,
}