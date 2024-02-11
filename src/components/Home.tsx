import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import { ACCESS_TOKEN_COOKIE_NAME } from '../App';
import { makeApiConfig, makeDirectUrlApiConfig } from '../util/utils';
import { IPlaylists, IPlaylistsResponse } from '../models/IPlaylist';
import ShufflePlaylist from './ShufflePlaylist';
import IUser from '../models/IUser';
import './Home.scss';

function Home() {
    const [cookies, , removeCookie] = useCookies();
    const [username, setUsername] = useState<string>('?');
    const [userProfileImageUrl, setUserProfileImageUrl] = useState<string>('https://i.scdn.co/image/ab6761610000e5eb601fb0059594d52f3f7939a9');
    const [playlists, setPlaylists] = useState<IPlaylists>([]);
    const [isShuffling, setIsShuffling] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                const { data: user } = await axios<IUser>(makeApiConfig(
                    'GET',
                    '/me',
                    cookies[ACCESS_TOKEN_COOKIE_NAME]
                ));
                setUsername(user.display_name);
                if (user.images && user.images.length > 0) {
                    setUserProfileImageUrl(user.images[0].url);
                }

                let next: string | null = import.meta.env.VITE_SPOTIFY_API_ORIGIN + '/me/playlists';
                let userPlaylists: IPlaylists = [];
                let userPlaylistsResponse: IPlaylistsResponse;
                while (next) {
                    const { data } = await axios<IPlaylistsResponse>(makeDirectUrlApiConfig(
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
                console.error(err);

                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    removeCookie(ACCESS_TOKEN_COOKIE_NAME);
                }
            }
        })();
    }, []);

    function handleStartShuffle() {
        setIsShuffling(true);
    }

    function handleStopShuffle() {
        setIsShuffling(false);
    }

    return (
        <div className={'home-wrapper'}>
            <div className={'login-info'}>
                <p>Logged in as <span style={{ color: '#1db954' }}>{username}</span></p>
                {
                    userProfileImageUrl && <img src={userProfileImageUrl} alt={'user profile image'} />
                }
                <button onClick={() => removeCookie(ACCESS_TOKEN_COOKIE_NAME)}>logout</button>
            </div>
            <p>Make sure the sort order of your playlist is set to <span style={{ fontWeight: 'bold' }}>Custom order</span>.</p>
            <div className={'playlists'}>
                {
                    playlists.map(playlist => {
                        return <ShufflePlaylist
                            playlist={playlist}
                            isShuffling={isShuffling}
                            handleStartShuffle={handleStartShuffle}
                            handleStopShuffle={handleStopShuffle}
                            key={playlist.id}
                        />;
                    })
                }
            </div>
        </div>
    );
}

export default Home;
