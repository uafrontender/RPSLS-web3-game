import { 
    useContractReads, 
    useContractWrite, 
    usePrepareContractWrite,
    useWaitForTransaction
} from 'wagmi'
import * as gameContract from '../contracts/RPS.json'
import { Address, AbiItem, parseEther } from 'viem'
import { IAddress, INumber } from '../contants'

const RPSContract = () =>  {
    try {
        return {
            address: localStorage.getItem('rps:gameAddress') as Address,
            abi: gameContract.abi as AbiItem[],
        }
    // fallback for race condition
    } catch (e) {
        return {
            address: localStorage.getItem('rps:gameAddress') as Address,
            abi: gameContract.abi as AbiItem[],
        }
    }
}

export const useGameData = ():[IAddress, IAddress, INumber, INumber, Boolean] => {
    const { data, isFetched } = useContractReads({
        contracts: [
            {
                ...RPSContract(),
                functionName: 'j1'
            },
            {
                ...RPSContract(),
                functionName: 'j2'
            },
            {
                ...RPSContract(),
                functionName: 'stake'
            },
            {
                ...RPSContract(),
                functionName: 'c2'
            }
        ],
        watch: true
    })

    if(!isFetched) return [undefined,undefined,undefined,undefined,false]

    const player1 = data![0].result as IAddress
    const player2 = data![1].result as IAddress
    const stake = Number(data![2].result)/1e18 as INumber
    const player2Move = data![3].result as INumber
    
    return [player1, player2, stake, player2Move, isFetched]
}

export const useMoveCountdown = () => {
    const { data, isFetched } = useContractReads({
        contracts: [
            {
                ...RPSContract(),
                functionName: 'TIMEOUT'
            },
            {
                ...RPSContract(),
                functionName: 'lastAction'
            },

        ],
        watch: true
    })

    if(!isFetched) return [0, 0]

    const timeout = data ? data[0].result : 0
    const lastAction = data ? data[1].result : 0

    return [Number(timeout), Number(lastAction)]
}

export const usePlay = (
    move: number, 
    bet: number):[(config?: any | undefined) => void, Boolean, Boolean, Boolean] => {
    
    const { config, isError } = usePrepareContractWrite({
        ...RPSContract(),
        functionName: 'play' as any,
        args: [move],
        value: parseEther(`${bet}`) as any
    })
    
    const { data, write } = useContractWrite(config as any)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    
    return [write, isLoading, isSuccess, isError]
}

export const useSolve = (
    move: number, 
    salt: bigint):[(config?: any | undefined) => void, Boolean, Boolean, Boolean] => {

    const { config, isError } = usePrepareContractWrite({
        ...RPSContract(),
        functionName: 'solve' as any,
        args: [move, salt]
    })

    const { data, write } = useContractWrite(config as any)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    
    return [write, isLoading, isSuccess, isError]
}

export const useJ1Timeout = ():[(config?: any | undefined) => void, Boolean, Boolean] => {
    const { config } = usePrepareContractWrite({
        ...RPSContract(),
        functionName: 'j1Timeout' as any,
        args: []
    })
    const { data, write } = useContractWrite(config as any)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    return [write, isLoading, isSuccess]
}

export const useJ2Timeout = ():[(config?: any | undefined) => void, Boolean, Boolean] => {    
    const { config } = usePrepareContractWrite({
        ...RPSContract(),
        functionName: 'j2Timeout' as any,
        args: []
    })
    const { data, write } = useContractWrite(config as any)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })
    return [write, isLoading, isSuccess]
}

