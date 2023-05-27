import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import * as gameContract from '../contracts/RPS.json'
import {
  Address,
  Hash,
  TransactionReceipt,
  isAddress,
  parseEther
} from 'viem'
import { usePrepareSalt } from '../hooks/usePrepareSalt'
import { useAccount, 
  useWalletClient, 
  useWaitForTransaction
} from 'wagmi'

import { useHash } from '../hooks/useHasher'
import { moves, moveKey } from '../constants'
import EthInputGadget from '../components/EthInputGadget'

const phases = {
    1: {   
        title: 'Game Info',
        description: 'Opponent address, your move and a bet.',
    },
    2: {
        title: 'Sign Your Move',
        description: 'To conceal your move from your opponent.',
    },
    3: {
        title: 'Start the game',
        description: 'Deploy this game contract to Goerli Network.',
    },
 } as { [key: number]: { title: string, description: string } }


const CreateGame = () => {
    const navigate = useNavigate()
    const { address } = useAccount()
    const [currentPhase, setCurrentPhase] = useState<number>(1)
    const { data: walletClient } = useWalletClient()
    const [RPSHash, setRPSHash] = useState<Hash | undefined>()
    const [RPSLoading, setRPSLoading] = useState(false)
    const [OpponentAddress, setOpponentAddress] = useState<Address | undefined>()
    const [tempOpponentAddress, setTempOpponentAddress] = useState<string>("")
    const [move, setMove] = useState(1)
    const [bet, setBet] = useState<number>(0)
    const [resetBet, setResetBet] = useState<Boolean>(false)
    const [salt, setSalt] = useState<bigint | undefined>(0n)
    
    const { data: RPSReceipt } = useWaitForTransaction({
      hash: RPSHash,
    })

    const [gameAddress, setGameAddress] = useState<Address | undefined>(
      localStorage.getItem('rps:gameAddress') as Address
    )

    const [signMessage, preparedSalt] = usePrepareSalt(move)
    const [moveHash] = useHash(move, salt!)
  
    const signMove = async () => {
        if(!OpponentAddress || !isAddress(OpponentAddress) || OpponentAddress === address) {
            alert('Please enter a valid opponent address, opponent address cannot be empty!')
            return
        }
        signMessage?.() 
    }
  
    const deployRPS = async () => {
        // address sanity checks.
        setRPSHash(
            await walletClient?.deployContract({
            abi: gameContract.abi,
            bytecode: `0x${gameContract.bytecode}`,
            args: [moveHash, OpponentAddress],
            ...{value: parseEther(`${bet}`)} // staked ether
        }))
    }

    const reset = () => {
        setOpponentAddress(undefined)
        setTempOpponentAddress("")
        setResetBet(true)
        setMove(1)
        setSalt(undefined)
        setCurrentPhase(1)
    }

    useEffect(() => {
        if(RPSHash && !RPSReceipt) setRPSLoading(true)
        else setRPSLoading(false)
      }, [RPSHash, RPSReceipt])

    useEffect(() => {
        if(gameAddress) {
            navigate(`/play/${gameAddress}`)
        } 
    }, [gameAddress])

    useEffect(() => {
        if(!RPSReceipt) return
        let { contractAddress } = RPSReceipt as TransactionReceipt
        contractAddress = `0x${contractAddress?.substring(2)}`

        if(isAddress(contractAddress)) {
            setGameAddress(contractAddress)
            localStorage.setItem('rps:gameAddress', contractAddress as string)
            localStorage.setItem('rps:playerMove', move.toString())
            navigate(`/play/${contractAddress}`)
        }
    }, [RPSReceipt])

    useEffect(() => {
        if(isAddress(OpponentAddress as Address) && bet && salt) setCurrentPhase(3)
        else if(isAddress(OpponentAddress as Address) && bet) setCurrentPhase(2)
        else setCurrentPhase(1)
    }, [OpponentAddress, bet, salt])

    useEffect(() => {
        if(!preparedSalt) return
        setSalt(preparedSalt)
    }, [preparedSalt])

    useEffect(() => {
        setOpponentAddress(tempOpponentAddress as Address)
        setResetBet(false)
    },[tempOpponentAddress, bet])
  
    return (
      <>
      { address ? (
        <section className="bg-white dark:bg-zinc-900">
            <div className="py-8 px-4 mx-auto max-w-screen-xl text-center z-10 relative">
                <h1 className="mb-10 text-4xl font-extrabold tracking-tight leading-none text-zinc-900 md:text-5xl lg:text-6xl dark:text-white">Rock Paper Scissors - Lizard Spock</h1>
                <div className='flex flex-col max-w-5xl mx-auto mt-8 mb-8'>
                    <ol className="flex items-center w-full p-3 px-5 space-x-2 text-sm font-medium text-center text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm dark:text-zinc-400 sm:text-base dark:bg-zinc-800 dark:border-zinc-700 sm:p-4 sm:space-x-4">
                        {
                            Object.keys(phases).map((phase: any, i) => {
                                phase = phases[Number(phase)]
                                
                                return (
                                <li key={i} className={`flex items-center ${i+1 === currentPhase ? 'text-indigo-600 dark:text-indigo-500' : 'text-zinc-500 dark:text-zinc-400'} space-x-2.5`}>
                                    <span className={`flex items-center justify-center w-8 h-8 border ${ i+1 === currentPhase ? 'border-indigo-600' : 'border-zinc-500'} rounded-full shrink-0`}>
                                        {i+1}
                                    </span>
                                    <span>
                                        <h3 className="font-medium leading-tight">{phase.title}</h3>
                                        <p className="text-sm">{phase.description}</p>
                                    </span>
                                    {i !== Object.keys(phases).length - 1 && (
                                        <svg aria-hidden="true" className="w-4 h-4 ml-2 sm:ml-4" fill="none" stroke="gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                    )}
                                </li>
                            )})
                        }
                    </ol>
                    <div className='flex mt-5 justify-center p-10 rounded-lg shadow-sm dark:text-zinc-400 sm:text-base border dark:bg-zinc-800/30 dark:border-zinc-700'>
                        <div className='flex flex-col pr-10 items-center justify-center'>
                            <div className="mb-6 w-full">
                                <label className="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Opponent Address</label>
                                <input value={tempOpponentAddress} disabled={currentPhase > 2} onChange={(e) => setTempOpponentAddress(e.target.value)} className="bg-zinc-50 border disabled:opacity-50 disabled:cursor-not-allowed border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-zinc-700/20 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Address..." required />
                            </div> 
                            <div className="mb-6">
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Your Bet</label>
                                <EthInputGadget resetBet={resetBet} disabled={currentPhase > 2} betCallback={setBet} />
                            </div>
                            <div className='flex'>
                                {currentPhase > 2 &&
                                    <button 
                                        disabled={!salt} 
                                        onClick={() => reset()} 
                                        className="text-white m-4 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                            Reset
                                    </button>
                                }
                                {currentPhase < 3 && 
                                    <button disabled={currentPhase < 2} onClick={() => currentPhase < 2 ? () => {} : signMove()} 
                                    className= { currentPhase < 2 ? 
                                        "disabled:opacity-30 grayscale cursor-not-allowed text-white m-4 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                                        : "text-white m-4 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                                        }>
                                        Sign Move
                                    </button>
                                }
                                {currentPhase === 3 &&
                                    <button 
                                        disabled={!salt} 
                                        onClick={() => deployRPS()} 
                                        className="text-white m-4 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                            { RPSLoading ? 'Creating Game ...' : 'Create Game' }
                                    </button>
                                }
                            </div>
                        </div>
                        <div className='border-l-[1px] h-[200px] my-auto border-zinc-100/10 pl-10'>
                        </div>
                        <div className='flex flex-col justify-center'>
                            <h3 className="text-lg py-4 font-semibold text-zinc-900 dark:text-white">
                                { currentPhase > 2 ? 'Your Move' : 'Select Your Move' }
                            </h3>
                            <ol className="space-y-4 w-56">
                                {Object.keys(moves).map((_move, i) => {
                                    const handPath = (new URL(`../assets/icons/${_move}.svg`, import.meta.url)).toString() as string
                                    
                                    return (
                                    <li key={i} value={moves[_move as moveKey]}>
                                        {i+1 === move ? (
                                            <div className="w-full p-4 text-green-700 border border-green-300 rounded-lg bg-green-50 dark:bg-zinc-800 dark:border-green-800 dark:text-green-400" role="alert">
                                                <div className="flex items-center justify-center gap-4">
                                                    <img width={35} src={handPath} />
                                                    <h3 className="font-medium">{_move}</h3>
                                                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                            {currentPhase > 2 ? (<></>) : (
                                                <div onClick={() => setMove(i+1)} className="p-4 w-full text-zinc-900 bg-zinc-100 border border-zinc-300 rounded-lg dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400 hover:dark:text-indigo-700 hover:dark:border-indigo-700 hover:dark:dark:bg-zinc-800 cursor-pointer" role="alert">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <img width={35} src={handPath} />
                                                        <h3 className="font-medium">{_move}</h3>
                                                    </div>
                                                </div>
                                            )}
                                            </>
                                        )}
                                    </li>
                                )})}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      ) : (
        <div className="flex w-full h-screen -mt-[100px] justify-center items-center">
            <h3 className="z-10 text-3xl text-center">
                {
                    !address ? 'Connect your wallet to start' : 'You are not a player in this game.'
                }
            </h3>
        </div>
        )}
      </>
    )
}

export default CreateGame