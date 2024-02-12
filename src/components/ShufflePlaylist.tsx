import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import { makeApiConfig, map, randInt } from '../util/utils';
import { ACCESS_TOKEN_COOKIE_NAME } from '../App';
import IPlaylist from '../models/IPlaylist';
import './ShufflePlaylist.scss';

type ShufflePlaylistProps = {
    playlist: IPlaylist,
    isShuffling: boolean,
    handleStartShuffle: () => void,
    handleStopShuffle: () => void,
    handleError: (err: unknown, errorMessage: string) => void,
};

function ShufflePlaylist({
    playlist,
    isShuffling,
    handleStartShuffle,
    handleStopShuffle,
    handleError
}: ShufflePlaylistProps) {
    const [progress, setProgress] = useState<number>(0);
    const [isShuffled, setIsShuffled] = useState<boolean>(false);
    const [isShufflingThisPlaylist, setIsShufflingThisPlaylist] = useState<boolean>(false);
    const [playlistImageUrl, setPlaylistImageUrl] = useState<string>('');
    const [cookies] = useCookies();

    useEffect(() => {
        if (playlist.images && playlist.images.length > 0) {
            setPlaylistImageUrl(playlist.images[0].url);
        } else {
            setPlaylistImageUrl('https://i.ibb.co/kDC5sQP/After-1.png');
        }
    }, [playlist]);

    async function handleShuffle() {
        if (isShuffling) return;

        setIsShuffled(false);
        setIsShufflingThisPlaylist(true);
        handleStartShuffle();

        const config = {
            method: 'PUT',
            route: `/playlists/${playlist.id}/tracks`,
            token: cookies[ACCESS_TOKEN_COOKIE_NAME],
            data: {
                range_start: -1,
                insert_before: -1,
                range_length: 1
            }
        };

        for (let i = 0; i < playlist.tracks.total; ++i) {
            config.data.range_start = randInt(playlist.tracks.total);
            config.data.insert_before = randInt(playlist.tracks.total + 1);

            try {
                await axios(makeApiConfig(
                    config.method,
                    config.route,
                    config.token,
                    config.data
                ));
            } catch (err) {
                setIsShufflingThisPlaylist(false);
                handleStopShuffle();

                handleError(err, 'failed to shuffle playlist');

                return;
            }

            setProgress(Math.round(map(i, 0, playlist.tracks.total - 1, 0, 100)));
        }

        if (playlist.tracks.total <= 0) {
            setProgress(100);
        }

        setIsShuffled(true);
        setIsShufflingThisPlaylist(false);
        handleStopShuffle();
    }

    return (
        <div className={'shuffle-playlist-wrapper'}>
            <div className={'shuffle-container'}>
                <div className={'playlist-info'}>
                    <img src={playlistImageUrl} alt={'playlist image'} />
                    <p>{playlist.name}</p>
                </div>
                <button disabled={isShuffling} onClick={handleShuffle}>Shuffle</button>
            </div>
            <div className={'progress-bar-container'}>
                <div className={'progress-bar'} style={{ width: `${progress}%`, background: isShuffled ? '#1db954' : '' }}>
                    {isShuffled || isShufflingThisPlaylist ? null : <div className={'animation'}></div>}
                    <p className={'shuffling-text'}>
                        {isShuffled && 'Shuffled!'}
                        {!isShuffled && isShufflingThisPlaylist && `Shuffling... ${progress}%`}
                    </p>
                </div>
                <p className={'track-count'}>{playlist.tracks.total} tracks</p>
            </div>
        </div>
    );
}

export default ShufflePlaylist;
