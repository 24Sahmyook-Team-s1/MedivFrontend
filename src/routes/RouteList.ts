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
        path: '/',
        name: 'login',
        component: LoginPage,
        guard: 'publicOnly',
    }
];

export default RouteList;