/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { get, head, uniqBy, find, isString } from 'lodash';

import { layerSettingSelector, getSelectedLayer } from './layers';
import { STYLE_ID_SEPARATOR, extractFeatureProperties, isSameOrigin } from '../utils/StyleEditorUtils';
import { isUserAllowedSelectorCreator } from "./security";

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
export const temporaryIdSelector = state => get(state, 'styleeditor.temporaryId');
/**
 * selects templateId from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} id/name of template style
 */
export const templateIdSelector = state => get(state, 'styleeditor.templateId');
/**
 * selects status of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} '', 'edit' or 'template'
 */
export const statusStyleSelector = state => get(state, 'styleeditor.status');
/**
 * selects error of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} error object eg: { global: { status: 404, message: 'Error' } }
 */
export const errorStyleSelector = state => get(state, 'styleeditor.error') || {};
/**
 * selects loading state of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
export const loadingStyleSelector = state => get(state, 'styleeditor.loading');
/**
 * selects current format of temporary style from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
export const formatStyleSelector = state => get(state, 'styleeditor.format') || 'css';
/**
 * selects current langage version of temporary style from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object}
 */
export const languageVersionStyleSelector = state => get(state, 'styleeditor.languageVersion') || {};
/**
 * selects code of style in editing from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
export const codeStyleSelector = state => get(state, 'styleeditor.code');
/**
 * selects initial code of style in editing from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string}
 */
export const initialCodeStyleSelector = state => get(state, 'styleeditor.initialCode') || '';
/**
 * selects add boolean from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
export const addStyleSelector = state => get(state, 'styleeditor.addStyle') || '';
/**
 * selects enabled state of style editor from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
export const enabledStyleEditorSelector = state => get(state, 'styleeditor.enabled');
/**
 * selects style editor service from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} eg: styleService: {baseUrl: '/geoserver/', formats: ['css', 'sld'], availableUrls: ['http://localhost:8081/geoserver/']}
 */
export const styleServiceSelector = state => get(state, 'styleeditor.service') || {};
/**
 * selects layer with current changes applied in settings session from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {object} layer object
 */
export const getUpdatedLayer = state => {
    const settings = layerSettingSelector(state);
    const selectedLayer = getSelectedLayer(state) || {};
    return {...selectedLayer, ...(settings && settings.options || {})};
};
/**
 * Selects configured editing roles allowed
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @returns {object}
 */
export const editingAllowedRolesSelector = (state) => get(state, 'styleeditor.editingAllowedRoles', []);
/**
 * Selects configured editing groups allowed
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @returns {object}
 */
export const editingAllowedGroupsSelector = (state) => get(state, 'styleeditor.editingAllowedGroups', []);
/**
 * Selects canEdit configuration value if any
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @returns {object}
 */
export const canEditSelector = (state) => get(state, 'styleeditor.canEdit', false);
/**
 * selects canEdit status of styleeditor service from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {bool}
 */
export const canEditStyleSelector = (state) => {
    const canEdit = canEditSelector(state);
    if (canEdit) return canEdit;
    const allowedRoles = editingAllowedRolesSelector(state);
    const allowedGroups = editingAllowedGroupsSelector(state);
    const _isSameOrigin = isSameOrigin(getUpdatedLayer(state), styleServiceSelector(state));
    const isAllowed = isUserAllowedSelectorCreator({
        allowedRoles,
        allowedGroups
    })(state);
    return isAllowed && _isSameOrigin;
};
/**
 * selects geometry type of selected layer from state
 * @memberof selectors.styleeditor
 * @param  {object} state the state
 * @return {string} layer object
 */
export const geometryTypeSelector = state => {
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
export const layerPropertiesSelector = state => {
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
export const selectedStyleSelector = state => {
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
export const selectedStyleFormatSelector = state => {
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
export const getAllStyles = (state) => {
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

export const editorMetadataSelector = (state) => state?.styleeditor?.metadata;

export const selectedStyleMetadataSelector = (state) => {
    const { availableStyles = []} = getUpdatedLayer(state) || {};
    const styleName = selectedStyleSelector(state);
    const style = find(availableStyles, ({ name }) => styleName === name) || {};
    return style.metadata || {};
};

export const getEditDefaultStyle = (state) => get(state, 'styleeditor.enableEditDefaultStyle', false);

export default {
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
    selectedStyleMetadataSelector,
    getEditDefaultStyle
};
