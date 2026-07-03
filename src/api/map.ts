export const getMap = async (name: string) => {
    const schema = name.endsWith('.json') ? name.replace('.json', '') : name;
    
    // 改為呼叫 DataAskController 中定義的 API 路由
    return fetch(`/dashboardHub/api/AGVC/${encodeURIComponent(schema)}`)
        .then(res => {
            if (!res.ok) throw new Error('Map not found')
            return res.json()
        })
}