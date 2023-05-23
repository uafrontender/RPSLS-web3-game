import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMoveCountdown, useGameData, usePlay, useSolve } from "../hooks/useRPS"
import { formatTime } from "../utils/formatTime"
import { Hash, isAddress, fromHex, keccak256 } from "viem"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useSignMessage, usePublicClient, Address } from "wagmi"
import { hexToBigInt } from "viem"
import { usePrepareSalt } from "../hooks/usePrepareSalt"

import { useHash } from '../hooks/useHasher'
import { moves, moveKey } from '../contants'

const PlayGame = () => {
    const navigate = useNavigate()
    const { address } = useAccount()
    const { gameAddress } = useParams()
    const [timeout, lastAction] = useMoveCountdown()
    const [now, setNow] = useState(Math.floor(Date.now()/1000))
    const [moveCoundtown, setMoveCountdown] = useState<string | 0>(formatTime(0))
    const [player1, player2, bet, player2Move, player1Hash] = useGameData()
    const [move, setMove] = useState(1)
    const [play, playLoading, playSuccess] = usePlay(move, Number(bet))
    const [signMessage, salt] = usePrepareSalt(move, gameAddress as Address)
    const [solve, solveLoading, solveSuccess] = useSolve(move, salt)

    const handleSolve = () => {
        if(!move) return
        if(!salt) {
            signMessage?.()
            return
        }
        solve?.()
        console.log(move, salt)
    }

    
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now()/1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [now])

    useEffect(() => {
        if(!gameAddress) navigate('/')
        else if(!isAddress(gameAddress)) navigate('/')
    }, [gameAddress])

    
    useEffect(() => {
        // Remaining time = Timeout duration - Time since last action
        setMoveCountdown(
            formatTime(timeout - (now - lastAction))
        )
    }, [now, lastAction, timeout])

    return (
        
        <div>
            <ConnectButton />
            <h1>{ `Game Address ${gameAddress}` }</h1>
            <p>{ moveCoundtown }</p>
            <p>{ player1 }</p>
            <p>{ player2 }</p>
            <p>{ bet }</p>
            <p>{ player2Move }</p>
            <p>{ player1Hash }</p>
            <p>{ salt.toString() }</p>
            <p>You { address === player1 ? address : address === player2 ? address : 'are not a player!' }</p>
            <select onChange={(e) => setMove(Number(e.target.value))}>
              {Object.keys(moves).map((move, i) => (
              <option key={i} value={moves[move as moveKey]}>{move}</option>
              ))}
            </select>
            <input type="number" value={bet} disabled={true} />
            <button onClick={() => play?.()}>Submit Move</button>
            <button onClick={() => handleSolve()}>Solve</button>
        </div>
        
    )
}

export default PlayGame