
import { getCapabilitiesUrl } from "../LayersUtils";
import * as Cesium from 'cesium';

const {
    defined,
    DeveloperError,
    Credit,
    Resource,
    Ellipsoid,
    GeographicTilingScheme,
    WebMercatorTilingScheme,
    TerrainProvider,
    HeightmapTerrainData,
    Event,
    Request
} = Cesium;

let tilesCache = {};

const OGCHelper = {
    CRS: [
        {
            name: "CRS:84",
            ellipsoid: Ellipsoid.WGS84,
            firstAxeIsLatitude: false,
            tilingScheme: GeographicTilingScheme,
            supportedCRS: "urn:ogc:def:crs:OGC:2:84"
        },
        {
            name: "EPSG:4326",
            ellipsoid: Ellipsoid.WGS84,
            firstAxeIsLatitude: true,
            tilingScheme: GeographicTilingScheme,
            SupportedCRS: "urn:ogc:def:crs:EPSG::4326"
        },
        {
            name: "EPSG:3857",
            ellipsoid: Ellipsoid.WGS84,
            firstAxeIsLatitude: false,
            tilingScheme: WebMercatorTilingScheme,
            SupportedCRS: "urn:ogc:def:crs:EPSG::3857"
        },
        {
            name: "OSGEO:41001",
            ellipsoid: Ellipsoid.WGS84,
            firstAxeIsLatitude: false,
            tilingScheme: WebMercatorTilingScheme,
            SupportedCRS: "urn:ogc:def:crs:EPSG::3857"
        }
    ],
    FormatArray: [
        {
            format: "image/bil",
            /**
            * bufferIn : buffer to process (switch byte order and check the data limitations)
            * size: defines the dimension of the array (size.height* size.width cells)
            * highest: defines the highest altitude (without offset) of the data.
            * lowest: defines the lowest altitude (without offset) of the data.
            * offset: defines the offset of the data in order adjust the limitations
            * littleEndian: defines whether buffer is in little or big endian
            */
            postProcessArray: function(bufferIn, size, highest, lowest, offset, littleEndian) {
                let output;
                let viewerIn = new DataView(bufferIn);
                let littleEndianBuffer = new ArrayBuffer(size.height * size.width * 2);
                let viewerOut = new DataView(littleEndianBuffer);
                if (littleEndianBuffer.byteLength === bufferIn.byteLength) {
                    // time to switch bytes!!
                    let temp;
                    for (let i = 0; i < littleEndianBuffer.byteLength; i += 2) {
                        temp = viewerIn.getInt16(i, littleEndian) - offset;
                        if (temp > lowest && temp < highest) {
                            viewerOut.setInt16(i, temp, true);
                        } else {
                            viewerOut.setInt16(i, 0, true);
                        }
                    }
                    output = new Int16Array(littleEndianBuffer);
                }
                return output;
            }
        }
    ]
};

const AVAILABLE_CRS_NAMES = OGCHelper.CRS.map(({ name }) => name);

function optionsHasMetadata(options) {
    return (
        defined(options.url) &&
        defined(options.layerName) &&
        defined(options.crs)
    );
}

function getMetadataDescription(options) {
    if (!defined(options.layerName)) {
        throw new DeveloperError('options.layerName is required.');
    }

    let url = options.url;
    const layerName = options.layerName;
    const version = options.version || '1.3.0';
    const crs = options.crs;
    let fixedHeight = options.fixedHeight;
    let fixedWidth = options.fixedWidth;

    let CRS = undefined;
    let firstAxeIsLatitude = undefined;
    let isNewVersion = undefined;

    const parsedOptions = {};

    parsedOptions.proxy = options.proxy;
    parsedOptions.sampleTerrainZoomLevel = options.sampleTerrainZoomLevel ?? 18;
    parsedOptions.heightMapWidth = options.heightMapWidth ?? 65;
    parsedOptions.heightMapHeight = options.heightMapHeight ?? parsedOptions.heightMapWidth;
    parsedOptions.littleEndian = options.littleEndian;
    parsedOptions.tilingScheme = undefined;
    parsedOptions.ready = false;
    parsedOptions.waterMask = options.waterMask ?? false;
    parsedOptions.offset = options.offset ?? 0;
    parsedOptions.highest = options.highest ?? 12000;
    parsedOptions.lowest = options.lowest ?? -500;

    if (typeof (parsedOptions.waterMask) !== 'boolean') {
        parsedOptions.waterMask = false;
    }

    // Version
    if (version !== null) {
        isNewVersion = /^1\.[3-9]\./.test(version);
    }

    // URL
    const index = url.indexOf("?");
    if (index > -1) {
        url = url.substring(0, index);
    }

    // GetMap format
    const nodeFormat = 'image/bil';
    const OGCAvailable = OGCHelper.FormatArray.filter(function(elt) {
        return elt.format === nodeFormat;
    });

    if (OGCAvailable.length > 0) {
        parsedOptions.formatArray = OGCAvailable[0];
    }

    if (defined(parsedOptions.formatArray)
        && typeof (parsedOptions.formatArray.format) === 'string'
        && typeof (parsedOptions.formatArray.postProcessArray) === 'function') {
        parsedOptions.formatArray.terrainDataStructure = {
            heightScale: 1.0,
            heightOffset: 0,
            elementsPerHeight: 1,
            stride: 1,
            elementMultiplier: 256.0,
            isBigEndian: false
        };
    } else {
        parsedOptions.formatArray = undefined;
        throw new DeveloperError('format not supported.');
    }

    if (defined(fixedHeight) && defined(fixedWidth)) {
        // Map height
        fixedHeight = parseFloat(fixedHeight);
        parsedOptions.heightMapHeight = fixedHeight > 0 && fixedHeight < parsedOptions.heightMapHeight
            ? fixedHeight
            : parsedOptions.heightMapHeight;
        // Map width
        fixedWidth = parseFloat(fixedWidth);
        parsedOptions.heightMapWidth = fixedWidth > 0 && fixedWidth < parsedOptions.heightMapWidth
            ? fixedWidth
            : parsedOptions.heightMapWidth;
    }

    if (defined(crs) && defined(version)) {
        let found = false;
        for (let n = 0; n < OGCHelper.CRS.length && !found; n++) {
            const CRSSelected = OGCHelper.CRS[n];
            let referentialName = CRSSelected.name;
            if (referentialName === crs) {
                CRS = referentialName;
                firstAxeIsLatitude = CRSSelected.firstAxeIsLatitude;
                const TilingScheme = CRSSelected.tilingScheme;
                parsedOptions.tilingScheme = new TilingScheme({ ellipsoid: CRSSelected.ellipsoid });
                parsedOptions.getTileDataAvailable = function() {
                    return true;
                };
                found = true;
            }
        }

        parsedOptions.ready = found
            && defined(parsedOptions.formatArray)
            && defined(version);
    }

    if (parsedOptions.ready) {

        let urlTemplate = url + '?SERVICE=WMS&REQUEST=GetMap' +
            '&layers=' + layerName +
            '&version=' + version +
            '&bbox=';

        if (isNewVersion && firstAxeIsLatitude) {
            urlTemplate += '{south},{west},{north},{east}';
        } else {
            urlTemplate += '{west},{south},{east},{north}';
        }

        urlTemplate += '&crs=' + CRS + '&srs=' + CRS;

        if (parsedOptions.formatArray) {
            let urlTemplateArray = urlTemplate +
                '&format=' + parsedOptions.formatArray.format +
                '&width=' + parsedOptions.heightMapWidth +
                '&height=' + parsedOptions.heightMapHeight;
            parsedOptions.getURLtemplateArray = function() { return urlTemplateArray; };
        }
    }

    parsedOptions.levelZeroMaximumGeometricError = TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(
        parsedOptions.tilingScheme.ellipsoid,
        parsedOptions.heightMapWidth,
        parsedOptions.tilingScheme.getNumberOfXTilesAtLevel(0)
    );

    return {
        ...options,
        ...parsedOptions
    };
}

function fromWSMCapabilitiesToOptions(capabilities, { isWorkSpaceCapabilities, ...options }) {
    if (!(capabilities instanceof XMLDocument)) {
        throw new DeveloperError('xml must be a XMLDocument');
    }

    if (!defined(options.layerName)) {
        throw new DeveloperError('description.layerName is required.');
    }

    let version = '1.3.0';
    const versionNode = capabilities.querySelector('[version]');
    if (versionNode !== null) {
        version = versionNode.getAttribute('version');
    }

    const isImageBilFormatSupported = !![...capabilities.querySelectorAll("Request>GetMap>Format")]
        .map(nodeFormat => nodeFormat.textContent)
        .find(format => format === 'image/bil');

    if (!isImageBilFormatSupported) {
        throw new DeveloperError('image/bil format is not supported');
    }

    const layerNodes = [...capabilities.querySelectorAll("Layer[queryable='1'],Layer[queryable='true']")];
    const layerNode = layerNodes.find((node) => {
        const name = node.querySelector('Name').textContent;
        if (isWorkSpaceCapabilities) {
            const layerName = options.layerName.split(':')[1];
            return layerName === name;
        }
        return options.layerName === name;
    });

    const crs = [...layerNode.querySelectorAll("CRS")]
        .map((crsNode) => crsNode.textContent)
        .find(crsName => AVAILABLE_CRS_NAMES.includes(crsName));

    if (!crs) {
        throw new DeveloperError('available crs are not supported');
    }

    const fixedHeight = layerNode.getAttribute("fixedHeight");
    const fixedWidth = layerNode.getAttribute("fixedWidth");

    return {
        ...options,
        fixedHeight,
        fixedWidth,
        crs,
        version
    };
}

async function parseOptions(options) {
    if (optionsHasMetadata(options)) {
        return getMetadataDescription(options);
    }
    if (defined(options.url)) {
        let severUrl = options.url;
        const index = severUrl.lastIndexOf("?");
        if (index > -1) {
            severUrl = severUrl.substring(0, index);
        }
        const urlGetCapabilities = `${severUrl}?SERVICE=WMS&REQUEST=GetCapabilities&tiled=true`;
        let updatedCapabilitiesUrl = getCapabilitiesUrl({ url: urlGetCapabilities, name: options.layerName});
        const isWorkSpaceCapabilities = updatedCapabilitiesUrl !== urlGetCapabilities;

        const xml = await Resource.fetchXML({
            url: updatedCapabilitiesUrl,
            proxy: options.proxy,
            queryParameters: options.params
        });
        return getMetadataDescription(
            fromWSMCapabilitiesToOptions(xml, { ...options, isWorkSpaceCapabilities })
        );
    }
    return Promise.reject(new DeveloperError('either options.url or options.layerName are required.'));
}

function templateToURL(urlParam, x, y, level, options) {

    const rect = options.tilingScheme.tileXYToNativeRectangle(x, y, level);
    const xSpacing = (rect.east - rect.west) / (options.heightMapWidth - 1);
    const ySpacing = (rect.north - rect.south) / (options.heightMapHeight - 1);
    rect.west -= xSpacing * 0.5;
    rect.east += xSpacing * 0.5;
    rect.south -= ySpacing * 0.5;
    rect.north += ySpacing * 0.5;

    const yTiles = options.tilingScheme.getNumberOfYTilesAtLevel(level);
    const tmsY = (yTiles - y - 1);

    return urlParam
        .replace("{south}", rect.south)
        .replace("{north}", rect.north)
        .replace("{west}", rect.west)
        .replace("{east}", rect.east)
        .replace("{x}", x)
        .replace("{y}", y)
        .replace("{tmsY}", tmsY);
}

function terrainChildrenMask(x, y, level, options) {
    let mask = 0;
    const childLevel = level + 1;
    mask |= options.getTileDataAvailable(2 * x, 2 * y, childLevel) ? 1 : 0;
    mask |= options.getTileDataAvailable(2 * x + 1, 2 * y, childLevel) ? 2 : 0;
    mask |= options.getTileDataAvailable(2 * x, 2 * y + 1, childLevel) ? 4 : 0;
    mask |= options.getTileDataAvailable(2 * x + 1, 2 * y + 1, childLevel) ? 8 : 0;
    return mask;
}

/**
 * Cesium terrain provider for GeoServer layer configured with the dds/bil extension
 * @name GeoServerBILTerrainProvider
 * @param {object} options Configuration options for the provider
 */
function GeoServerBILTerrainProvider(options) {

    this._errorEvent = new Event();

    let credit = options.credit;
    if (typeof credit === "string") {
        credit = new Credit(credit);
    }
    this._credit = credit;

    this._availability = undefined;
    this._tileCredits = undefined;
    this._options = options;
}

/**
 * Creates a GeoServerBILTerrainProvider from a URL to a GeoServer WMS endpoint
 * @param {string} url: WMS endpoint of the GeoServer
 * @param {object} options: configuration options for the provider
 * @param {string} options.layerName: name of the terrain layer (bil extension must be configured)
 * @param {string} options.crs: projection of the layer, support only CRS:84 | EPSG:4326 | EPSG:3857 | OSGEO:41001
 * @param {string} options.version: version used for the WMS request, default 1.3.0
 * @param {object} options.proxy: object that include the getURL function to modify the request url and apply a proxy url, eg. { getURL: url => url }
 * @param {number} options.sampleTerrainZoomLevel: zoom level used to perform sampleTerrain and get the height value given a point, used by measure components, default 18
 * @param {boolean} options.waterMask: indicates if a water mask will be displayed (experimental)
 * @param {number} options.littleEndian: defines whether buffer is in little or big endian
 * @param {number} options.heightMapWidth: width  of a tile in pixels, default value 65
 * @param {number} options.heightMapHeight: height of a tile in pixels, default value 65
 * @param {number} options.offset: offset of the tiles (in meters), default value 0
 * @param {number} options.highest: highest altitude in the tiles (in meters), default value 12000
 * @param {number} options.lowest: lowest altitude in the tiles (in meters), default value -500
 */
GeoServerBILTerrainProvider.fromUrl = async function(url, options) {
    const mergedOptions = {
        ...options,
        url: url
    };
    const parsedOptions = await parseOptions(mergedOptions);
    const provider = new GeoServerBILTerrainProvider(parsedOptions);
    return provider;
};

GeoServerBILTerrainProvider.prototype.getHeightmapTerrainDataArray = function(x, y, level) {
    if (!isNaN(x + y + level)) {
        const urlValue = templateToURL(this._options.getURLtemplateArray(x, y, level), x, y, level, this._options);
        const limitations = { highest: this._options.highest, lowest: this._options.lowest, offset: this._options.offset };
        const hasChildren = terrainChildrenMask(x, y, level, this._options);
        if (tilesCache[urlValue]) {
            return Promise.resolve(new HeightmapTerrainData(tilesCache[urlValue]));
        }
        const proxy = this._options.proxy || { getURL: v => v };
        const requestPromise = Resource.fetchArrayBuffer({
            url: urlValue,
            proxy: proxy,
            headers: this._options.headers,
            queryParameters: this._options.params,
            request: new Request({
                // we need to disable throttle
                // if the current level matches the zoom used by sample terrain
                throttleByServer: this._options.sampleTerrainZoomLevel !== level
            })
        });

        if (defined(requestPromise)) {
            return requestPromise
                .then((arrayBuffer) => {
                    tilesCache[urlValue] = this.arrayToHeightmapTerrainDataOptions(
                        arrayBuffer,
                        limitations,
                        {
                            width: this._options.heightMapWidth,
                            height: this._options.heightMapHeight
                        },
                        this._options.formatArray,
                        this._options.waterMask,
                        this._options.littleEndian,
                        hasChildren
                    );
                    return new HeightmapTerrainData(tilesCache[urlValue]);
                })
                .catch(() => {
                    return new HeightmapTerrainData({
                        buffer: new Uint16Array(this._options.heightMapWidth * this._options.heightMapHeight),
                        width: this._options.heightMapWidth,
                        height: this._options.heightMapHeight,
                        childTileMask: hasChildren,
                        waterMask: new Uint8Array(this._options.heightMapWidth * this._options.heightMapHeight),
                        structure: this._options.formatArray.terrainDataStructure
                    });
                });
        }
    }
    return Promise.resolve(undefined);
};

GeoServerBILTerrainProvider.prototype.arrayToHeightmapTerrainDataOptions = function(arrayBuffer, limitations, size, formatArray, hasWaterMask, littleEndian, childrenMask) {
    let sizeValue = size;
    if (typeof (sizeValue) === "number") {
        sizeValue = { width: sizeValue, height: sizeValue };
    }
    const heightBuffer = formatArray.postProcessArray(
        arrayBuffer,
        sizeValue,
        limitations.highest,
        limitations.lowest,
        limitations.offset,
        littleEndian
    );
    if (!defined(heightBuffer)) {
        throw new DeveloperError("no good size");
    }
    const optionsHeihtmapTerrainData = {
        buffer: heightBuffer,
        width: sizeValue.width,
        height: sizeValue.height,
        childTileMask: childrenMask,
        structure: formatArray.terrainDataStructure
    };
    if (hasWaterMask) {
        const waterMask = new Uint8Array(heightBuffer.length);
        for (let i = 0; i < heightBuffer.length; i++) {
            if (heightBuffer[i] <= 0) {
                waterMask[i] = 255;
            }
        }
        optionsHeihtmapTerrainData.waterMask = waterMask;
    }
    return optionsHeihtmapTerrainData;
};

GeoServerBILTerrainProvider.prototype.requestTileGeometry = function(x, y, level) {
    if (!defined(this._options.getURLtemplateArray)) {
        throw new DeveloperError(
            "getURLtemplateArray function is not available."
        );
    }
    return this.getHeightmapTerrainDataArray(x, y, level);
};

GeoServerBILTerrainProvider.prototype.getLevelMaximumGeometricError = function(level) {
    return this._options.levelZeroMaximumGeometricError / (1 << level);
};

GeoServerBILTerrainProvider.prototype.getTileDataAvailable = function(x, y, level) {
    return this._options.getTileDataAvailable(x, y, level);
};

Object.defineProperties(GeoServerBILTerrainProvider.prototype, {
    errorEvent: {
        get: function() {
            return this._errorEvent;
        }
    },
    credit: {
        get: function() {
            return this._credit;
        }
    },
    tilingScheme: {
        get: function() {
            return this._options.tilingScheme;
        }
    },
    hasWaterMask: {
        get: function() {
            return this._options.waterMask;
        }
    },
    hasVertexNormals: {
        get: function() {
            return false;
        }
    },
    hasMetadata: {
        get: function() {
            return false;
        }
    },
    availability: {
        get: function() {
            return false;
        }
    },
    sampleTerrainZoomLevel: {
        get: function() {
            return this._options.sampleTerrainZoomLevel;
        }
    }
});

export default GeoServerBILTerrainProvider;
