export const getMap = async (name: string) => {
    const fileName = name.endsWith('.json') ? name : `${name}.json`
    return fetch(`/maps/${encodeURIComponent(fileName)}`)
        .then(res => {
            if (!res.ok) throw new Error('Map not found')
            return res.json()
        })
}