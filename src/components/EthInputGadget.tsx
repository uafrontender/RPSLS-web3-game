import { FC, useEffect, useState } from "react"
import { Address } from "wagmi"
import { useAccount, useBalance } from "wagmi"

const InputGadget: FC<any> = (({ betCallback, resetBet, disabled = false }: { betCallback: Function, resetBet: Boolean, disabled?: Boolean }) => {
    const { address } = useAccount()
    const { data: balance } = useBalance({ address: address as Address })
    const [tokenAmount, setTokenAmount] = useState<number>(0)

    useEffect(() => {
        betCallback(tokenAmount)
    }, [tokenAmount])

    useEffect(() => {
        console.log(resetBet)
        if(resetBet) setTokenAmount(0)
    }, [resetBet])

    const onChange = ((event: React.ChangeEvent<HTMLInputElement>, max?: bigint) => {
        // remove leading zeros
        if(event.target.value.substring(0, 1) === '0' && event.target.value.substring(1, 2) !== '.') {
            event.target.value = event.target.value.substring(1, event.target.value.toString().length)
        }
        let value: number = parseFloat(event.target.value)
        if(Number.isNaN(value)) setTokenAmount(0)
        else value <= max! ? setTokenAmount(value) : setTokenAmount(Number(max!)/1e18)
    })

    return (
        <div className={ disabled ? 
            'opacity-50 cursor-not-allowed justify-between px-5 items-center py-3bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-zinc-700/20 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500' 
            : 'justify-between px-5 items-center py-3bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-zinc-700/20 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500'
        }>
            <div className="flex">
                <div className="p-5 pl-0">
                    <div className="text-lg font-bold text-center">Bet</div>
                </div>
                
                <div className="flex flex-col">
                    <input
                        disabled={disabled as boolean} 
                        className="p-0 pb-1 text-right overflow-hidden border-transparent float-right text-3xl font-bold bg-transparent text-white"
                        value={tokenAmount} 
                        type="number"
                        onChange={(e) => onChange(e, balance?.value)}
                        max={ balance?.formatted }
                        min={0}
                        placeholder="0.0"
                    />
                    <div className="flex justify-end">
                        <button 
                            className="text-sm font-semibold text-indigo-500 max-w-fit"
                            onClick={() => disabled ? () => {} : setTokenAmount(Number(balance?.formatted) as number) }
                        >
                            { `Balance: ${Number(balance?.formatted).toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default InputGadget
