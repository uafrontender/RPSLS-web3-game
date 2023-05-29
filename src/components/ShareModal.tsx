import { FC, useState } from "react"

const ShareModal: FC<any> = ({ address, showModal }:{address: string | undefined, showModal: Function}) => {
    const [copied, setCopied] = useState(false)
    const baseURL = import.meta.env.MODE = "development" ? "http://localhost:3000" : "https://rps-lizard-spock.vercel.app"
    const url = `${baseURL}/play/${address?.toString()}`

    const copyURL = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 3000)
    }

    return (
        <div id="popup-modal" tabIndex={-1} className="fixed h-screen top-0 bg-black/20 backdrop-blur-sm left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full">
            <div className="relative w-full max-w-md max-h-full mx-auto top-[37.5%]">
                <div className="relative py-4 px-6 bg-white rounded-lg shadow dark:bg-zinc-900 border dark:border-zinc-800">
                    <button onClick={() => showModal(false)} className="absolute top-3 right-2.5 text-zinc-400 bg-transparent hover:bg-zinc-200 hover:text-zinc-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-zinc-800 dark:hover:text-white" data-modal-hide="popup-modal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span className="sr-only">Close modal</span>
                    </button>                          
                    <div className="p-6 text-center">
                        <svg aria-hidden="true" className="mx-auto mb-4 text-white w-12 h-12 dark:text-zinc-200" fill="none" stroke="#5850EC" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M21 6C21 7.65685 19.6569 9 18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6Z" stroke="#5850EC" stroke-width="2"/>
                            <path d="M21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z" stroke="#5850EC" stroke-width="2"/>
                            <path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="#5850EC" stroke-width="2"/>
                            <path d="M8.72046 10.6397L14.9999 7.5" stroke="#5850EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.70605 13.353L15 16.5" stroke="#5850EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-zinc-500 dark:text-zinc-400">Share this link with your opponent</h3>
                        <h3 className="mb-10 text-base font-normal text-zinc-500 dark:text-indigo-500 break-words">{ url }</h3>
                        <button onClick={() => copyURL()} className="text-white bg-indigo-600 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:focus:ring-indigo-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                            { copied ? 'Copied' : 'Copy Invitation Link' }
                            { copied && <svg aria-hidden="true" className="w-5 h-5 ml-3 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareModal
