let mockIPs = [
    { id: 1, ipAddress: '203.0.113.0/24', description: 'Test network' },
    { id: 2, ipAddress: '198.51.100.0/24', description: 'Client 1 network' }
];

export function getIPs({ page = 1, pageSize = 12, q = '' } = {}) {
    const filtered = mockIPs.filter(ip =>
        ip.ipAddress.toLowerCase().includes(q.toLowerCase()) ||
        ip.description.toLowerCase().includes(q.toLowerCase())
    );
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return new Promise(resolve => setTimeout(() => {
        resolve({
            total: filtered.length,
            isNextPageAvailable: end < filtered.length,
            resources: filtered.slice(start, end)
        });
    }, 300));
}

export function addIP(ip) {
    const newIP = { ...ip, id: (Math.max(0, ...mockIPs.map(i => parseInt(i.id, 10))) + 1).toString() };
    mockIPs.push(newIP);
    return Promise.resolve(newIP);
}

export function updateIP(ip) {
    mockIPs = mockIPs.map(item => item.id === ip.id ? { ...item, ...ip } : item);
    return Promise.resolve(ip);
}

export function deleteIP(id) {
    mockIPs = mockIPs.filter(item => item.id !== id);
    return Promise.resolve();
}
