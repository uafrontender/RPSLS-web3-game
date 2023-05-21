import { useContractRead, 
    useContractReads, 
    useContractWrite, 
    usePrepareContractWrite,
    useWaitForTransaction
} from 'wagmi'
import * as gameContract from '../contracts/RPS.json'
import { Address, AbiItem, parseGwei, parseEther } from 'viem'
import { useAccount } from 'wagmi'

const RPSContract = {
    address: localStorage.getItem('gameAddress') as Address,
    abi: gameContract.abi as AbiItem[],
}

export const useMoveTimeout = () => {
    const { data: moveTimeout } = useContractRead({
        ...RPSContract,
        functionName: 'TIMEOUT' as any
    })
    return moveTimeout
}

export const useGameData = () => { 
    const { data, isFetched } = useContractReads({
        contracts: [
            {
                ...RPSContract,
                functionName: 'j1'
            },
            {
                ...RPSContract,
                functionName: 'j2'
            },
            {
                ...RPSContract,
                functionName: 'stake'
            },
            {
                ...RPSContract,
                functionName: 'c2'
            }

        ]
    })

    if(!isFetched) return [undefined, undefined, 0, 0]

    const player1 = data![0].result as Address
    const player2 = data![1].result as Address
    const stake = Number(data![2].result)/1e18
    const player2Move = data![3].result as number
    
    return [player1, player2, stake, player2Move]
}

export const useMoveCountdown = () => {
    const { data, isFetched } = useContractReads({
        contracts: [
            {
                ...RPSContract,
                functionName: 'TIMEOUT'
            },
            {
                ...RPSContract,
                functionName: 'lastAction'
            },

        ]
    })

    if(!isFetched) return [0, 0]

    const timeout = data ? data[0].result : 0
    const lastAction = data ? data[1].result : 0

    return [Number(timeout), Number(lastAction)]
}

export const usePlay = (move: number, bet: number):[(config?: any | undefined) => void, Boolean, Boolean, Boolean] => {
    const { config, isError } = usePrepareContractWrite({
        ...RPSContract,
        functionName: 'play' as any,
        args: [2],
        value: parseEther(`${bet}`) as any
    })
    
    const { data, write } = useContractWrite(config as any)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    
    return [write, isLoading, isSuccess, isError]
}

export const useSolve = (move: number, salt: string):[(config?: any | undefined) => void, Boolean, Boolean, Boolean] => {
    const { config, isError } = usePrepareContractWrite({
        ...RPSContract,
        functionName: 'solve' as any,
        args: [move, salt]
    })
    
    const { data, write } = useContractWrite(config as any)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    
    return [write, isLoading, isSuccess, isError]
}