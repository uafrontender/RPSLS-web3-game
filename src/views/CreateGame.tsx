import { useState, useEffect } from 'react'
import * as gameContract from '../contracts/RPS.json'
import * as HasherContract from '../contracts/Hasher.json'
import { useNavigate } from "react-router-dom"
import {
  Address,
  Hash,
  TransactionReceipt,
  isAddress,
  stringify,
  hashMessage,
  parseEther,
  fromHex,
  keccak256,
} from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, 
  useWalletClient, 
  useWaitForTransaction,
  useSignMessage
} from 'wagmi'

type moveKey = keyof typeof moves
  
//enum Move {Null, Rock, Paper, Scissors, Spock, Lizard}
const moves = {
  'Rock': 1,
  'Paper': 2,
  'Scissors': 3,
  'Spock': 4,
  'Lizard': 5
}


const CreateGame = () => {
    const { address } = useAccount()
    const { data: walletClient, isError, isLoading } = useWalletClient()
    const navigate = useNavigate()
    const [RPSHash, setRPSHash] = useState<Hash | undefined>()
    const [HasherHash, setHasherHash] = useState<Hash | undefined>()
    const [RPSLoading, setRPSLoading] = useState(false)
    const [HasherLoading, setHasherLoading] = useState(false)
    const [OpponentAddress, setOpponentAddress] = useState<Address | undefined>()
    const [moveHash, setMoveHash] = useState<Hash | undefined>()
    const [move, setMove] = useState(1)
    const [bet, setBet] = useState<number>(0)
    const [salt, setSalt] = useState<string>('')

    const { data: signedMsg, signMessage } = useSignMessage({
      message: `I'm signing that my move is [${Object.keys(moves)[move-1]}]`,
    })
    
    const { data: RPSReceipt } = useWaitForTransaction({
      hash: RPSHash,
    })
    const { data: HasherReceipt } = useWaitForTransaction({
      hash: HasherHash,
    })
    const [gameAddress, setGameAddress] = useState<Address | undefined>(
      localStorage.getItem('gameAddress') as Address
    )
    const [hasherAddress, setHasherAddress] = useState<Address | undefined>(
      localStorage.getItem('hasherAddress') as Address
    )
  
    useEffect(() => {
      console.log(RPSHash, RPSReceipt)
      if(RPSHash && !RPSReceipt) setRPSLoading(true)
      else setRPSLoading(false)
    }, [RPSHash, RPSReceipt])

    useEffect(() => {
      if(HasherHash && !HasherReceipt) setHasherLoading(true)
      else setHasherLoading(false)
    }, [HasherHash, HasherReceipt])

    useEffect(() => {
      // if(gameAddress) navigate(`/play/${gameAddress}`)
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
      if(!HasherReceipt) return
      let { contractAddress } = HasherReceipt as TransactionReceipt
      contractAddress = `0x${contractAddress?.substring(2)}`
      if(isAddress(contractAddress)) {
        setHasherAddress(contractAddress)
        localStorage.setItem('hasherAddress', contractAddress as string)
      }
    }, [HasherReceipt])

  //   useEffect(() => {
  //     if(signedMsg) {
  //         const signedMsgHash = keccak256(signedMsg)
  //         setSalt(fromHex(signedMsgHash, 'bigint') as any as string)
  //         let moveHash = keccak256(`0x${move + salt}`)
  //         console.log(move, signedMsg, signedMsgHash, salt, moveHash)
  //         // setMoveHash(moveHash)
  //     }
  // }, [signedMsg])

  useEffect(() => {
    let salt = hashMessage(`0x${move.toString() + signedMsg}`)
    console.log(signedMsg, ',', salt)
    if(signedMsg) setMoveHash(salt)
  }, [signedMsg])
  
  
    useEffect(() => {
      console.log(move)
    }, [move])
  
    const deployRPS = async () => {
      if(!OpponentAddress || !isAddress(OpponentAddress) || OpponentAddress === address) {
        alert('Please enter a valid opponent address, opponent address cannot be empty nor the same as your address')
        return
      }
      setRPSHash(
        await walletClient?.deployContract({
        abi: gameContract.abi,
        bytecode: `0x${gameContract.bytecode}`,
        // args: [moveHash, OpponentAddress],
        args: [moveHash, address],
        ...{value: parseEther(`${bet}`)} // staked ether
      }))
      // waste gas, can be deployed once, and be reused for all games
      setHasherHash(
        await walletClient?.deployContract({
        abi: HasherContract.abi,
        bytecode: `0x${HasherContract.bytecode}`,
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
            {gameAddress && (
            <div>Game Address: {gameAddress}</div>
            )}
            <ConnectButton />
            <select onChange={(e) => setMove(Number(e.target.value))}>
              {Object.keys(moves).map((move, i) => (
              <option key={i} value={moves[move as moveKey]}>{move}</option>
              ))}
            </select>
            <input type="text" onChange={(e) => setOpponentAddress(e.target.value as Address)} placeholder="Enter Opponent Address" />
            <input type="text" onChange={(e) => setBet(Number(e.target.value))} placeholder="Enter Bet" />

            <button onClick={() => createGame()}>Sign Move</button>
            <button onClick={() => deployRPS()}>{ RPSLoading ? 'Loading..' : 'Create Game' }</button>
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
            {HasherReceipt && (
              <>
                <div>Hasher Created!</div>
                <div>Contract Address: {hasherAddress}</div>
                <div>
                  Receipt:{' '}
                  <pre>
                  <code>{stringify(HasherReceipt, null, 2)}</code>
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

export default CreateGame