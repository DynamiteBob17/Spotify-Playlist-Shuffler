import IUser from './IUser';

export default interface IPlaylist {
    id: string,
    name: string,
    tracks: { total: number },
    owner: IUser,
    images?: Array<{ url: string }>
}

export interface IPlaylists extends Array<IPlaylist> { }

export interface IPlaylistsResponse {
    items: IPlaylists,
    next: string | null,
}
