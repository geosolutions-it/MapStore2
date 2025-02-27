/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    newContextSelector,
    creationStepSelector,
    selectedThemeSelector,
    customVariablesEnabledSelector,
    isNewContext,
    prefetchedDataSelector,
    disableImportSelector,
    generateContextResource,
    isNewPluginsUploaded
} from '../contextcreator';

const testState = {
    contextcreator: {
        newContext: {
            name: 'name'
        },
        stepId: 'step',
        customVariablesEnabled: true,
        contextId: 'new'
    }
};

describe('contextcreator selectors', () => {
    it('newContextSelector', () => {
        expect(newContextSelector(testState)).toEqual({
            name: 'name'
        });
    });
    it('creationStepSelector', () => {
        expect(creationStepSelector(testState)).toBe('step');
    });
    it('customVariablesEnabledSelector', () => {
        expect(customVariablesEnabledSelector(testState)).toBe(true);
    });
    it('selectedThemeSelector', () => {
        const themeDark = {
            id: 'dark',
            label: 'Dark',
            type: 'link',
            href: 'dist/themes/dark.css'
        };
        expect(selectedThemeSelector(testState)).toBeFalsy();
        expect(selectedThemeSelector({
            ...testState,
            contextcreator: {
                ...testState.contextcreator,
                selectedTheme: themeDark
            }
        })).toEqual(themeDark);
    });
    it('isNewContext', () => {
        expect(isNewContext(testState)).toBe(true);
    });
    it('prefetchedDataSelector', () => {
        const prefetchedData = {resource: {name: "test"}};
        expect(prefetchedDataSelector({
            contextcreator: {
                prefetchedData
            }
        })).toEqual(prefetchedData);
    });
    it('disableImportSelector', () => {
        expect(disableImportSelector({
            contextcreator: {
                stepId: "general-settings"
            }
        })).toBeFalsy();
        expect(disableImportSelector({
            contextcreator: {
                stepId: "configure-map"
            }
        })).toBeTruthy();
    });
    it('generateContextResource', () => {
        expect(generateContextResource({})).toEqual({
            category: 'CONTEXT',
            data: {
                mapConfig: {},
                theme: undefined,
                customVariablesEnabled: false,
                plugins: { desktop: [] },
                userPlugins: []
            },
            metadata: {
                name: undefined
            }
        });
        const source = {
            map: {
                present: {
                    center: [20, 21],
                    maxExtent: [0, 0, 0, 0],
                    projection: 'EPSG:4326',
                    units: 'meters',
                    mapInfoControl: {},
                    zoom: 10,
                    mapOptions: {},
                    layers: [],
                    groups: [],
                    backgrounds: [],
                    text_search_config: undefined,
                    bookmark_search_config: undefined
                }
            },
            contextcreator: {
                plugins: [{ name: 'Map' }],
                customVariablesEnabled: true,
                selectedTheme: {
                    variables: {
                        'ms-main-color': '#000000',
                        'ms-main-bg': '#9b3232',
                        'ms-primary-contrast': '#FFFFFF',
                        'ms-primary': '#0D7185',
                        'ms-success-contrast': '#FFFFFF',
                        'ms-success': '#398439'
                    }
                }
            }
        };
        const expected = {
            category: 'CONTEXT',
            data: {
                mapConfig: {
                    version: 2,
                    map: {
                        center: [20, 21],
                        maxExtent: [0, 0, 0, 0],
                        projection: 'EPSG:4326',
                        units: 'meters',
                        mapInfoControl: {},
                        zoom: 10,
                        mapOptions: {},
                        layers: [],
                        groups: [],
                        backgrounds: [],
                        text_search_config: undefined,
                        bookmark_search_config: undefined
                    },
                    catalogServices: {
                        services: undefined,
                        selectedService: undefined
                    },
                    widgetsConfig: {
                        widgets: undefined,
                        layouts: undefined,
                        collapsed: undefined
                    },
                    mapInfoConfiguration: {},
                    dimensionData: {
                        currentTime: undefined,
                        offsetTime: undefined
                    },
                    timelineData: {
                        selectedLayer: undefined,
                        endValuesSupport: undefined,
                        snapRadioButtonEnabled: false,
                        layers: undefined
                    },
                    featureGrid: {
                        attributes: undefined
                    },
                    toc: undefined
                },
                theme: {
                    variables: {
                        'ms-main-color': '#000000',
                        'ms-main-bg': '#9b3232',
                        'ms-primary-contrast': '#FFFFFF',
                        'ms-primary': '#0D7185',
                        'ms-success-contrast': '#FFFFFF',
                        'ms-success': '#398439'
                    }
                },
                customVariablesEnabled: true,
                plugins: { desktop: [] },
                userPlugins: []
            },
            metadata: { name: undefined }
        };
        const generatedSource = generateContextResource(source);
        expect(generatedSource.data.mapConfig.map).toEqual(expected.data.mapConfig.map);
        expect(generatedSource.data.plugins).toEqual(expected.data.plugins);
        expect(generatedSource.data.plugins).toEqual(expected.data.plugins);
        expect(generatedSource.data.theme).toEqual(expected.data.theme);
    });
    it('loadExtensionsSelector', () => {
        expect(isNewPluginsUploaded({
            contextcreator: {
                uploadedPlugins: ["Name"]
            }
        })).toBeTruthy();
        expect(isNewPluginsUploaded({
            contextcreator: {
                uploadedPlugins: []
            }
        })).toBeFalsy();
    });
});
