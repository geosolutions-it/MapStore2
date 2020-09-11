/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { get, head, isArray, template } = require('lodash');
const { success, error } = require('../actions/notifications');
const { UPDATE_NODE, updateNode, updateSettingsParams } = require('../actions/layers');
const { updateAdditionalLayer, removeAdditionalLayer, updateOptionsByOwner } = require('../actions/additionallayers');
const { getDescribeLayer } = require('../actions/layerCapabilities');
const { getLayerCapabilities } = require('../observables/wms');
const { setControlProperty } = require('../actions/controls');
const { findGeoServerName, formatCapabitiliesOptions } = require('../utils/LayersUtils');

const {
    SELECT_STYLE_TEMPLATE,
    updateTemporaryStyle,
    TOGGLE_STYLE_EDITOR,
    resetStyleEditor,
    UPDATE_STATUS,
    loadingStyle,
    LOADED_STYLE,
    loadedStyle,
    CREATE_STYLE,
    updateStatus,
    selectStyleTemplate,
    errorStyle,
    UPDATE_STYLE_CODE,
    EDIT_STYLE_CODE,
    DELETE_STYLE,
    setEditPermissionStyleEditor,
    SET_DEFAULT_STYLE,
    initStyleService,
    updateEditorMetadata
} = require('../actions/styleeditor');

const StylesAPI = require('../api/geoserver/Styles').default;
const LayersAPI = require('../api/geoserver/Layers');

const {
    temporaryIdSelector,
    codeStyleSelector,
    formatStyleSelector,
    languageVersionStyleSelector,
    statusStyleSelector,
    selectedStyleSelector,
    enabledStyleEditorSelector,
    loadingStyleSelector,
    styleServiceSelector,
    getUpdatedLayer,
    editorMetadataSelector,
    selectedStyleMetadataSelector
} = require('../selectors/styleeditor');

const { getSelectedLayer, layerSettingSelector } = require('../selectors/layers');
const { generateTemporaryStyleId, generateStyleId, STYLE_OWNER_NAME, getNameParts } = require('../utils/StyleEditorUtils');
const { initialSettingsSelector, originalSettingsSelector } = require('../selectors/controls');
const { updateStyleService } = require('../api/StyleEditor');
/*
 * Observable to get code of a style, it works only in edit status
 */
const getStyleCodeObservable = ({status, styleName, baseUrl}) =>
    status === 'edit' ?
        Rx.Observable.defer(() =>
            StylesAPI.getStyleCodeByName({
                baseUrl,
                styleName
            })
        )
            .switchMap(style => Rx.Observable.of(
                selectStyleTemplate({
                    languageVersion: style.languageVersion,
                    code: style.code,
                    templateId: '',
                    format: style.format,
                    init: true
                })
            ))
            .catch(err => Rx.Observable.of(errorStyle('edit', err)))
        : Rx.Observable.empty();
/*
 * This function returns an observable that delete styles.
 */
const deleteStyle = ({styleName, baseUrl, onSuccess$, onError$}) =>
    Rx.Observable.defer(() =>
        StylesAPI.deleteStyle({
            baseUrl,
            styleName
        })
    )
        .switchMap(() => onSuccess$ || Rx.Observable.empty())
        .catch(() => onError$ || Rx.Observable.empty());
/*
 * Observable to delete temporary style from server and reset state of style editor
 */
const resetStyleEditorObservable = state => {
    const styleName = temporaryIdSelector(state);
    const { baseUrl = '' } = styleServiceSelector(state);
    return Rx.Observable.of(
        resetStyleEditor(),
        removeAdditionalLayer({ owner: STYLE_OWNER_NAME })
    )
        .merge(styleName ? deleteStyle({styleName, baseUrl}) : Rx.Observable.empty());
};
/*
 * Observable to add a style to available style list and update the layer object on the server
 */
const updateAvailableStylesObservable = ({baseUrl, layer, styleName, format, title, _abstract, metadata}) =>
    Rx.Observable.defer(() =>
        LayersAPI.updateAvailableStyles({
            baseUrl,
            layerName: layer.name,
            styles: [{ name: styleName }]
        })
    )
        .switchMap(() => {
            const newStyle = {
                filename: `${styleName}.${format}`,
                format,
                name: styleName,
                title,
                _abstract,
                ...(metadata && { metadata })
            };
            const defaultStyle = head(layer.availableStyles);
            const availableStyles = layer.availableStyles && [defaultStyle, newStyle, ...layer.availableStyles.filter((sty, idx) => idx > 0)] || [newStyle];
            return Rx.Observable.of(
                updateSettingsParams({ availableStyles }, true),
                loadedStyle()
            );
        })
        .catch(() => Rx.Observable.of(loadedStyle()))
        .startWith(loadingStyle('global'));

/*
 * Observable to create/update style
 */
const createUpdateStyleObservable = ({baseUrl, update, code, format, styleName, status, languageVersion, options}, successActions = [], errorActions = []) =>
    Rx.Observable.defer(() =>
        StylesAPI[update ? 'updateStyle' : 'createStyle']({
            baseUrl,
            code,
            format,
            styleName,
            languageVersion,
            options
        })
    )
        .switchMap(() => isArray(successActions) && Rx.Observable.of(loadedStyle(), ...successActions) || successActions)
        .catch((err) => Rx.Observable.of(errorStyle(status, err), loadedStyle(), ...errorActions))
        .startWith(loadingStyle(status));

/*
 * Observable to verify if getLayerCapabilities/getDescribeLayer are correctly updated
 */
const updateLayerSettingsObservable = (action$, store, filter = () => true, startActions = [], endObservable = () => {}) =>
    Rx.Observable.of(loadingStyle('global'), ...startActions)
        .merge(
            action$.ofType(UPDATE_NODE)
                .filter(() => {
                    const layer = getSelectedLayer(store.getState());
                    return filter(layer);
                })
                .switchMap(() => {
                    const layer = getSelectedLayer(store.getState());
                    return endObservable(layer);
                })
                .catch(err => Rx.Observable.of(errorStyle('global', err), loadedStyle()))
                .takeUntil(action$.ofType(LOADED_STYLE))
        );

/**
 * Epics for Style Editor
 * @name epics.styleeditor
 * @type {object}
 */
module.exports = {
    /**
     * Gets every `TOGGLE_STYLE_EDITOR` event.
     * Initialize or reset style editor based on action.enabled.
     * Send a get capaibilities to retrieve availables style and then a rest style request for every
     * style to get all info needed (eg. format, filename, ...)
     * @param {external:Observable} action$ manages `TOGGLE_STYLE_EDITOR` and `UPDATE_NODE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    toggleStyleEditorEpic: (action$, store) =>
        action$.ofType(TOGGLE_STYLE_EDITOR)
            .filter(() => !loadingStyleSelector(store.getState()))
            .switchMap((action) => {

                const state = store.getState();
                const settings = layerSettingSelector(state);
                const isInitialized = !!get(settings, 'options.availableStyles');

                if (!action.enabled) return resetStyleEditorObservable(state);
                if (enabledStyleEditorSelector(state) && isInitialized) return Rx.Observable.empty();

                const layer = action.layer || getSelectedLayer(state);
                if (!layer || layer && !layer.url) return Rx.Observable.empty();

                const geoserverName = findGeoServerName(layer);
                if (!geoserverName) return Rx.Observable.empty();

                const layerUrl = layer.url.split(geoserverName);
                const baseUrl = `${layerUrl[0]}${geoserverName}`;
                const lastStyleService = styleServiceSelector(state);

                return Rx.Observable
                    .defer(() => updateStyleService({
                        baseUrl,
                        styleService: lastStyleService
                    }))
                    .switchMap((styleService) => {
                        const initialAction = [ initStyleService(styleService) ];
                        return getLayerCapabilities(layer)
                            .switchMap((capabilities) => {
                                const layerCapabilities = formatCapabitiliesOptions(capabilities);
                                if (!layerCapabilities.availableStyles) {
                                    return Rx.Observable.of(
                                        errorStyle('availableStyles', { status: 401 }),
                                        loadedStyle()
                                    );
                                }
                                const setAdditionalLayers = (availableStyles = []) =>
                                    Rx.Observable.of(
                                        updateAdditionalLayer(layer.id, STYLE_OWNER_NAME, 'override', {}),
                                        updateSettingsParams({ availableStyles }),
                                        updateNode(layer.id, 'layer', {...layerCapabilities, availableStyles}),
                                        loadedStyle()
                                    );
                                return Rx.Observable.defer(() =>
                                    StylesAPI.getStylesInfo({
                                        baseUrl,
                                        styles: layerCapabilities && layerCapabilities.availableStyles || []
                                    })
                                )
                                    .switchMap(availableStyles => setAdditionalLayers(availableStyles));
                            })
                            .startWith(...initialAction)
                            .catch((err) => Rx.Observable.of(errorStyle('global', err), loadedStyle()));
                    })
                    .startWith(loadingStyle('global'));
            }),
    /**
     * Gets every `UPDATE_STATUS` event.
     * If status is true a describe layer request is sent to get all feature properties needed.
     * If status is equal to 'edit' a rest style request is sent to get the style code.
     * @param {external:Observable} action$ manages `UPDATE_STATUS` and `UPDATE_NODE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    updateLayerOnStatusChangeEpic: (action$, store) =>
        action$.ofType(UPDATE_STATUS)
            .filter(({ status }) => !!status)
            .switchMap((action) => {

                const state = store.getState();

                const layer = getUpdatedLayer(state);

                const query = layer && layer.params || {};
                const describeAction = layer && !layer.describeFeatureType && getDescribeLayer(layer.url, layer, { query });
                const selectedStyle = selectedStyleSelector(state);
                const styleName = selectedStyle || layer.availableStyles && layer.availableStyles[0] && layer.availableStyles[0].name;

                const selectedStyleMetadata = selectedStyleMetadataSelector(state);
                const { baseUrl = '' } = styleServiceSelector(state);

                return describeAction && updateLayerSettingsObservable(action$, store,
                    updatedLayer => updatedLayer && updatedLayer.describeLayer,
                    [ describeAction ],
                    (updatedLayer) => {
                        return Rx.Observable.concat(
                            getStyleCodeObservable({
                                status: action.status,
                                styleName,
                                baseUrl
                            }),
                            Rx.Observable.of(
                                setEditPermissionStyleEditor(!(updatedLayer
                                        && updatedLayer.describeLayer
                                        && updatedLayer.describeLayer.error === 401)),
                                updateEditorMetadata({
                                    editorType: selectedStyleMetadata.msEditorType || 'textarea',
                                    styleJSON: selectedStyleMetadata.msStyleJSON
                                }),
                                loadedStyle()
                            )
                        );
                    }
                ) || Rx.Observable.concat(
                    getStyleCodeObservable({
                        status: action.status,
                        styleName,
                        baseUrl
                    }),
                    Rx.Observable.of(
                        updateEditorMetadata({
                            editorType: selectedStyleMetadata.msEditorType || 'textarea',
                            styleJSON: selectedStyleMetadata.msStyleJSON
                        })
                    ));
            }),
    /**
     * Gets every `SELECT_STYLE_TEMPLATE`, `EDIT_STYLE_CODE` events.
     * Creates/Updates a temporary style used to preview templates or edits of style code.
     * @param {external:Observable} action$ manages `SELECT_STYLE_TEMPLATE` and `EDIT_STYLE_CODE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    updateTemporaryStyleEpic: (action$, store) =>
        action$.ofType(SELECT_STYLE_TEMPLATE, EDIT_STYLE_CODE)
            .switchMap(action => {

                const state = store.getState();
                const temporaryId = temporaryIdSelector(state);

                const layer = getUpdatedLayer(state);
                const { workspace } = getNameParts(layer.name);
                const isChangedFormat = action.format && action.format !== formatStyleSelector(state);

                const styleName = temporaryId || `${workspace ? `${workspace}:` : ''}${generateTemporaryStyleId()}`;
                const format = action.format || formatStyleSelector(state);
                const status = statusStyleSelector(state);
                const { baseUrl = '' } = styleServiceSelector(state);

                // check if previous version of temporary style is changed
                // if so it add 'raw=true' param to the request to eansure SLD is updated correctly
                const previousLanguageVersion = languageVersionStyleSelector(state);
                const currentLanguageVersion = format === 'sld'
                    && (action.code || '').match(/version=\"1\.1\.0\"/) && { version: '1.1.0' }
                    || action.format && !action.languageVersion && { version: '1.0.0' }
                    || action.languageVersion
                    || { version: '1.0.0' };
                const options = previousLanguageVersion.version !== currentLanguageVersion.version
                    ? { params: { raw: true } }
                    : { };
                const languageVersion = currentLanguageVersion;
                const updateTmpCode = (name) => createUpdateStyleObservable(
                    {
                        update: true,
                        code: action.code,
                        format,
                        styleName: name,
                        status,
                        baseUrl,
                        languageVersion,
                        options
                    },
                    [
                        updateOptionsByOwner(STYLE_OWNER_NAME, [{ style: name, _v_: Date.now(), singleTile: true }]),
                        updateTemporaryStyle({
                            temporaryId: name,
                            templateId: action.templateId || '',
                            code: action.code,
                            format,
                            init: action.init,
                            languageVersion
                        })
                    ],
                    status === 'edit' ? [] : [
                        error({
                            title: "styleeditor.updateTmpErrorTitle",
                            message: "styleeditor.updateTmpStyleErrorMessage",
                            uid: "updateTmpStyleError",
                            autoDismiss: 5
                        })
                    ]
                );

                // valid code needed to initialize and create temp style
                const baseCode = format === 'css' && '* { stroke: #888888; }' ||
                format === 'sld' && '<?xml version="1.0" encoding="ISO-8859-1"?>\n<StyledLayerDescriptor version="1.0.0"\n\t\txsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"\n\t\txmlns="http://www.opengis.net/sld"\n\t\txmlns:ogc="http://www.opengis.net/ogc"\n\t\txmlns:xlink="http://www.w3.org/1999/xlink"\n\t\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n\n\t<NamedLayer>\n\t\t<Name>Default Style</Name>\n\t\t<UserStyle>\n\t\t\t<Title>${styleTitle}</Title>\n\t\t\t<Abstract>${styleAbstract}</Abstract>\n\t\t\t<FeatureTypeStyle>\n\t\t\t\t<Rule>\n\t\t\t\t\t<Name>Rule Name</Name>\n\t\t\t\t\t<Title>Rule Title</Title>\n\t\t\t\t\t<Abstract>Rule Abstract</Abstract>\n\t\t\t\t\t<LineSymbolizer>\n\t\t\t\t\t\t<Stroke>\n\t\t\t\t\t\t\t<CssParameter name="stroke">#0000FF</CssParameter>\n\t\t\t\t\t\t</Stroke>\n\t\t\t\t\t\t</LineSymbolizer>\n\t\t\t\t\t<PointSymbolizer>\n\t\t\t\t\t\t<Graphic>\n\t\t\t\t\t\t\t<Mark>\n\t\t\t\t\t\t\t\t<WellKnownName>square</WellKnownName>\n\t\t\t\t\t\t\t\t<Fill>\n\t\t\t\t\t\t\t\t\t<CssParameter name="fill">#FF0000</CssParameter>\n\t\t\t\t\t\t\t\t</Fill>\n\t\t\t\t\t\t\t</Mark>\n\t\t\t\t\t\t</Graphic>\n\t\t\t\t\t</PointSymbolizer>\n\t\t\t\t\t</Rule>\n\t\t\t\t</FeatureTypeStyle>\n\t\t\t</UserStyle>\n\t\t</NamedLayer>\n\t</StyledLayerDescriptor>\n'
                || '';

                const createTmpCode = (name) =>
                    createUpdateStyleObservable({
                        code: baseCode,
                        format,
                        styleName: name,
                        status,
                        baseUrl
                    },
                    updateTmpCode(name),
                    [
                        error({
                            title: "styleeditor.createTmpErrorTitle",
                            message: "styleeditor.createTmpStyleErrorMessage",
                            uid: "createTmpStyleError",
                            autoDismiss: 5
                        }),
                        // reset temporary style properties
                        // when it's not possible to create it
                        // so next time it creates a new temporary id
                        updateTemporaryStyle({
                            temporaryId: null,
                            templateId: '',
                            code: '',
                            format: '',
                            init: '',
                            languageVersion: null
                        })
                    ]
                    );

                // delete and replace current temporary style if format is changed
                return (isChangedFormat && temporaryId) && deleteStyle({
                    styleName: temporaryId,
                    baseUrl,
                    onSuccess$: createTmpCode(`${workspace ? `${workspace}:` : ''}${generateTemporaryStyleId()}`),
                    onError$: updateTmpCode(styleName)
                })
                || temporaryId && updateTmpCode(styleName)
                || createTmpCode(styleName);
            }),
    /**
     * Gets every `CREATE_STYLE` event.
     * Create a new style.
     * @param {external:Observable} action$ manages `CREATE_STYLE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    createStyleEpic: (action$, store) =>
        action$.ofType(CREATE_STYLE)
            .switchMap(action => {
                const state = store.getState();
                const code = codeStyleSelector(state);
                const layer = getUpdatedLayer(state);
                const { workspace } = getNameParts(layer.name);
                // add new style to layer workspace
                const styleName = `${workspace ? `${workspace}:` : ''}${generateStyleId(action.settings)}`;
                const format = formatStyleSelector(state);
                const { title = '', _abstract = '' } = action.settings || {};
                const { baseUrl = '' } = styleServiceSelector(state);

                const editorMetadata = {
                    msStyleJSON: null,
                    msEditorType: 'visual'
                };

                const metadata = {
                    title: title,
                    description: _abstract,
                    ...editorMetadata
                };

                const status = '';

                return Rx.Observable.defer(() =>
                    StylesAPI.createStyle({
                        baseUrl,
                        code: template(code)({ styleTitle: title, styleAbstract: _abstract }),
                        format,
                        styleName,
                        metadata
                    }))
                    .switchMap(() => Rx.Observable.of(
                        updateOptionsByOwner(STYLE_OWNER_NAME, [{}]),
                        updateSettingsParams({style: styleName || ''}, true),
                        updateStatus(''),
                        loadedStyle())
                        .merge(
                            updateAvailableStylesObservable({layer, styleName, format, title, _abstract, baseUrl, metadata})
                        ))
                    .catch((err) => Rx.Observable.of(
                        errorStyle(status, err),
                        loadedStyle(),
                        error({
                            title: "styleeditor.createStyleErrorTitle",
                            message: "styleeditor.createStyleErrorMessage",
                            uid: "createStyleError",
                            autoDismiss: 5
                        })
                    ))
                    .startWith(loadingStyle(status));
            }),
    /**
     * Gets every `UPDATE_STYLE_CODE` event.
     * Update and save accepted chenges of edited code
     * @param {external:Observable} action$ manages `UPDATE_STYLE_CODE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    updateStyleCodeEpic: (action$, store) =>
        action$.ofType(UPDATE_STYLE_CODE)
            .switchMap(() => {

                const state = store.getState();

                const format = formatStyleSelector(state);
                const languageVersion = languageVersionStyleSelector(state);
                const code = codeStyleSelector(state);
                const styleName = selectedStyleSelector(state);
                const temporaryId = temporaryIdSelector(state);
                const layer = getUpdatedLayer(state);
                const { baseUrl = '' } = styleServiceSelector(state);

                const editorMetadata = editorMetadataSelector(state) || {};

                const metadata = {
                    msStyleJSON: editorMetadata.styleJSON || null,
                    msEditorType: editorMetadata.editorType
                };

                const availableStyles = (layer.availableStyles || [])
                    .map((style) => {
                        if (style.name === styleName) {
                            return {...style, metadata: { ...style.metadata, ...metadata }};
                        }
                        return style;
                    });

                return Rx.Observable.defer(() =>
                    StylesAPI.updateStyle({
                        baseUrl,
                        code,
                        format,
                        styleName,
                        languageVersion,
                        options: { params: { raw: true } },
                        metadata
                    })
                )
                    .switchMap(() => Rx.Observable.of(
                        loadedStyle(),
                        updateNode(
                            layer.id,
                            'layer',
                            {
                                _v_: Date.now(),
                                availableStyles
                            }),
                        updateSettingsParams({
                            availableStyles
                        }),
                        updateTemporaryStyle({
                            temporaryId: temporaryId,
                            templateId: '',
                            code,
                            format,
                            init: true,
                            languageVersion
                        }),
                        success({
                            title: "styleeditor.savedStyleTitle",
                            message: "styleeditor.savedStyleMessage",
                            uid: "savedStyleTitle",
                            autoDismiss: 5
                        })))
                    .catch((err) => Rx.Observable.of(
                        errorStyle('global', err),
                        loadedStyle(),
                        error({
                            title: "styleeditor.updateStyleErrorTitle",
                            message: "styleeditor.updateStyleErrorMessage",
                            uid: "updateStyleError",
                            autoDismiss: 5
                        })))
                    .startWith(loadingStyle('global'));
            }),
    /**
     * Gets every `DELETE_STYLE` event.
     * Remove style from layer object and delete it
     * @param {external:Observable} action$ manages `DELETE_STYLE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    deleteStyleEpic: (action$, store) =>
        action$.ofType(DELETE_STYLE)
            .filter(({styleName}) => !!styleName)
            .switchMap(({styleName}) => {

                const state = store.getState();
                const layer = getUpdatedLayer(state);
                const { baseUrl = '' } = styleServiceSelector(state);
                const originalSettings = originalSettingsSelector(state);
                const initialSettings = initialSettingsSelector(state);

                return Rx.Observable.defer(() =>
                    LayersAPI.removeStyles({
                        baseUrl,
                        layerName: layer.name,
                        styles: [{ name: styleName }]
                    })
                )
                    .switchMap(() => {
                        const availableStyles = layer.availableStyles && layer.availableStyles.filter(({name}) => name !== styleName) || [];
                        return Rx.Observable.concat(
                            Rx.Observable.of(
                                updateSettingsParams({style: '', availableStyles}, true),
                                loadedStyle(),
                                // style has been deleted so original and initial settings must be overrided
                                setControlProperty('layersettings', 'originalSettings', {...originalSettings, style: ''}),
                                setControlProperty('layersettings', 'initialSettings', {...initialSettings, style: ''})
                            ),
                            deleteStyle({
                                styleName,
                                baseUrl,
                                onSuccess$: Rx.Observable.of(
                                    success({
                                        title: "styleeditor.deletedStyleSuccessTitle",
                                        message: "styleeditor.deletedStyleSuccessMessage",
                                        uid: "deletedStyleSuccess",
                                        autoDismiss: 5
                                    })
                                ),
                                onError$: Rx.Observable.of(
                                    error({
                                        title: "styleeditor.deletedStyleErrorTitle",
                                        message: "styleeditor.deletedStyleErrorMessage",
                                        uid: "deletedStyleError",
                                        autoDismiss: 5
                                    })
                                )
                            })
                        );
                    })
                    .catch(() => Rx.Observable.of(loadedStyle()))
                    .startWith(() => Rx.Observable.of(loadingStyle('global')));
            }),
    /**
     * Gets every `SET_DEFAULT_STYLE` event.
     * Update default style of the selected layer
     * @param {external:Observable} action$ manages `SET_DEFAULT_STYLE`
     * @memberof epics.styleeditor
     * @return {external:Observable}
     */
    setDefaultStyleEpic: (action$, store) =>
        action$.ofType(SET_DEFAULT_STYLE)
            .switchMap(() => {
                const state = store.getState();
                const { baseUrl = '' } = styleServiceSelector(state);
                const layer = getUpdatedLayer(state);
                const styleName = selectedStyleSelector(state);
                return Rx.Observable.defer(() =>
                    LayersAPI.updateDefaultStyle({
                        baseUrl,
                        layerName: layer.name,
                        styleName
                    })
                )
                    .switchMap(() => {
                        const defaultStyle = layer.availableStyles.filter(({ name }) => styleName === name);
                        const filteredStyles = layer.availableStyles.filter(({ name }) => styleName !== name);
                        const availableStyles = [...defaultStyle, ...filteredStyles];
                        return Rx.Observable.of(
                            updateSettingsParams({ availableStyles }, true),
                            success({
                                title: "styleeditor.setDefaultStyleSuccessTitle",
                                message: "styleeditor.setDefaultStyleSuccessMessage",
                                uid: "setDefaultStyleSuccess",
                                autoDismiss: 5
                            }),
                            loadedStyle()
                        );
                    })
                    .startWith(loadingStyle('global'))
                    .catch(() => {
                        return Rx.Observable.of(
                            error({
                                title: "styleeditor.setDefaultStyleErrorTitle",
                                message: "styleeditor.setDefaultStyleErrorMessage",
                                uid: "setDefaultStyleError",
                                autoDismiss: 5
                            }),
                            loadedStyle()
                        );
                    });
            })
};

