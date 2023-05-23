import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import * as gameContract from '../contracts/RPS.json'
import {
  Address,
  Hash,
  TransactionReceipt,
  isAddress,
  stringify,
  parseEther
} from 'viem'
import { usePrepareSalt } from '../hooks/usePrepareSalt'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, 
  useWalletClient, 
  useWaitForTransaction
} from 'wagmi'

import { useHash } from '../hooks/useHasher'
import { moves, moveKey } from '../contants'


const CreateGame = () => {
    const navigate = useNavigate()
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [RPSHash, setRPSHash] = useState<Hash | undefined>()
    const [RPSLoading, setRPSLoading] = useState(false)
    const [OpponentAddress, setOpponentAddress] = useState<Address | undefined>()
    const [move, setMove] = useState(1)
    const [bet, setBet] = useState<number>(0)
    
    const { data: RPSReceipt } = useWaitForTransaction({
      hash: RPSHash,
    })

    const [gameAddress, setGameAddress] = useState<Address | undefined>(
      localStorage.getItem('gameAddress') as Address
    )

    const [signMessage, salt] = usePrepareSalt(move, gameAddress)
    const [moveHash, isMoveHashError] = useHash(move, salt)
  
    useEffect(() => {
      if(RPSHash && !RPSReceipt) setRPSLoading(true)
      else setRPSLoading(false)
    }, [RPSHash, RPSReceipt])

    useEffect(() => {
      if(gameAddress) navigate(`/play/${gameAddress}`)
    }, [gameAddress])

    useEffect(() => {
        if(!RPSReceipt) return
        let { contractAddress } = RPSReceipt as TransactionReceipt
        contractAddress = `0x${contractAddress?.substring(2)}`
        if(isAddress(contractAddress)) {
          setGameAddress(contractAddress)
          localStorage.setItem('gameAddress', contractAddress as string)
          navigate(`/play/${contractAddress}`)
        }
    }, [RPSReceipt])
    
    useEffect(() => {
        console.log(salt)
        console.log(moveHash)
    }, [salt])

  
    const deployRPS = async () => {
        // address sanity checks. note: players can play against themselves
        if(!OpponentAddress || !isAddress(OpponentAddress)) {
            alert('Please enter a valid opponent address, opponent address cannot be empty nor the same as your address')
            return
        }
        setRPSHash(
            await walletClient?.deployContract({
            abi: gameContract.abi,
            bytecode: `0x${gameContract.bytecode}`,
            args: [moveHash, OpponentAddress],
            ...{value: parseEther(`${bet}`)} // staked ether
        }))
    }
  
    const createGame = async () => {
        signMessage?.() 
    }
  
    return (
      <>
      <h1>Rock Paper Scissors Lizard Spock</h1>
      {address && (
        <>
            <section className="bg-white dark:bg-zinc-900">
            <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
                <div className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-indigo-700 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800">
                    <span className="text-xs bg-indigo-600 rounded-full text-white px-4 py-1.5 mr-3">New</span> <span className="text-base font-medium">Rock</span> 
                    <svg aria-hidden="true" className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </div>
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-zinc-900 md:text-5xl lg:text-6xl dark:text-white">We invest in the world’s potential</h1>
                <p className="mb-8 text-lg font-normal text-zinc-500 lg:text-xl sm:px-16 lg:px-48 dark:text-zinc-200">Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.</p>
                <form className="w-full max-w-md mx-auto">   
                <label htmlFor="default-email" className="mb-2 text-sm font-medium text-zinc-900 sr-only dark:text-white">Email sign-up</label>
                {/* <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    </div>
                    <input type="email" id="default-email" className="block w-full p-4 pl-10 text-sm text-zinc-900 border border-zinc-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Enter your email here..." required />
                    <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Sign up</button>
                </div> */}
                </form>

                <div className='flex max-w-2xl mx-auto mt-8 mb-8'>
                <ol className="flex items-center w-full p-3 space-x-2 text-sm font-medium text-center text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm dark:text-zinc-400 sm:text-base dark:bg-zinc-800 dark:border-zinc-700 sm:p-4 sm:space-x-4">
                <li className="flex items-center text-indigo-600 dark:text-indigo-500">
                    <span className="flex items-center justify-center w-5 h-5 mr-2 text-xs border border-indigo-600 rounded-full shrink-0 dark:border-indigo-500">
                    1
                    </span>
                    Game Info
                    <svg aria-hidden="true" className="w-4 h-4 ml-2 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </li>
                <li className="flex items-center">
                    <span className="flex items-center justify-center w-5 h-5 mr-2 text-xs border border-zinc-500 rounded-full shrink-0 dark:border-zinc-400">
                    2
                    </span>
                    Sign Your Move
                    <svg aria-hidden="true" className="w-4 h-4 ml-2 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </li>
            <li className="flex items-center text-blue-600 dark:text-blue-500 space-x-2.5">
            <span className="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500">
                1
            </span>
            <span>
                <h3 className="font-medium leading-tight">User info</h3>
                <p className="text-sm">Step details here</p>
            </span>
            </li>

                <li className="flex items-center">
                    <span className="flex items-center justify-center w-5 h-5 mr-2 text-xs border border-zinc-500 rounded-full shrink-0 dark:border-zinc-400">
                    3
                    </span>
                    Start Game
                </li>
                </ol>
                </div>


                <div>Connected: {address}</div>
            {/* <div>{`Account None ${accountNone} and CREATE address is ${CREATEAddress}`}</div> */}
            {gameAddress && (
            <div>Game Address: {gameAddress}</div>
            )}
            <select onChange={(e) => setMove(Number(e.target.value))}>
              {Object.keys(moves).map((move, i) => (
              <option key={i} value={moves[move as moveKey]}>{move}</option>
              ))}
            </select>
            <input type="text" onChange={(e) => setOpponentAddress(e.target.value as Address)} placeholder="Enter Opponent Address" />
            <input type="text" onChange={(e) => setBet(Number(e.target.value))} placeholder="Enter Bet" />

            <button onClick={() => createGame()}>Sign Move</button>
            <button disabled={!salt} onClick={() => deployRPS()}>{ RPSLoading ? 'Loading..' : 'Create Game' }</button>
            {RPSReceipt && (
              <>
              <div>Game Created!</div>
              <div>Share this link with your opponent: <a href={`https://localhost:/play/${gameAddress}`}>{ `https://localhost:/play/${gameAddress}` }</a></div>
              <div>Contract Address: {gameAddress}</div>
              <div>
                Receipt:{' '}
                <pre>
                <code>{stringify(RPSReceipt, null, 2)}</code>
                </pre>
              </div>
              </>
            )}

                {/* <ol className="relative z-10 text-zinc-500 border-l mt-10 border-zinc-200 dark:border-zinc-700 dark:text-zinc-400">                  
                    <li className="mb-10 ml-6">            
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -left-4 ring-4 ring-white dark:ring-zinc-900 dark:bg-green-900">
                        <svg aria-hidden="true" className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <h3 className="font-medium leading-tight">Game Info</h3>
                        <p className="text-sm">Your Opponent Address, move and bet.</p>
                    </li>
                    <li className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-zinc-100 rounded-full -left-4 ring-4 ring-white dark:ring-zinc-900 dark:bg-zinc-700">
                        <svg aria-hidden="true" className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </span>
                        <h3 className="font-medium leading-tight">Sign Your Move</h3>
                        <p className="text-sm">To conceal your move from your opponent.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-zinc-100 rounded-full -left-4 ring-4 ring-white dark:ring-zinc-900 dark:bg-zinc-700">
                        <svg aria-hidden="true" className="w-5 h-5 text-zinc-500 dark:text-zinc-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </span>
                        <h3 className="font-medium leading-tight">Start the game</h3>
                        <p className="text-sm">Deploy this game contract to Goerli Network.</p>
                    </li>
                </ol> */}
            </div>
            </section>
        </> 
      )}
      </>
    )
}

export default CreateGame