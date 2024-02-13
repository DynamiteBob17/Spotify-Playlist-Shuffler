import { AxiosRequestConfig } from 'axios';

function makeConfig(
    method: string,
    url: string,
    headers: object,
    data?: object,
): AxiosRequestConfig {
    return {
        method: method,
        url: url,
        headers: headers,
        data: data,
        responseType: 'json'
    }
}

export function makeAccountsConfig(
    method: string,
    route: string,
    headers: object,
    data?: object,
): AxiosRequestConfig {
    return makeConfig(
        method,
        import.meta.env.VITE_SPOTIFY_ACCOUNTS_ORIGIN + route,
        headers,
        data
    );
}

export function makeApiConfig(
    method: string,
    route: string,
    token?: string,
    data?: object
): AxiosRequestConfig {
    return makeConfig(
        method,
        import.meta.env.VITE_SPOTIFY_API_ORIGIN + route,
        {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data
    );
}

export function makeDirectUrlApiConfig(
    method: string,
    url: string,
    token?: string,
    data?: object
): AxiosRequestConfig {
    return makeConfig(
        method,
        url,
        {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        data
    );
}

export function randInt(bound: number) {
    return Math.floor(Math.random() * bound);
}

export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = ' ';
    for (let i = 0; i < length; ++i) {
        result += characters.charAt(randInt(characters.length));
    }

    return result;
}

export function map(val: number, valLow: number, valHigh: number, returnValLow: number, returnValHigh: number) {
    const ratio = (val - valLow) / (valHigh - valLow);
    return ratio * (returnValHigh - returnValLow) + returnValLow;
}
