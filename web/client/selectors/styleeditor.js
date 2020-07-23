/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { get, head, uniqBy, find, isString } = require('lodash');
const { layerSettingSelector, getSelectedLayer } = require('./layers');
const { STYLE_ID_SEPARATOR, extractFeatureProperties } = require('../utils/StyleEditorUtils');

/**
 * selects styleeditor state
 * @name styleeditor
 * @memberof selectors
 * @static
 */

/**
 * selects temporaryId from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} id/name of temporary style
 */
const temporaryIdSelector = state => get(state, 'styleeditor.temporaryId');
/**
 * selects templateId from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} id/name of template style
 */
const templateIdSelector = state => get(state, 'styleeditor.templateId');
/**
 * selects status of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} '', 'edit' or 'template'
 */
const statusStyleSelector = state => get(state, 'styleeditor.status');
/**
 * selects error of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} error object eg: { global: { status: 404, message: 'Error' } }
 */
const errorStyleSelector = state => get(state, 'styleeditor.error') || {};
/**
 * selects loading state of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
const loadingStyleSelector = state => get(state, 'styleeditor.loading');
/**
 * selects current format of temporary style from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
const formatStyleSelector = state => get(state, 'styleeditor.format') || 'css';
/**
 * selects current langage version of temporary style from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object}
 */
const languageVersionStyleSelector = state => get(state, 'styleeditor.languageVersion') || {};
/**
 * selects code of style in editing from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
const codeStyleSelector = state => get(state, 'styleeditor.code');
/**
 * selects initial code of style in editing from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
const initialCodeStyleSelector = state => get(state, 'styleeditor.initialCode') || '';
/**
 * selects add boolean from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
const addStyleSelector = state => get(state, 'styleeditor.addStyle') || '';
/**
 * selects enabled state of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
const enabledStyleEditorSelector = state => get(state, 'styleeditor.enabled');
/**
 * selects style editor service from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} eg: styleService: {baseUrl: '/geoserver/', formats: ['css', 'sld'], availableUrls: ['http://localhost:8081/geoserver/']}
 */
const styleServiceSelector = state => get(state, 'styleeditor.service') || {};
/**
 * selects canEdit status of styleeditor service from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
const canEditStyleSelector = state => get(state, 'styleeditor.canEdit');
/**
 * selects layer with current changes applied in settings session from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} layer object
 */
const getUpdatedLayer = state => {
    const settings = layerSettingSelector(state);
    const selectedLayer = getSelectedLayer(state) || {};
    return {...selectedLayer, ...(settings && settings.options || {})};
};
/**
 * selects geometry type of selected layer from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} layer object
 */
const geometryTypeSelector = state => {
    const updatedLayer = getUpdatedLayer(state);
    const { geometryType = 'vector' } = extractFeatureProperties(updatedLayer);
    return geometryType;
};
/**
 * selects feature properties of selected layer from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object}
 */
const layerPropertiesSelector = state => {
    const updatedLayer = getUpdatedLayer(state);
    const { properties = {} } = extractFeatureProperties(updatedLayer);
    return properties;
};
/**
 * selects selected style name from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
const selectedStyleSelector = state => {
    const updatedLayer = getUpdatedLayer(state);
    return updatedLayer.style
    || updatedLayer.availableStyles && updatedLayer.availableStyles[0] && updatedLayer.availableStyles[0].name;
};
/**
 * selects format of selected style from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
const selectedStyleFormatSelector = state => {
    const { availableStyles = []} = getUpdatedLayer(state) || {};
    const styleName = selectedStyleSelector(state);
    return head(availableStyles.filter(({ name }) => name === styleName).map(({ format }) => format));
};
/**
 * selects all style values of selected layer (availableStyles, defaultStyle, enabledStyle) from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object}
 */
const getAllStyles = (state) => {
    const updatedLayer = getUpdatedLayer(state);
    const availableStyles = updatedLayer.availableStyles || [];
    const { name: defaultStyle } = head(availableStyles) || {};
    const enabledStyle = updatedLayer.style || updatedLayer && !updatedLayer.style && defaultStyle;
    return {
        availableStyles: uniqBy(availableStyles.map(style => {
            const splittedName = style && style.title && isString(style.title) && style.title.split(STYLE_ID_SEPARATOR);
            const label = splittedName && splittedName[0] || style.name;
            return {
                ...style,
                label
            };
        }), 'name'),
        defaultStyle,
        enabledStyle
    };
};

const editorMetadataSelector = (state) => state?.styleeditor?.metadata;

const selectedStyleMetadataSelector = (state) => {
    const { availableStyles = []} = getUpdatedLayer(state) || {};
    const styleName = selectedStyleSelector(state);
    const style = find(availableStyles, ({ name }) => styleName === name) || {};
    return style.metadata || {};
};

module.exports = {
    temporaryIdSelector,
    templateIdSelector,
    statusStyleSelector,
    errorStyleSelector,
    loadingStyleSelector,
    formatStyleSelector,
    languageVersionStyleSelector,
    codeStyleSelector,
    initialCodeStyleSelector,
    selectedStyleSelector,
    addStyleSelector,
    geometryTypeSelector,
    layerPropertiesSelector,
    enabledStyleEditorSelector,
    styleServiceSelector,
    canEditStyleSelector,
    getUpdatedLayer,
    selectedStyleFormatSelector,
    getAllStyles,
    editorMetadataSelector,
    selectedStyleMetadataSelector
};
