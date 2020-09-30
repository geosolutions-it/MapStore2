export default {
    type: 'wmts',
    requestEncoding: 'RESTful',
    style: 'normal',
    format: 'image/png',
    url: [
        'https://maps1.server.org/Sample/geolandSample/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
        'https://maps2.server.org/Sample/geolandSample/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
        'https://maps3.server.org/Sample/geolandSample/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
        'https://maps4.server.org/Sample/geolandSample/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
        'https://maps.server.org/Sample/geolandSample/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png'
    ],
    capabilitiesURL: 'https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml ',
    queryable: false,
    visibility: true,
    dimensions: [],
    name: 'geolandbasemap',
    title: 'Geoland Basemap',
    matrixIds: {
        google3857: [
            {
                identifier: '0'
            },
            {
                identifier: '1'
            },
            {
                identifier: '2'
            },
            {
                identifier: '3'
            },
            {
                identifier: '4'
            },
            {
                identifier: '5'
            },
            {
                identifier: '6'
            },
            {
                identifier: '7'
            },
            {
                identifier: '8'
            },
            {
                identifier: '9'
            },
            {
                identifier: '10'
            },
            {
                identifier: '11'
            },
            {
                identifier: '12'
            },
            {
                identifier: '13'
            },
            {
                identifier: '14'
            },
            {
                identifier: '15'
            },
            {
                identifier: '16'
            },
            {
                identifier: '17'
            },
            {
                identifier: '18'
            },
            {
                identifier: '19'
            },
            {
                identifier: '20'
            }
        ],
        'EPSG:3857': [
            {
                identifier: '0'
            },
            {
                identifier: '1'
            },
            {
                identifier: '2'
            },
            {
                identifier: '3'
            },
            {
                identifier: '4'
            },
            {
                identifier: '5'
            },
            {
                identifier: '6'
            },
            {
                identifier: '7'
            },
            {
                identifier: '8'
            },
            {
                identifier: '9'
            },
            {
                identifier: '10'
            },
            {
                identifier: '11'
            },
            {
                identifier: '12'
            },
            {
                identifier: '13'
            },
            {
                identifier: '14'
            },
            {
                identifier: '15'
            },
            {
                identifier: '16'
            },
            {
                identifier: '17'
            },
            {
                identifier: '18'
            },
            {
                identifier: '19'
            },
            {
                identifier: '20'
            }
        ]
    },
    description: 'Basemap von Österreich in Farbe',
    tileMatrixSet: [
        {
            'ows:Identifier': 'google3857',
            'ows:BoundingBox': {
                $: {
                    crs: 'urn:ogc:def:crs:EPSG:6.18.3:3857'
                },
                'ows:LowerCorner': '977650 5838030',
                'ows:UpperCorner': '1913530 6281290'
            },
            'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG:6.18.3:3857',
            WellKnownScaleSet: 'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible',
            TileMatrix: [
                {
                    'ows:Identifier': '0',
                    ScaleDenominator: '559082264.029',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '1',
                    MatrixHeight: '1'
                },
                {
                    'ows:Identifier': '1',
                    ScaleDenominator: '279541132.015',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '2',
                    MatrixHeight: '2'
                },
                {
                    'ows:Identifier': '2',
                    ScaleDenominator: '139770566.007',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '4',
                    MatrixHeight: '4'
                },
                {
                    'ows:Identifier': '3',
                    ScaleDenominator: '69885283.0036',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '8',
                    MatrixHeight: '8'
                },
                {
                    'ows:Identifier': '4',
                    ScaleDenominator: '34942641.5018',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '16',
                    MatrixHeight: '16'
                },
                {
                    'ows:Identifier': '5',
                    ScaleDenominator: '17471320.7509',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '32',
                    MatrixHeight: '32'
                },
                {
                    'ows:Identifier': '6',
                    ScaleDenominator: '8735660.37545',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '64',
                    MatrixHeight: '64'
                },
                {
                    'ows:Identifier': '7',
                    ScaleDenominator: '4367830.18773',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '128',
                    MatrixHeight: '128'
                },
                {
                    'ows:Identifier': '8',
                    ScaleDenominator: '2183915.09386',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '256',
                    MatrixHeight: '256'
                },
                {
                    'ows:Identifier': '9',
                    ScaleDenominator: '1091957.54693',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '512',
                    MatrixHeight: '512'
                },
                {
                    'ows:Identifier': '10',
                    ScaleDenominator: '545978.773466',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '1024',
                    MatrixHeight: '1024'
                },
                {
                    'ows:Identifier': '11',
                    ScaleDenominator: '272989.386733',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '2048',
                    MatrixHeight: '2048'
                },
                {
                    'ows:Identifier': '12',
                    ScaleDenominator: '136494.693366',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '4096',
                    MatrixHeight: '4096'
                },
                {
                    'ows:Identifier': '13',
                    ScaleDenominator: '68247.3466832',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '8192',
                    MatrixHeight: '8192'
                },
                {
                    'ows:Identifier': '14',
                    ScaleDenominator: '34123.6733416',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '16384',
                    MatrixHeight: '16384'
                },
                {
                    'ows:Identifier': '15',
                    ScaleDenominator: '17061.8366708',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '32768',
                    MatrixHeight: '32768'
                },
                {
                    'ows:Identifier': '16',
                    ScaleDenominator: '8530.91833540',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '65536',
                    MatrixHeight: '65536'
                },
                {
                    'ows:Identifier': '17',
                    ScaleDenominator: '4265.45916770',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '131072',
                    MatrixHeight: '131072'
                },
                {
                    'ows:Identifier': '18',
                    ScaleDenominator: '2132.72958385',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '262144',
                    MatrixHeight: '262144'
                },
                {
                    'ows:Identifier': '19',
                    ScaleDenominator: '1066.36479193',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '524288',
                    MatrixHeight: '524288'
                },
                {
                    'ows:Identifier': '20',
                    ScaleDenominator: '533.18239597',
                    TopLeftCorner: '-20037508.3428 20037508.3428',
                    TileWidth: '256',
                    TileHeight: '256',
                    MatrixWidth: '1048576',
                    MatrixHeight: '1048576'
                }
            ]
        }
    ],
    bbox: {
        crs: 'EPSG:4326',
        bounds: {
            minx: '8.782379',
            miny: '46.358770',
            maxx: '17.5',
            maxy: '49.037872'
        }
    },
    links: [],
    params: {},
    allowedSRS: {
        'EPSG:3857': true
    },
    id: 'geolandbasemap__5',
    loading: false,
    loadingError: false
}
