import { createBrowserRouter } from "react-router-dom"
import CreateGame from "../views/CreateGame"
import PlayGame from "../views/PlayGame"
const routes = [
    { path: "/", element: <CreateGame /> },
    { path: "/play/:gameAddress", element: <PlayGame /> }

]


export default createBrowserRouter(routes)
