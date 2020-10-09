export const BasemapAT = {
    type: 'tileprovider',
    visibility: true,
    title: 'BasemapAT.basemap',
    provider: 'BasemapAT.basemap',
    name: 'BasemapAT.basemap',
    id: 'BasemapAT.basemap__5'
};
export const NASAGIBS = {
    id: 'Night2012__1',
    group: 'background',
    source: 'nasagibs',
    name: 'Night2012',
    provider: 'NASAGIBS.ViirsEarthAtNight2012',
    title: 'NASAGIBS Night 2012',
    type: 'tileprovider'
};

export const NLS_CUSTOM_URL = {
    type: 'tileprovider',
    visibility: true,
    url: 'https://nls-{s}.tileserver.com/nls/{z}/{x}/{y}.jpg',
    title: 'NLS_API ',
    options: {
        subdomains: [
            '0',
            '1',
            '2',
            '3'
        ]
    },
    provider: 'custom',
    name: 'custom',
    id: 'custom__6',
    loading: false,
    previousLoadingError: false,
    loadingError: false
};
