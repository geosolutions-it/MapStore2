/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { head, isArray, template } = require('lodash');
const { success, error } = require('../actions/notifications');
const { UPDATE_NODE, updateNode, updateSettingsParams } = require('../actions/layers');
const { updateAdditionalLayer, removeAdditionalLayer, updateOptionsByOwner } = require('../actions/additionallayers');
const { getDescribeLayer, getLayerCapabilities } = require('../actions/layerCapabilities');
const { setControlProperty } = require('../actions/controls');
const url = require('url');

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
    setEditPermissionStyleEditor
} = require('../actions/styleeditor');

const StylesAPI = require('../api/geoserver/Styles');
const LayersAPI = require('../api/geoserver/Layers');

const {
    temporaryIdSelector,
    codeStyleSelector,
    formatStyleSelector,
    statusStyleSelector,
    selectedStyleSelector,
    enabledStyleEditorSelector,
    loadingStyleSelector,
    styleServiceSelector,
    getUpdatedLayer
} = require('../selectors/styleeditor');

const { getSelectedLayer } = require('../selectors/layers');
const { isAdminUserSelector } = require('../selectors/security');
const { generateTemporaryStyleId, generateStyleId, STYLE_OWNER_NAME } = require('../utils/StyleEditorUtils');
const { normalizeUrl } = require('../utils/PrintUtils');
const { initialSettingsSelector, originalSettingsSelector } = require('../selectors/controls');
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
                code: style.code,
                templateId: '',
                format: style.format,
                init: true
            })
        ))
        .catch(err => Rx.Observable.of(errorStyle('edit', err)))
        : Rx.Observable.empty();
/*
 * Observable delete styles.
 * silent to false hide notifications
 */
const deleteStyleObservable = ({styleName, baseUrl}, silent) =>
    Rx.Observable.defer(() =>
        StylesAPI.deleteStyle({
            baseUrl,
            styleName
        })
    )
    .switchMap(() => silent ? Rx.Observable.empty() : Rx.Observable.of(
            success({
                title: "styleeditor.deletedStyleSuccessTitle",
                message: "styleeditor.deletedStyleSuccessMessage",
                uid: "deletedStyleSuccess",
                autoDismiss: 5
            })
        )
    )
    .catch(() => silent ? Rx.Observable.empty() : Rx.Observable.of(
        error({
            title: "styleeditor.deletedStyleErrorTitle",
            message: "styleeditor.deletedStyleErrorMessage",
            uid: "deletedStyleError",
            autoDismiss: 5
        })
    )
);
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
        .merge(styleName ? deleteStyleObservable({styleName, baseUrl}, true) : Rx.Observable.empty());
};
/*
 * Observable to add a style to available style list and update the layer object on the server
 */
const updateAvailableStylesObservable = ({baseUrl, layer, styleName, format, title, _abstract}) =>
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
            _abstract
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
const createUpdateStyleObservable = ({baseUrl, update, code, format, styleName, status}, successActions = [], errorActions = []) =>
    Rx.Observable.defer(() =>
        StylesAPI[update ? 'updateStyle' : 'createStyle']({
            baseUrl,
            code,
            format,
            styleName
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

                if (!action.enabled) return resetStyleEditorObservable(state);
                if (enabledStyleEditorSelector(state)) return Rx.Observable.empty();

                const layer = action.layer || getSelectedLayer(state);
                if (!layer || layer && !layer.url) return Rx.Observable.empty();

                const normalizedUrl = normalizeUrl(layer.url);
                const parsedUrl = url.parse(normalizedUrl);

                return updateLayerSettingsObservable(action$, store,
                    updatedLayer => updatedLayer && updatedLayer.capabilities,
                    [getLayerCapabilities(layer)],
                    (updatedLayer) => {

                        // layer groups have not available styles
                        if (!updatedLayer.availableStyles) {
                            return Rx.Observable.of(errorStyle('availableStyles', { status: 401 }));
                        }

                        const setAdditionalLayers = (availableStyles = []) => Rx.Observable.of(
                            updateAdditionalLayer(updatedLayer.id, STYLE_OWNER_NAME, 'override', {}),
                            updateSettingsParams({ availableStyles }),
                            loadedStyle()
                        );
                        if (!isAdminUserSelector(state)) {
                            return setAdditionalLayers(updatedLayer.availableStyles);
                        }

                        return Rx.Observable.defer(() =>
                            StylesAPI.getStylesInfo({
                                baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}/geoserver/`,
                                styles: updatedLayer && updatedLayer.availableStyles || []
                            })
                        )
                        .switchMap(availableStyles => {
                            return setAdditionalLayers(availableStyles);
                        });
                    }
                );
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

                const describeAction = layer && !layer.describeFeatureType && getDescribeLayer(layer.url, layer);
                const selectedStyle = selectedStyleSelector(state);
                const styleName = selectedStyle || layer.availableStyles && layer.availableStyles[0] && layer.availableStyles[0].name;

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
                                    loadedStyle()
                                )
                            );
                        }
                    ) || getStyleCodeObservable({
                        status: action.status,
                        styleName,
                        baseUrl
                    });
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
                const styleName = temporaryId || generateTemporaryStyleId();
                const format = action.format || formatStyleSelector(state);
                const status = statusStyleSelector(state);
                const { baseUrl = '' } = styleServiceSelector(state);

                const updateTmpCode = createUpdateStyleObservable(
                    {
                        update: true,
                        code: action.code,
                        format,
                        styleName,
                        status,
                        baseUrl
                    },
                    [
                        updateOptionsByOwner(STYLE_OWNER_NAME, [{ style: styleName, _v_: Date.now(), singleTile: true }]),
                        updateTemporaryStyle({
                            temporaryId: styleName,
                            templateId: action.templateId || '',
                            code: action.code,
                            format,
                            init: action.init
                        })
                    ]
                );

                return temporaryId && updateTmpCode ||
                    createUpdateStyleObservable({
                        code: '* { stroke: #888888; }',
                        format: 'css',
                        styleName,
                        status,
                        baseUrl
                    },
                    updateTmpCode
                );
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
                const styleName = generateStyleId(action.settings);
                const layer = getUpdatedLayer(state);
                const format = formatStyleSelector(state);
                const { title = '', _abstract = '' } = action.settings || {};
                const { baseUrl = '' } = styleServiceSelector(state);

                return createUpdateStyleObservable(
                        {
                            code: template(code)({styleTitle: title, styleAbstract: _abstract}),
                            format,
                            styleName,
                            status,
                            baseUrl
                        },
                        Rx.Observable.of(
                            updateOptionsByOwner(STYLE_OWNER_NAME, [{}]),
                            updateSettingsParams({style: styleName || ''}, true),
                            updateStatus(''),
                            loadedStyle()
                        )
                        .merge(
                            updateAvailableStylesObservable({layer, styleName, format, title, _abstract, baseUrl})
                        )
                    );
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
                const code = codeStyleSelector(state);
                const styleName = selectedStyleSelector(state);
                const temporaryId = temporaryIdSelector(state);
                const layer = getUpdatedLayer(state);
                const { baseUrl = '' } = styleServiceSelector(state);

                return createUpdateStyleObservable(
                    {
                        update: true,
                        code,
                        format,
                        styleName,
                        status: 'global',
                        baseUrl
                    },
                    [
                        updateNode(layer.id, 'layer', { _v_: Date.now() }),
                        updateTemporaryStyle({
                            temporaryId: temporaryId,
                            templateId: '',
                            code,
                            format,
                            init: true
                        }),
                        success({
                            title: "styleeditor.savedStyleTitle",
                            message: "styleeditor.savedStyleMessage",
                            uid: "savedStyleTitle",
                            autoDismiss: 5
                        })
                    ]
                );
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
                        deleteStyleObservable({styleName, baseUrl})
                    );
                })
                .catch(() => Rx.Observable.of(loadedStyle()))
                .startWith(() => Rx.Observable.of(loadingStyle('global')));
            })
};

