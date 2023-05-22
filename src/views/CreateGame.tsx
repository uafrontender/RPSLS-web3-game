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
  isHex,
  hexToBigInt,
  getContractAddress,
  GetBlockTransactionCountParameters
} from 'viem'
import { usePrepareSalt } from '../hooks/usePrepareSalt'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, 
  useWalletClient, 
  useWaitForTransaction,
  useSignMessage,
//   usePublicClient
} from 'wagmi'
import { useHash } from '../hooks/useHasher'
import { moves, moveKey } from '../contants'


const CreateGame = () => {
    const navigate = useNavigate()
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    // const PublicClient = usePublicClient()
    
    const [RPSHash, setRPSHash] = useState<Hash | undefined>()
    const [RPSLoading, setRPSLoading] = useState(false)
    const [OpponentAddress, setOpponentAddress] = useState<Address | undefined>()
    const [move, setMove] = useState(1)
    const [bet, setBet] = useState<number>(0)
    const [salt, setSalt] = useState<bigint>(0n)
    const [moveHash, isMoveHashError] = useHash(move, salt)
    // const [accountNone, setAccountNonce] = useState<any>()
    // const [CREATEAddress, setCREATEAddress] = useState<Address | undefined>()
    
    const { data: RPSReceipt } = useWaitForTransaction({
      hash: RPSHash,
    })

    const [gameAddress, setGameAddress] = useState<Address | undefined>(
      localStorage.getItem('gameAddress') as Address
    )

    const [signMessage, hashUint] = usePrepareSalt(move, gameAddress)

    // const { data: signedMsg, signMessage } = useSignMessage({
    //   message: `I'm signing that my hand is [${Object.keys(moves)[move-1]}] for the game ${CREATEAddress}`,
    // })
  
    useEffect(() => {
      // console.log(RPSHash, RPSReceipt)
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
        console.log(hashUint)
    }, [hashUint])



    // useEffect(() => {
    //   if(!address) return
      
    //   PublicClient.getTransactionCount({ address: address as Address }).then((nonce) => {
    //     setAccountNonce(nonce)
    //   })
      
    //   setCREATEAddress(
    //     getContractAddress({
    //       from: address as Address,
    //       nonce: accountNone,
    //     })
    //   )
    //   console.log('CREATEAddress', CREATEAddress, 'nonce', accountNone)
    // }, [address])

  //   useEffect(() => {
  //     if(signedMsg) {
  //         const signedMsgHash = keccak256(signedMsg)
  //         setSalt(fromHex(signedMsgHash, 'bigint') as any as string)
  //         let moveHash = keccak256(`0x${move + salt}`)
  //         console.log(move, signedMsg, signedMsgHash, salt, moveHash)
  //         // setMoveHash(moveHash)
  //     }
  // }, [signedMsg])

//   useEffect(() => {
//         if(signedMsg) {
//             const signedMsgHash = keccak256(signedMsg as Hash)
//             let hashUint = hexToBigInt(signedMsgHash, {
//                 size: 256,
//                 signed: false,
//             })
//         setSalt(hashUint as any as bigint)
//     }
//   }, [signedMsg])

  // useEffect(() => {
  //   if(moveHash) {
  //   }
  //   if(isMoveHashError) {
  //   }
  // }, [moveHash, isMoveHashError])
  
  
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
    }
  
    const createGame = async () => {
    //   await signMessage()
    }
  
    return (
      <>
      <h1>Rock Paper Scissors Lizard Spock</h1>
      {address ? (
        <>
            <div>Connected: {address}</div>
            {/* <div>{`Account None ${accountNone} and CREATE address is ${CREATEAddress}`}</div> */}
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
        </> 
      ):(
        <ConnectButton />
      )}
      </>
    )
}

export default CreateGame