export type RequestOptions = {
  method: string;
  headers: HeadersInit;
  body: string;
};

export type Fetcher = (input: string, init?: RequestOptions) => Promise<unknown>;

type NativeFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function workerFetcher(fetch: NativeFetch): Fetcher {
  return async (url: string, init?: RequestOptions): Promise<unknown> => {
    const response = await fetch(url, init);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Did not receive JSON, instead received: ' + text);
    }
  };
}
