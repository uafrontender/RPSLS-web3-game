import { useContractRead } from 'wagmi'
import * as hasherContract from '../contracts/Hasher.json'
import { Address, Hash } from 'viem'

export const useHash = (move: number, salt: bigint) => {
    const { data: hash, isError } = useContractRead({
        address: hasherContract.address as Address,
        abi: hasherContract.abi,
        functionName: 'hash',
        args: [move, salt],
        chainId: 5 // Goerli
    })
    
    return [hash as Hash, isError]
}