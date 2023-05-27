import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMoveCountdown, 
    useGameData, 
    usePlay, 
    useSolve,
    useJ1Timeout,
    useJ2Timeout } from "../hooks/useRPS"
import { formatTime } from "../utils/formatTime"
import { isAddress, parseEther, parseGwei } from "viem"
import { useAccount, Address, useBalance } from "wagmi"
import { usePrepareSalt } from "../hooks/usePrepareSalt"

import { moves, moveKey } from '../constants'
import { formatAddress } from "../utils/formatAddress"


const PlayGame = () => {
    const navigate = useNavigate()

    const { address } = useAccount()
    const { data: userBalance, isError, isLoading } = useBalance({
        address,
        watch: true
    })
    const { gameAddress } = useParams()
    const [timeout, lastAction] = useMoveCountdown()
    const [now, setNow] = useState(Math.floor(Date.now()/1000))
    const [moveCoundtown, setMoveCountdown] = useState<string | 0>(formatTime(0))
    const [player1, player2, bet, player2Move, isGameDataFetched] = useGameData()
    const [move, setMove] = useState(Number(localStorage.getItem('rps:playerMove')) || 1)
    const [play, playLoading] = usePlay(move, bet ? Number(bet) : 0)
    const [signMessage, salt] = usePrepareSalt(move, gameAddress as Address)
    const [solve, solveLoading, solveSuccess] = useSolve(move, salt)
    const [gameEnded, setGameEnded] = useState(false)
    const [isPlayer, setIsPlayer] = useState(false)
    const [isPlayer2, setIsPlayer2] = useState(false)
    const [j1timeout, j1timeoutLoading, j1timeoutSuccess] = useJ1Timeout()
    const [j2timeout, j2timeoutLoading, j2timeoutSuccess] = useJ2Timeout()
    const [timeoutLoading, setTimeoutLoading] = useState(false)
    const [balanceBeforeGame, setBalanceBeforeGame] = useState(0)
    const [isWinner, setIsWinner] = useState<Boolean | undefined>(undefined)

    const opponentAddress = () => {
        return player1 === address ? player2 : player1
    }

    const handleTimeout = () => {
        setTimeoutLoading(true)
        isPlayer2 ? j1timeout?.() : j2timeout?.()
    }

    const handleSolve = () => {
        if(!salt) {
            signMessage?.()
            return
        }
        solve?.()
    }

    const newMatch = () => {
        // clean up local storage
        localStorage.removeItem('rps:playerMove')
        localStorage.removeItem('rps:gameAddress')
        navigate(`/`)
    }

    const showTimeout = () => {
        // player 2 timeout callable by player 1
        return moveCoundtown === 0 && !player2Move && !isPlayer2
        // player 1 timeout callable by player 2
        || moveCoundtown === 0 && player2Move && isPlayer2
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now()/1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [now])

    // game ended
    useEffect(() => {
        if(isGameDataFetched && bet !== undefined && bet === 0) { setGameEnded(true) }
        else if(j1timeoutSuccess || j2timeoutSuccess || solveSuccess) { setGameEnded(true) }
    }, [bet, isGameDataFetched, j1timeoutSuccess, j2timeoutSuccess, solveSuccess])

    // set winner
    useEffect(() => {
        let balance = Number(userBalance?.value)/1e18
        if(bet && bet > 0) setBalanceBeforeGame(balance)
        else {
            if(balance > balanceBeforeGame) setIsWinner(true)
            else setIsWinner(false)
        }
        console.log(balanceBeforeGame)
    }, [bet, userBalance])


    useEffect(() => {
        if(!gameAddress) navigate('/')
        else if(!isAddress(gameAddress)) navigate('/')
    }, [gameAddress])

    useEffect(() => {
        // get player 1 original move (if two players play in the same session)
        if(address === player1) setMove(Number(localStorage.getItem('rps:playerMove')))
        if(!address || address !== player1 && address !== player2) {
            setIsPlayer(false)
        } else {
            setIsPlayer(true)
            if(address !== player2) {
                setIsPlayer2(false)
            } else setIsPlayer2(true)
        }
    }, [address, gameAddress, player1, player2, isGameDataFetched])
    
    useEffect(() => {
        // Remaining time = Timeout duration - Time since last action
        setMoveCountdown(
            formatTime(timeout - (now - lastAction))
        )
    }, [now, lastAction, timeout])

    useEffect(() => {
        if(j1timeoutLoading || j2timeoutLoading) setTimeoutLoading(false)
    }, [j1timeoutLoading, j2timeoutLoading])


    return (
        <>
        {/* Game initialized and user is a player and game is running */}
        { isGameDataFetched ? isPlayer && gameEnded === false ? (
        <section className="bg-white dark:bg-zinc-900">
            <div className="py-8 px-4 mx-auto max-w-screen-2xl text-center z-10 relative">
                <h1 className="mb-10 text-4xl font-extrabold tracking-tight leading-none text-zinc-900 md:text-5xl lg:text-6xl dark:text-white">Rock Paper Scissors - Lizard Spock</h1>
                <div className='flex flex-col max-w-7xl mx-auto mt-8 mb-8'>
                    <div className='flex flex-col justify-center p-10 rounded-lg shadow-sm dark:text-zinc-400 sm:text-base border dark:bg-zinc-800/30 dark:border-zinc-700'>
                        <div className='flex flex-col items-center justify-center'>
                            <h3 className="text-6xl pb-2 font-bold text-zinc-900 dark:text-white">
                                { moveCoundtown }
                            </h3>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white/40">
                                Until the end of the choice
                            </h3>
                            { showTimeout() ? (
                                <button 
                                    onClick={() => handleTimeout()}
                                    className="text-white m-4 cursor-pointer bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                        { j1timeoutLoading || j2timeoutLoading || timeoutLoading ? 'Loading..' : 'Opponent Timeout' }
                                </button>
                            ) : null}
                        </div>
                        <div className="flex justify-around">
                            <div>
                                <h3 className="text-lg py-4 pb-1 font-semibold text-zinc-900 dark:text-white">
                                    { !isPlayer2 ? 'You' : 'Opponent' }
                                </h3>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white/40">
                                    { formatAddress(isPlayer2 ? opponentAddress() as Address : address as Address) }
                                </h3>
                            </div>
                            <div>
                                <h3 className="text-lg py-4 pb-1 font-semibold text-zinc-900 dark:text-white">
                                    { isPlayer2 ? 'You' : 'Opponent' }
                                </h3>
                                <h3 className="text-sm pb-5 font-bold text-zinc-900 dark:text-white/40">
                                    
                                    { formatAddress(!isPlayer2 ? opponentAddress() as Address : address as Address) }
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center justify-around px-20 pb-10">
                            <div className='flex flex-col pr-20 items-center justify-center'>
                                <div className='flex flex-col justify-center'>
                                    { isPlayer2 ? (
                                        <img className="m-10 flip" width={250} src={(new URL(`../assets/hands/Unknown.svg`, import.meta.url)).toString()} />
                                    ) : (
                                        <img className="m-10 flip" width={250} src={(new URL(`../assets/hands/${[...Object.keys(moves)][Number(localStorage.getItem('rps:playerMove')) - 1]}.svg`, import.meta.url)).toString()} />
                                    )}
                                    <div className="mb-6 w-24 mx-auto">
                                        <label className="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">{isPlayer2 ? 'Opponent' : 'My' } Bet</label>
                                        <input value={`${bet} Ether`} disabled={true} className="bg-zinc-50 border disabled:opacity-50 disabled:cursor-not-allowed border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-zinc-700/20 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Address..." required />
                                    </div> 
                                </div>
                            </div>
                            <div className='border-l-[1px] h-[300px] border-zinc-100/10'>
                            </div>
                            <div className='flex flex-col justify-center'>
                                <div className="flex">
                                    <div className="flex">
                                    { !isPlayer2 ? (
                                        <img className="m-10" width={250} src={(new URL(`../assets/hands/Unknown.svg`, import.meta.url)).toString()} />
                                    ) : (
                                        <img className="m-10" width={250} src={(new URL(`../assets/hands/${[...Object.keys(moves)][player2Move ? player2Move - 1 as number : move-1 as number]}.svg`, import.meta.url)).toString()} />
                                    )}
                                    </div>
                                    
                                        <div className="flex flex-col justify-center">
                                            <h3 className="text-lg py-4 font-semibold text-zinc-900 dark:text-white">
                                                { player2Move ? `${isPlayer2 ? 'My' : 'Opponent'} Move is` : isPlayer2 ? 'Select Your Move' : null }
                                            </h3>
                                            { player2Move ? (
                                                <div className="w-full p-4 text-green-700 border border-green-300 rounded-lg bg-green-50 dark:bg-zinc-800 dark:border-green-800 dark:text-green-400" role="alert">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <img width={35} src={(new URL(`../assets/icons/${[...Object.keys(moves)][player2Move - 1 as number]}.svg`, import.meta.url)).toString()} />
                                                        <h3 className="font-medium">{ [...Object.keys(moves)][player2Move - 1 as number] }</h3>
                                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    </div>
                                                </div>
                                            ) : isPlayer2 && (
                                                <ol className="space-y-4 w-56 justify-center mx-auto">
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
                                                                <div onClick={() => setMove(i+1)} className="p-4 w-full text-zinc-900 bg-zinc-100 border border-zinc-300 rounded-lg dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400 hover:dark:text-indigo-700 hover:dark:border-indigo-700 hover:dark:dark:bg-zinc-800 cursor-pointer" role="alert">
                                                                    <div className="flex items-center justify-center gap-4">
                                                                        <img width={35} src={handPath} />
                                                                        <h3 className="font-medium">{_move}</h3>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </li>
                                                    )})}
                                                </ol>
                                            )}
                                        </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-around'>
                            { player2Move && !isPlayer2 ? (
                                <button 
                                    onClick={() => handleSolve()}
                                    className="text-white m-4 cursor-pointer bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                        { solveLoading ? 'Loading...' : `Solve - ${!salt ? 'Sign Transaction' : 'Make Transaction'}` }
                                </button>
                            ) : null}                                   
                            { !player2Move && isPlayer2 ? (
                                <button 
                                    onClick={() => play?.()}
                                    className="text-white m-4 cursor-pointer bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                        { playLoading ? 'Loading...' : 'Submit Move' }
                                </button>
                            ) : player2Move && isPlayer2 ? (
                                <h3 className="self-center">Waiting for your opponent to solve the game</h3>
                            ) : (
                                <h3 className="self-center">{ player2Move ? 'Your Opponent choosed a hand' : 'Your Opponent is choosing a hand' }</h3>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        // game ended
        ) : gameEnded ? (
            <div className="flex flex-col w-full h-screen -mt-[100px] justify-center items-center">
                <h3 className="z-10 text-2xl text-center">
                    Game Ended
                </h3>
                <h3 className="z-10 text-6xl text-center py-4">
                   { isWinner ? 'You Won!' : 'You Lost!' }
                </h3>
                <button 
                    onClick={() => newMatch()}
                    className="text-white z-10 m-4 cursor-pointer bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                        New Match?
                </button>
            </div>
        ) : (
            <div className="flex w-full h-screen -mt-[100px] justify-center items-center">
                <h3 className="z-10 text-3xl text-center">
                    {
                        !address ? 'Connect your wallet to start' : 'You are not a player in this game.'
                    }
                </h3>
            </div>
        // game waiting for on-chain data to be fetched
        ) : (
            <div className="flex w-full h-screen -mt-[100px] justify-center items-center">
                <h3 className="z-10 text-3xl text-center">
                    <svg aria-hidden="true" className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                <span className="sr-only">Loading...</span>
                </h3>
            </div>
        )}
    </>
    )
}

export default PlayGame