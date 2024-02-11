import axios from 'axios';
import { Buffer } from 'buffer';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { makeAccountsConfig } from '../util/utils';
import { ACCESS_TOKEN_COOKIE_NAME } from '../App';
import IAuthResponse from '../models/IAuthResponse';

function Callback() {
    const [, setCookies] = useCookies();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code: string | null = searchParams.get('code') || null;
    const state: string | null = searchParams.get('state') || null;

    useEffect(() => {
        (async () => {
            if (state === null) {
                navigate('/?error=state_mismatch');
            } else {
                try {
                    const { data } = await axios<IAuthResponse>(makeAccountsConfig(
                        'POST',
                        '/api/token',
                        {
                            'content-type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic ' + (Buffer.from(import.meta.env.VITE_CLIENT_ID + ':' + import.meta.env.VITE_CLIENT_SECRET).toString('base64'))
                        },
                        {
                            code: code,
                            redirect_uri: `${window.location.origin.toString()}/callback`,
                            grant_type: 'authorization_code'
                        }
                    ));
                    setCookies(ACCESS_TOKEN_COOKIE_NAME, data.access_token, { path: '/' });
                    navigate('/home');
                } catch (err) {
                    console.error(err);
                    navigate('/?error=failed+to+log+in');
                }
            }
        })();
    }, []);

    return (
        <>
            <h2>Logging you in...</h2>
        </>
    );
}

export default Callback;
