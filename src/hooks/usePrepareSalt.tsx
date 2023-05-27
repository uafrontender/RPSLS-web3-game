import { useState, useEffect } from "react"
import { Hash, keccak256, hexToBigInt, getContractAddress, getAddress } from "viem"
import { Address, 
    usePublicClient, 
    useSignMessage, 
    useAccount,
} from "wagmi"
import { moves } from "../constants"

type SignMessageArgs = {
    message: string;
};

export const usePrepareSalt = (move: number, gameAddress?: Address) : [(args?: SignMessageArgs | undefined) => void, bigint] => {
    const PublicClient = usePublicClient()
    const { address } = useAccount()
    const [CREATEAddress, setCREATEAddress] = useState<Address | undefined>()

    useEffect(() => {
        if(!gameAddress && address) {
            // contract is not deployed yet, contract address is keccak256[sender, nonce]
            PublicClient.getTransactionCount({ address: address as Address }).then((nonce) => {
                setCREATEAddress(
                    getContractAddress({
                        from: address as Address,
                        nonce: BigInt(nonce),
                    })
                )
            })
        }
    }, [address])

    const { data: signedMsg, signMessage } = useSignMessage({
        // signed message of "checksummed" game address and player move
        message: `I'm signing that my hand is [${Object.keys(moves)[move-1]}] for the game ${gameAddress ? getAddress(gameAddress) : CREATEAddress}`,
    })

    if(!signedMsg) return [signMessage, 0n]
    // salt = unsigned representation of signed message hash
    const signedMsgHash = keccak256(signedMsg as Hash)
    let hashUint: bigint = hexToBigInt(signedMsgHash, {
        size: 256,
        signed: false,
    })

    return [signMessage, hashUint]
}

