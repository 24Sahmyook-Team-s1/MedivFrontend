import AdminPage from "../views/AdminPage";
import DicomViewer from "../views/DicomViewer";
import LoginPage from "../views/LoginPage";
import StudyView from "../views/StudyView";

export type Guard = 'protected' | 'publicOnly' | 'none';

export type RouteItem = {
    path: string;
    name: string;
    component: React.ComponentType;
    guard?: Guard;
}

const RouteList: RouteItem[] = [
    {
        path: '/Studies',
        name: 'Studies',
        component: StudyView,
        guard: 'protected',
    },
    {
        path: '/viewer',
        name: 'main',
        component: DicomViewer,
        guard: 'protected',
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        guard: 'publicOnly',
    },
    {
        path: '/adcon',
        name: 'admin',
        component: AdminPage,
        guard: 'protected'
    }
];

export default RouteList;