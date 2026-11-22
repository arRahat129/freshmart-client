export async function clientFetch(path) {
    const res = await fetch(path, {
        cache: 'no-store',
        credentials: 'include',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed with status ${res.status}`);
    }
    return res.json();
}
