import { ConnectButton } from "@rainbow-me/rainbowkit"

const Topbar = () => {
    return (
        <nav className=" bg-zinc-900 fixed w-full z-20 top-0 left-0">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <ConnectButton />            
        </div>
        </nav>
    )
}

export default Topbar
