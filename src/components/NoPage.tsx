import { NavLink } from 'react-router-dom';

function NoPage() {
    return (
        <>
            <h1>Oops, seems you might have gotten lost.</h1>
            <NavLink to={'/home'}>Go back to the app.</NavLink>
        </>
    );
}

export default NoPage;
