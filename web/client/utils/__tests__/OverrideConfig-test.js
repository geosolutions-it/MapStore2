// import { updateOverrideConfig } from './yourModule'; // Import the function
// import { SESSION_IDS } from './yourConstants'; // Assuming SESSION_IDS is imported from another file
import expect from 'expect';
import { SESSION_IDS, updateOverrideConfig } from "../ConfigUtils";

describe('updateOverrideConfig', () => {
    let originalConfig;
    let override;

    beforeEach(() => {
        originalConfig = {
            catalogServices: {
                services: {
                    gs_stable_csw: { url: 'https://gs-stable.geo-solutions.it/geoserver/csw', type: 'csw' },
                    gs_stable_wms: { url: 'https://gs-stable.geo-solutions.it/geoserver/wms', type: 'wms' }
                }
            },
            widgetsConfig: { widgets: [], layouts: { md: [], xxs: [] } },
            featureGrid: { attributes: {} },
            context: { userPlugins: [{ name: 'Tutorial', active: false }] },
            map: {
                layers: [
                    { id: 'osm:osm_simple_light__0', group: 'background' },
                    { id: 'osm:osm__2', group: 'background', name: 'osm:osm' }
                ],
                zoom: 6,
                center: { x: 14.186730225464526, y: 41.59351689233117, crs: 'EPSG:4326' },
                text_search_config: null,
                bookmark_search_config: {
                    bookmarks: [
                        {
                            options: { west: -28.43026376769848, south: 25.350469614189482, east: 54.45059560730153, north: 54.99431210280781 },
                            title: 'ewu',
                            layerVisibilityReload: false
                        }
                    ]
                }
            }
        };

        override = {
            version: 2,
            map: {
                zoom: 6,
                center: { x: 14.186730225464526, y: 41.59351689233117, crs: 'EPSG:4326' },
                layers: [
                    { id: 'background1', group: 'background' },
                    {name: "measurements"},
                    { id: 'otherLayer'  },
                    {id: 'annotations'}
                ],
                text_search_config: { query: 'some search query' },
                bookmark_search_config: {
                    bookmarks: [
                        {
                            options: { west: -28.43026376769848, south: 25.350469614189482, east: 54.45059560730153, north: 54.99431210280781 },
                            title: 'ewu',
                            layerVisibilityReload: false
                        }
                    ]
                }
            },
            catalogServices: { services: { gs_stable_csw: { url: 'https://gs-stable.geo-solutions.it/geoserver/csw', type: 'csw' } } },
            widgetsConfig: { widgets: [{ type: 'widget1', value: 'value1' }], layouts: { md: [], xxs: [] } },
            featureGrid: { attributes: { col1: {}, col2: {} } },
            context: { userPlugins: [{ name: 'Tutorial', active: false }] }
        };
    });

    it('should clear everything when SESSION_IDS.EVERYTHING is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.EVERYTHING], originalConfig);
        expect(result).toEqual({});
    });

    it('should clear map zoom and center when SESSION_IDS.MAP_POS is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.MAP_POS], originalConfig);
        expect(result.map.zoom).toBe(undefined);
        expect(result.map.center).toBe(undefined);
    });

    it('should clear visualization mode when SESSION_IDS.VISUALIZATION_MODE is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.VISUALIZATION_MODE], originalConfig);
        expect(result.map.visualizationMode).toBe(undefined);
    });

    it('should clear annotation layers when SESSION_IDS.ANNOTATIONS_LAYER is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.ANNOTATIONS_LAYER], originalConfig);
        expect(result.map.layers).toEqual([
            { id: 'background1', group: 'background' },
            {name: "measurements"},
            { id: 'otherLayer'  }
        ]);
    });

    it('should clear measurement layers when SESSION_IDS.MEASUREMENTS_LAYER is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.MEASUREMENTS_LAYER], originalConfig);
        expect(result.map.layers).toEqual([
            { id: 'background1', group: 'background' },
            { id: 'otherLayer'  },
            {id: 'annotations'}
        ]);
    });
    it('should clear background layer and add background layers from OriginalConfig when SESSION_IDS.MEASUREMENTS_LAYER is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.BACKGROUND_LAYERS], originalConfig);
        expect(result.map.layers).toEqual([
            { id: 'osm:osm_simple_light__0', group: 'background' },
            { id: 'osm:osm__2', group: 'background', name: 'osm:osm' },
            {name: "measurements"},
            { id: 'otherLayer' },
            {id: 'annotations'}
        ]);
    });

    it('should clear catalogServices when SESSION_IDS.CATALOG_SERVICES is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.CATALOG_SERVICES], originalConfig);
        expect(result.catalogServices).toBe(undefined);
    });

    it('should clear widgetsConfig when SESSION_IDS.WIDGETS is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.WIDGETS], originalConfig);
        expect(result.widgetsConfig).toBe(undefined);
    });

    it('should clear text search config when SESSION_IDS.TEXT_SEARCH_SERVICES is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.TEXT_SEARCH_SERVICES], originalConfig);
        expect(result.map.text_search_config).toBe(undefined);
    });

    it('should clear bookmark search config when SESSION_IDS.BOOKMARKS is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.BOOKMARKS], originalConfig);
        expect(result.map.bookmark_search_config).toBe(undefined);
    });

    it('should clear feature grid when SESSION_IDS.FEATURE_GRID is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.FEATURE_GRID], originalConfig);
        expect(result.featureGrid.attributes).toEqual({});
    });

    it('should clear userPlugins when SESSION_IDS.USER_PLUGINS is in thingsToClear', () => {
        const result = updateOverrideConfig(override, [SESSION_IDS.USER_PLUGINS], originalConfig);
        expect(result.context.userPlugins).toBe(undefined);
    });

    it('should apply custom handlers correctly', () => {
        const customHandlers = [
            "toc"
        ];
        const customOverride = { ...override, toc: {
            "theme": "legend"
        } };

        const result = updateOverrideConfig(customOverride, ['toc'], originalConfig, customHandlers);
        expect(result.customConfig).toBe(undefined);
    });
});

