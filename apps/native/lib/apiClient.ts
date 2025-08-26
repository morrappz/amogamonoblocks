import { Session } from '@supabase/supabase-js';

const BASE_URL = process.env.API_BASE_URL as string || "http://192.168.213.103:3000"; 

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
    method?: Method;
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string | number>;
}

export const apiClient = async <T = any>(
    path: string,
    options: ApiOptions = {},
    session: Session | undefined = undefined
): Promise<{ data: T | null; error: any }> => {
    console.log("Hii api client")
    console.log("hiii after sesssion",session)
    const { method = 'GET', body, headers = {}, query } = options;

    const url = new URL(`${BASE_URL}${path}`);
    if (query) {
        Object.entries(query).forEach(([key, value]) =>
            url.searchParams.append(key, String(value))
        );
    }

    const token = session?.access_token;

    console.log("url.toString()",url.toString())
    const res = await fetch(url.toString(), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    try {
        const data = await res.json();
        if (!res.ok) throw data;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};
