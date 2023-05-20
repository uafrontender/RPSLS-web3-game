import { useState, useEffect } from 'react'
import * as gameContract from './contracts/RPS.json'
import {
  Address,
  Hash,
  TransactionReceipt,
  isAddress,
  stringify,
  hashMessage
} from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, 
  useWalletClient, 
  useWaitForTransaction,
  useSignMessage
} from 'wagmi'

export function App() {
  const { address } = useAccount()
  const { data: walletClient, isError, isLoading } = useWalletClient()

  const [RPSHash, setRPSHash] = useState<Hash | undefined>(undefined)
  const [RPSLoading, setRPSLoading] = useState(false)
  const [OpponentAddress, setOpponentAddress] = useState<Address | undefined>(undefined)
  const [salt, setSalt] = useState<Hash | undefined>(undefined)
  const [move, setMove] = useState(0)
  const { data: RPSSignedMsg, signMessage } = useSignMessage({
    message: "I'm signing this message to prove I own this address",
  })
  const { data: RPSReceipt } = useWaitForTransaction({
    hash: RPSHash,
  })

  type moveKey = keyof typeof moves

  //enum Move {Null, Rock, Paper, Scissors, Spock, Lizard}
  const moves = {
    'Rock': 1,
    'Paper': 2,
    'Scissors': 3,
    'Spock': 4,
    'Lizard': 5
  }

  useEffect(() => {
    console.log(RPSHash, RPSReceipt)
    if(RPSHash && !RPSReceipt) setRPSLoading(true)
    else setRPSLoading(false)
  }, [RPSHash, RPSReceipt])

  useEffect(() => {
    let salt = hashMessage(`0x${move.toString() + RPSSignedMsg}`)
    console.log(RPSSignedMsg, ',', salt)
    if(RPSSignedMsg) setSalt(salt)
  }, [RPSSignedMsg])

  useEffect(() => {
    console.log(move)
  }, [move])

  const deployRPS = async () => {
    setRPSHash(await walletClient?.deployContract({
      abi: gameContract.abi,
      bytecode: `0x${gameContract.bytecode}`,
      args: ["0x678d1bb458448bd90b595840e2b3a40e45ca72bd1ee9545c8ebf192bbddfb521", address],
    }))
  }

  const createGame = async () => {
    await signMessage()
  }


  return (
    <>
    <h1>Rock Paper Scissors Lizard Spock</h1>
    {address ? (
      <>
        <div>Connected: {address}</div>
        <ConnectButton />
        <select onChange={(e) => setMove(Number(e.target.value))}>
          {Object.keys(moves).map((move, i) => (
            <option key={i} value={moves[move as moveKey]}>{move}</option>
          ))}
        </select>
        <input type="text" onChange={(e) => setOpponentAddress(e.target.value as Address)} placeholder="Enter Opponent Address" />
        <button onClick={() => createGame()}>Sign Move</button>
        {/* <button onClick={() => createGame()}>{ RPSLoading ? 'Loading..' : 'Create Game' }</button> */}
        {RPSReceipt && (
          <>
            <div>Contract Address: {RPSReceipt.contractAddress}</div>
            <div>
              Receipt:{' '}
              <pre>
                <code>{stringify(RPSReceipt, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </> 
    ):(
      <ConnectButton />
    )}
    </>
  )
}
