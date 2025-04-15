/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { branch, compose, lifecycle, toClass } from 'recompose';
import { createSelector } from 'reselect';

import { updateSettingsParams } from '../actions/layers';
import { initStyleService, toggleStyleEditor } from '../actions/styleeditor';
import HTML from '../components/I18N/HTML';
import BorderLayout from '../components/layout/BorderLayout';
import emptyState from '../components/misc/enhancers/emptyState';
import loadingState from '../components/misc/enhancers/loadingState';
import Loader from '../components/misc/Loader';
import {
    canEditStyleSelector,
    errorStyleSelector,
    loadingStyleSelector,
    statusStyleSelector,
    styleServiceSelector
} from '../selectors/styleeditor';
import {
    StyleCodeEditor,
    StyleSelector,
    StyleToolbar
} from './styleeditor/index';

const StyleEditorPanel = ({
    header,
    isEditing,
    showToolbar,
    onInit,
    styleService,
    editingAllowedRoles,
    editingAllowedGroups,
    enableSetDefaultStyle,
    enableEditDefaultStyle,
    canEdit,
    editorConfig
}) => {

    useEffect(() => {
        onInit(
            styleService,
            {
                editingAllowedRoles,
                editingAllowedGroups,
                enableEditDefaultStyle
            }
        );
    }, []);

    return (
        <BorderLayout
            className="ms-style-editor-container"
            header={
                showToolbar ? <div className="ms-style-editor-container-header">
                    {header}
                    <div className="text-center">
                        <StyleToolbar
                            enableSetDefaultStyle={enableSetDefaultStyle}/>
                    </div>
                </div> : null
            }
            footer={<div style={{ height: 25 }} />}>
            {isEditing
                ? <StyleCodeEditor config={editorConfig}/>
                : <StyleSelector
                    showDefaultStyleIcon={canEdit && enableSetDefaultStyle}/>}
        </BorderLayout>
    );
};
StyleEditorPanel.propTypes = {
    header: PropTypes.node,
    isEditing: PropTypes.bool,
    showToolbar: PropTypes.bool,
    onInit: PropTypes.func,
    styleService: PropTypes.object,
    editingAllowedRoles: PropTypes.array,
    editingAllowedGroups: PropTypes.array,
    enableSetDefaultStyle: PropTypes.bool,
    enableEditDefaultStyle: PropTypes.bool,
    canEdit: PropTypes.bool,
    editorConfig: PropTypes.object,
    onSetPermission: PropTypes.func
};
StyleEditorPanel.defaultProps = {
    layer: {},
    onInit: () => {},
    editingAllowedRoles: [
        'ADMIN'
    ],
    editingAllowedGroups: [],
    editorConfig: {},
    enableEditDefaultStyle: true
};

/**
 * StyleEditor plugin.
 * - Select styles from available styles of the layer
 * - Create a new style from a list of template
 * - Remove a style
 * - Edit css style with preview
 *
 * Note: current implementation is available only in TOCItemsSettings
 * @prop {object} cfg.styleService GeoServer service in use, when undefined Style Editor creates style service based on layer options
 * @prop {string} cfg.styleService.baseUrl base url of service eg: '/geoserver/'
 * @prop {array} cfg.styleService.availableUrls a list of urls that can access directly to the style service
 * @prop {array} cfg.styleService.formats supported formats, could be one of [ 'sld' ] or [ 'sld', 'css' ]
 * @prop {string[]} cfg.editingAllowedRoles array of user roles allowed to enter in edit mode.
 * Support predefined ('ADMIN', 'USER', 'ALL') and custom roles. Default value is ['ADMIN'].
 * Configuring with ["ALL"] allows all users to have access regardless of user's permission.
 * However, the outcome can be influenced by the user's permission to access the requested style service.
 * @prop {string[]} cfg.editingAllowedGroups array of user groups allowed to enter in edit mode.
 * When configured, gives the editing permissions to users members of one of the groups listed.
 * @prop {array} cfg.enableSetDefaultStyle enable set default style functionality
 * @prop {array} cfg.enableEditDefaultStyle enable edit default style functionality.
 * By default it is `true`, allows editing of default style of the layer
 * @prop {object} cfg.editorConfig contains editor configurations
 * @prop {object} cfg.editorConfig.classification configuration of the classification symbolizer
 * For example adding default editor configuration to the classification
 * ```
 * "cfg": {
 *    "editorConfig" : {
 *       "classification": {
 *           "intervalsForUnique": 100
 *       },
 *    }
 *  }
 * ```
 * @memberof plugins
 * @class StyleEditor
 */
const StyleEditorPlugin = compose(
    // Plugin needs to be a class
    // in this case 'branch' return always a functional component and PluginUtils expects a class
    toClass,
    // No rendering if not active
    // eg: now only TOCItemsSettings can activate the following plugin
    branch(
        ({ active } = {}) => !active,
        () => () => null
    ),
    // end
    connect(
        createSelector(
            [
                statusStyleSelector,
                loadingStyleSelector,
                errorStyleSelector,
                canEditStyleSelector,
                styleServiceSelector
            ],
            (status, loading, error, canEdit, styleService) => ({
                isEditing: status === 'edit',
                loading,
                error,
                canEdit,
                styleService
            })
        ),
        {
            onInit: initStyleService,
            onUpdateParams: updateSettingsParams
        },
        (stateProps, dispatchProps, ownProps) => {
            // detect if the static service has been updated with new information in the global state
            // eg: classification methods are requested asynchronously
            const isStaticServiceUpdated = ownProps.styleService?.baseUrl === stateProps.styleService?.baseUrl
                && stateProps.styleService?.isStatic;
            const newStyleService = ownProps.styleService && !isStaticServiceUpdated
                ? { ...ownProps.styleService, isStatic: true }
                : { ...stateProps.styleService };
            return {
                ...ownProps,
                ...stateProps,
                ...dispatchProps,
                styleService: newStyleService
            };
        }
    ),
    emptyState(
        ({ error }) => !!(error?.availableStyles || error?.global || error?.parsingCapabilities),
        ({ error }) => ({
            glyph: 'exclamation-mark',
            title: <HTML msgId="styleeditor.errorTitle"/>,
            description: <HTML msgId={
                error?.availableStyles && "styleeditor.missingAvailableStylesMessage" ||
                error?.parsingCapabilities && "styleeditor.parsingCapabilitiesError" ||
                error?.global && "styleeditor.globalError"
            }/>,
            style: {
                display: 'flex',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            },
            mainViewStyle: {
                margin: 'auto',
                width: 300
            }
        })
    ),
    loadingState(
        ({loading}) => loading === 'global',
        {
            size: 150,
            style: {
                margin: 'auto'
            }
        },
        props => <div style={{position: 'relative', height: '100%', display: 'flex'}}><Loader {...props}/></div>
    ),
    compose(
        connect(() => ({}), {
            toggleStyleEditor
        }),
        lifecycle({
            componentDidMount() {
                this.props.toggleStyleEditor(null, true);
            }
        })
    )
)(StyleEditorPanel);

export default {
    StyleEditorPlugin: assign(StyleEditorPlugin, {
        TOC: {
            priority: 1,
            container: 'TOCItemSettings'
        },
        TOCItemsSettings: {
            name: 'StyleEditor',
            target: 'style',
            priority: 1,
            ToolbarComponent: StyleToolbar
        }
    }),
    reducers: {
        styleeditor: require('../reducers/styleeditor').default
    },
    epics: require('../epics/styleeditor').default
};
