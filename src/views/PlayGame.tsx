import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMoveTimeout, useMoveCountdown, useGameData, usePlay, useSolve } from "../hooks/useRPS"
import { formatTime } from "../utils/formatTime"
import { Hash, isAddress, fromHex, keccak256 } from "viem"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useSignMessage } from "wagmi"

type moveKey = keyof typeof moves

//enum Move {Null, Rock, Paper, Scissors, Spock, Lizard}
const moves = {
    'Rock': 1,
    'Paper': 2,
    'Scissors': 3,
    'Spock': 4,
    'Lizard': 5
}

const PlayGame = () => {
    const navigate = useNavigate()
    const { address } = useAccount()
    const { gameAddress } = useParams()
    const [timeout, lastAction] = useMoveCountdown()
    const [now, setNow] = useState(Math.floor(Date.now()/1000))
    const [moveCoundtown, setMoveCountdown] = useState<string | 0>(formatTime(0))
    const [player1, player2, bet, player2Move] = useGameData()
    const [move, setMove] = useState(0)
    const [play, playLoading, playSuccess] = usePlay(move, Number(bet))
    const { data: signedMsg, signMessage } = useSignMessage({
        message: `I'm signing that my move is [${Object.keys(moves)[move-1]}]`,
    })
    const [salt, setSalt] = useState<string>('')
    const [solve, solveLoading, solveSuccess] = useSolve(move, salt)

    const handleSolve = () => {
        if(!move) return
        if(!salt) {
            signMessage?.()
            return
        }
        // solve?.()
        console.log(move, salt)
    }

    useEffect(() => {
        if(signedMsg) {
            const signedMsgHash = keccak256(signedMsg)
            setSalt(fromHex(signedMsgHash, 'bigint') as any as string)
        }
    }, [signedMsg])

    
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now()/1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [now])

    // useEffect(() => {
    //     console.log(player1, player2, bet, player2Move)
    // }, [player1])

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