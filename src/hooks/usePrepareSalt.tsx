import { useState, useEffect } from "react"
import { Hash, keccak256, hexToBigInt, getContractAddress } from "viem"
import { Address, 
    usePublicClient, 
    useSignMessage, 
    useAccount,
} from "wagmi"
import { moves } from "../contants"

type SignMessageArgs = {
    message: string;
};

export const usePrepareSalt = (move: number, gameAddress?: Address) : [(args?: SignMessageArgs | undefined) => void, bigint | undefined] => {
    const PublicClient = usePublicClient()
    const { address } = useAccount()
    const [accountNone, setAccountNonce] = useState<any>()
    const [CREATEAddress, setCREATEAddress] = useState<Address | undefined>()

    useEffect(() => {
        if(!gameAddress) {
            // contract is not deployed yet, contract address is keccak256[sender, nonce]
            PublicClient.getTransactionCount({ address: address as Address }).then((nonce) => {
                setAccountNonce(nonce)
            })
            
            setCREATEAddress(
                getContractAddress({
                from: address as Address,
                nonce: accountNone,
                })
            )
            console.log('CREATEAddress', CREATEAddress, 'nonce', accountNone)
        }
    }, [])

    const { data: signedMsg, signMessage } = useSignMessage({
        // message: `I'm signing that my hand is [${Object.keys(moves)[move-1]}] for the game ${gameAddress}`,
        message: `I'm signing that my hand is [${Object.keys(moves)[move-1]}] for the game ${gameAddress ? gameAddress : CREATEAddress}`,
    })

    if(!signedMsg) return [signMessage, undefined]
    // salt = unsigned representation of signed message hash
    const signedMsgHash = keccak256(signedMsg as Hash)
    let hashUint = hexToBigInt(signedMsgHash, {
        size: 256,
        signed: false,
    })

    console.log(CREATEAddress)

    return [signMessage, hashUint as bigint | undefined]
}

