
import expect from 'expect';
import {selector } from '../FeatureEditor';


describe('FeatureEditor plugin component', () => {
    describe('test selector', () => {
        const BASE_STATE = {
            featuregrid: {
                editingAllowedRoles: ["ADMIN"],
                filters: {},
                enableColumnFilters: true,
                open: false,
                canEdit: false,
                focusOnEdit: false,
                mode: "view",
                changes: {},
                pagination: {
                    page: 0,
                    size: 20
                },
                select: [],
                multiselect: false,
                drawing: false,
                newFeatures: [],
                features: [],
                dockSize: 0.35
            }
        };
        const props = {
            id: 'id'
        };
        const BASE_EXPECTED = {
            open: false,
            customEditorsOptions: undefined,
            autocompleteEnabled: undefined,
            url: undefined,
            typeName: undefined,
            features: [],
            describe: undefined,
            featurePropertiesJSONSchema: undefined,
            fields: [],
            attributes: undefined,
            tools: undefined,
            select: [],
            mode: 'view',
            changes: {},
            newFeatures: [],
            hasChanges: false,
            focusOnEdit: false,
            enableColumnFilters: true,
            pagination: { startIndex: undefined, maxFeatures: undefined, resultSize: undefined, totalFeatures: undefined },
            pages: undefined,
            size: 20
        };
        it('base state', () => {
            expect(BASE_EXPECTED).toEqual(BASE_EXPECTED);
        });

        it('customEditorsOptions', () => {
            const EDITOR_OPTIONS = {
                rules: [{
                    regex: {
                        attribute: 'NAME_OF_THE_ATTRIBUTE',
                        url: 'regex to match a specific url',
                        typeName: 'layerName'
                    },
                    editor: 'DropDownEditor'
                }]
            };
            const state = {
                ...BASE_STATE,
                featuregrid: {
                    ...BASE_STATE.featuregrid,
                    customEditorsOptions: EDITOR_OPTIONS
                }
            };
            const result = selector(state, props);
            expect(result).toEqual({
                ...BASE_EXPECTED,
                customEditorsOptions: EDITOR_OPTIONS
            });
        });
        it('fields', () => {
            const FIELDS = [{
                name: 'NAME_OF_THE_ATTRIBUTE',
                alias: 'Alias',
                type: 'string'
            }];
            const state = {
                ...BASE_STATE,
                featuregrid: {
                    ...BASE_STATE.featuregrid,
                    selectedLayer: 'id'
                },
                layers: {
                    flat: [{
                        id: 'id',
                        name: 'name',
                        title: 'title',
                        fields: FIELDS
                    }]
                }
            };
            const result = selector(state, props);
            expect(result.fields).toEqual(FIELDS);
        });
    });
});


