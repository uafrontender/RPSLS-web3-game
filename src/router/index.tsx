import { createBrowserRouter } from "react-router-dom"
import CreateGame from "../views/CreateGame"
import PlayGame from "../views/PlayGame"

import Topbar from "../components/Topbar"

const Layout: any = ((View: any) => {
  return (
    <>
    <Topbar />
    <div className='h-screen bg-zinc-900 ' style={{height: 'auto', minHeight: '100vh'}}>
        <div className='max-w-7xl pt-[75px] mx-auto'>
            { View }
        </div>
    </div>
    <div className="bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900 w-full h-full absolute top-0 left-0 z-0" />
    </>
  )
})


const routes = [
    { path: "/", element: Layout(<CreateGame />) },
    { path: "/play/:gameAddress", element: Layout(<PlayGame />) }
]


export default createBrowserRouter(routes)
