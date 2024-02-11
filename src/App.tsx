import { useCookies } from 'react-cookie';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Callback from './components/Callback';
import Home from './components/Home';
import NoPage from './components/NoPage';
import './App.scss';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

function App() {
    const [cookies] = useCookies();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    index
                    element={
                        cookies[ACCESS_TOKEN_COOKIE_NAME] ? <Navigate to={'home'} /> : <Auth />
                    }
                />
                <Route
                    path={'home'}
                    element={
                        cookies[ACCESS_TOKEN_COOKIE_NAME] ? <Home /> : <Navigate to={'/'} />
                    }
                />
                <Route
                    path={'callback'}
                    element={<Callback />}
                />
                <Route
                    path={'*'}
                    element={<NoPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
