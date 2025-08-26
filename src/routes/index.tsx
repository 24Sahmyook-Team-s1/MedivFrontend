import { Route, Routes } from "react-router-dom"
import Article from "../components/Layout/Article"
import RouteList from "./RouteList"

const Router: React.FC = () => {
    return (
        <Article>
            <Routes>
                {RouteList.map((route) => (
                    <Route 
                        path = {route.path}
                        key = {`${route.name}:${route.path}`}
                        element={<route.component />}
                    />
                ))}
            </Routes>
        </Article>
    )
}

export default Router;