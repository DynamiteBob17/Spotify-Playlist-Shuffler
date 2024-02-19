import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateRandomString } from '../util/utils';

function Auth() {
    const [searchParams] = useSearchParams();
    const [errorMsg] = useState<string | null>(searchParams.get('error'));
    
    const handleLoginClick = () => {
        const state: string = generateRandomString(16);
        const scope: string = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
        const redirectUri = `${window.location.origin.toString()}/callback`;

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope,
            redirect_uri: redirectUri,
            state,
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    return (
        <div style={{position: 'relative', top: '15%'}}>
            <h1>Welcome!</h1>
            {
                errorMsg && <p style={{ color: 'red' }}>(Authentication error: <span style={{ fontWeight: 'bold' }}>{errorMsg}</span>)</p>
            }
            <button onClick={handleLoginClick}>Log in</button>
            <p>through <span style={{ color: '#1db954', fontWeight: 'bold' }}>Spotify</span> to shuffle your playlists.</p>
            <p className={'disclaimer'}>This app is in <span className={'bolded'}>Development mode.</span> If you want to use it, please contact me at <span className={'bolded'}>jan.mlinaric@gmail.com</span> so I can add you as a user of the app.</p>
        </div>
    );
}

export default Auth;
