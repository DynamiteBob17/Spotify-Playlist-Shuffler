import axios from 'axios';
import {useCookies} from 'react-cookie';
import {useEffect, useState} from 'react';
import {ACCESS_TOKEN_COOKIE_NAME} from '../App';
import {makeApiConfig, makeDirectUrlApiConfig} from '../util/utils';
import {IPlaylists, IPlaylistsResponse} from '../models/IPlaylist';
import ShufflePlaylist from './ShufflePlaylist';
import IUser from '../models/IUser';
import './Home.scss';
import {Skeleton} from '@mui/material';

function Home() {
    const [cookies, , removeCookie] = useCookies();
    const [username, setUsername] = useState<string>('');
    const [userProfileImageUrl, setUserProfileImageUrl] = useState<string>('');
    const [playlists, setPlaylists] = useState<IPlaylists>([]);
    const [isShuffling, setIsShuffling] = useState<boolean>(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let user: IUser;

            try {
                const {data} = await axios<IUser>(makeApiConfig(
                    'GET',
                    '/me',
                    cookies[ACCESS_TOKEN_COOKIE_NAME]
                ));
                user = data as IUser;
                setUsername(user.display_name || '?');
                if (user.images && user.images.length > 0) {
                    setUserProfileImageUrl(user.images[0].url);
                } else {
                    setUserProfileImageUrl('https://i.scdn.co/image/ab6761610000e5eb601fb0059594d52f3f7939a9');
                }
            } catch (err) {
                handleError(err, 'failed to fetch user data');
            }

            try {
                let next: string | null = import.meta.env.VITE_SPOTIFY_API_ORIGIN + '/me/playlists';
                let userPlaylists: IPlaylists = [];
                let userPlaylistsResponse: IPlaylistsResponse;
                while (next) {
                    const {data} = await axios<IPlaylistsResponse>(makeDirectUrlApiConfig(
                        'GET',
                        next,
                        cookies[ACCESS_TOKEN_COOKIE_NAME]
                    ));
                    userPlaylistsResponse = data as IPlaylistsResponse;
                    userPlaylists = userPlaylists.concat(userPlaylistsResponse.items);
                    next = userPlaylistsResponse.next;
                }
                setPlaylists(userPlaylists.filter(playlist => user?.id === playlist.owner.id));
            } catch (err) {
                handleError(err, 'failed to fetch playlists');
            } finally {
                setIsLoadingPlaylists(false);
            }
        })();
    }, []);

    // could use a global error handler or something, but who cares lol
    function handleError(err: unknown, errorMessage: string) {
        console.error(err);
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) {
                removeCookie(ACCESS_TOKEN_COOKIE_NAME);
            }

            setErrorMsg((err.response?.data.error?.message || err.response?.data) + '; ' + errorMessage);
        } else {
            setErrorMsg(errorMessage);
        }
    }

    function handleStartShuffle() {
        setIsShuffling(true);
    }

    function handleStopShuffle() {
        setIsShuffling(false);
    }

    return (
        <div className={'home-wrapper'}>
            <div className={'login-info'}>
                <p>Logged in as {
                    username
                        ? <span style={{color: '#1db954'}}>{username}</span>
                        : <Skeleton style={{display: 'inline-block', margin: 'auto 5px', alignContent: 'center'}}
                                    variant={'rounded'} width={75} height={12}/>
                }</p>
                {
                    userProfileImageUrl
                        ? <img src={userProfileImageUrl} alt={'user profile image'}/>
                        : <Skeleton style={{marginRight: '5px'}} variant={'circular'} width={32} height={32}/>
                }
                <button onClick={() => removeCookie(ACCESS_TOKEN_COOKIE_NAME)}>logout</button>
            </div>
            <p>Make sure the sort order of your playlist is set to <span
                style={{fontWeight: 'bold'}}>Custom order</span>.</p>
            <p>NOTE: you can only shuffle playlists you created/own.</p>
            {
                !isLoadingPlaylists && playlists.length <= 0 && !errorMsg &&
                <p style={{marginTop: '33px', color: 'orange'}}>
                    You do not have any <span style={{fontWeight: 'bold'}}>owned</span> playlists...
                </p>
            }
            {
                errorMsg && <p style={{color: 'red', fontWeight: 'bold'}}>Error: {errorMsg}!</p>
            }
            <div className={'playlists'}>
                {
                    isLoadingPlaylists ?
                        <div className={'loader-wrapper'}>
                            <div className={'loader'}></div>
                        </div>
                        : playlists.map(playlist => {
                            return <ShufflePlaylist
                                playlist={playlist}
                                isShuffling={isShuffling}
                                handleStartShuffle={handleStartShuffle}
                                handleStopShuffle={handleStopShuffle}
                                handleError={handleError}
                                key={playlist.id}
                            />;
                        })
                }
            </div>
        </div>
    );
}

export default Home;
