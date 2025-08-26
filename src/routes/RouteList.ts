import DicomViewer from "../views/DicomViewer";
import LoginPage from "../views/LoginPage";

const RouteList = [
    {
        path: '/viewer',
        name: 'main',
        component: DicomViewer,
    },
    {
        path: '/Login',
        name: 'login',
        component: LoginPage,
    }
]

export default RouteList;