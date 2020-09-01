/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState }  from 'react';

import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import inlineWidgets from './inlineWidgets';

import {
    editStyleCode,
    updateEditorMetadata,
    errorStyle
} from '../../actions/styleeditor';

import {
    getColors,
    methods
} from '../../api/SLDService';

import { getEditorMode } from '../../utils/StyleEditorUtils';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
    codeStyleSelector,
    geometryTypeSelector,
    formatStyleSelector,
    loadingStyleSelector,
    errorStyleSelector,
    layerPropertiesSelector,
    getUpdatedLayer,
    styleServiceSelector,
    editorMetadataSelector,
    canEditStyleSelector
} from '../../selectors/styleeditor';

import {
    scalesSelector,
    mapSelector
} from '../../selectors/map';

import TextareaEditor from '../../components/styleeditor/Editor';
import VisualStyleEditor from '../../components/styleeditor/VisualStyleEditor';

import BorderLayout from '../../components/layout/BorderLayout';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Message from '../../components/I18N/Message';
import Loader from '../../components/misc/Loader';

import { Alert, Glyphicon } from 'react-bootstrap';
import { createShallowSelector } from '../../utils/ReselectUtils';
import {
    classificationVector,
    classificationRaster
} from '../../api/StyleEditor';

const styleUpdateTypes = {
    'classificationVector': classificationVector,
    'classificationRaster': classificationRaster,
    // support previous type
    'classification': classificationVector,
    'classification-raster': classificationRaster
};

function getAttributes(hintProperties, geometryType) {
    return hintProperties && geometryType !== 'raster' && Object.keys(hintProperties)
        .filter((key) => ['integer', 'long', 'double', 'float', 'bigdecimal', 'string', 'decimal']
            .indexOf(hintProperties[key].localPart.toLowerCase()) !== -1)
        .map((key) => {
            const { localPart } = hintProperties[key];
            return {
                attribute: key,
                label: key,
                type: ['integer', 'long', 'double', 'float', 'bigdecimal', 'decimal']
                    .indexOf(localPart.toLowerCase()) !== -1
                    ? 'number'
                    : 'string'
            };
        });
}

const ConnectedVisualStyleEditor = connect(
    createSelector(
        [
            codeStyleSelector,
            formatStyleSelector,
            layerPropertiesSelector,
            errorStyleSelector,
            loadingStyleSelector,
            getUpdatedLayer,
            geometryTypeSelector,
            scalesSelector,
            mapSelector,
            styleServiceSelector
        ],
        (code, format, hintProperties, error, loading, layer, geometryType, scales, map, styleService) => ({
            code,
            mode: getEditorMode(format),
            bands: isArray(hintProperties) && geometryType === 'raster' && hintProperties || [],
            attributes: getAttributes(hintProperties, geometryType),
            error: error.edit || null,
            loading,
            format,
            layer,
            geometryType,
            scales: scales.map(scale => Math.round(scale)),
            zoom: map.zoom,
            fonts: styleService.fonts || [],
            methods: (geometryType === 'raster'
                ? styleService?.classificationMethods?.raster
                : styleService?.classificationMethods?.vector) || methods
        })
    ),
    {
        onError: errorStyle.bind(null, 'edit')
    }
)(VisualStyleEditor);

ConnectedVisualStyleEditor.defaultProps = {
    getColors,
    styleUpdateTypes
};

const ConnectedTextareaEditor = connect(createSelector(
    [
        codeStyleSelector,
        formatStyleSelector,
        layerPropertiesSelector,
        errorStyleSelector,
        loadingStyleSelector
    ],
    (code, format, hintProperties, error, loading) => ({
        code,
        mode: getEditorMode(format),
        hintProperties,
        error: error.edit || null,
        loading
    })
))(TextareaEditor);

const editors = {
    visual: ConnectedVisualStyleEditor,
    textarea: ConnectedTextareaEditor
};

function StyleEditor({
    code,
    error,
    canEdit,
    editorType,
    onUpdateMetadata,
    onChange,
    loading,
    ...props
}) {

    const [alert, setAlert] = useState();

    const centeredChildStyle = {
        position: 'relative',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    };

    if (!code && !error) {
        // loading
        return (
            <div style={centeredChildStyle}>
                <Loader size={150}/>
            </div>);
    }
    if (!canEdit) {
        // missing permission
        return (
            <div style={centeredChildStyle}>
                <div>
                    <Glyphicon glyph="exclamation-mark" style={{ fontSize: 150 }}/>
                    <h1><Message msgId="styleeditor.noPermission"/></h1>
                </div>
            </div>);
    }
    if (error?.status === 404) {
        // not found
        return (
            <div style={centeredChildStyle}>
                <div>
                    <Glyphicon glyph="exclamation-mark" style={{ fontSize: 150 }}/>
                    <h1><Message msgId="styleeditor.styleNotFound"/></h1>
                </div>
            </div>);
    }

    const EditorComponent = editors[editorType] || editors.textarea;

    return (
        <BorderLayout
            style={{ position: 'relative' }}
            header={
                <div className="ms-style-editor-switch">
                    <Toolbar
                        buttons={[
                            {
                                className: 'square-button-md no-border',
                                glyph: 'code',
                                active: editorType === 'textarea',
                                disabled: loading,
                                tooltipId: editorType === 'visual'
                                    ? 'styleeditor.switchToTextareaEditor'
                                    : 'styleeditor.switchToVisualEditor',
                                onClick: () => {
                                    if (loading) {
                                        return null;
                                    }
                                    if (editorType === 'visual') {
                                        return onUpdateMetadata({ editorType: 'textarea' });
                                    }
                                    return setAlert(true);
                                }
                            }
                        ]}
                    />
                </div>
            }>
            {EditorComponent && <EditorComponent
                {...props}
                onChange={(newCode, style) => {
                    onChange(newCode);
                    if (isObject(style)) {
                        onUpdateMetadata({ styleJSON: JSON.stringify(style) });
                    }
                }}
            />}
            {alert &&
            <div
                className="ms-style-editor-alert"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }}>
                <Alert bsStyle="warning" style={{ textAlign: 'center' }}>
                    <p style={{ padding: 8 }}><Message msgId="styleeditor.alertForceTranslate" /></p>
                    <p>
                        <Toolbar
                            buttons={[
                                {
                                    text: <Message msgId="styleeditor.stayInTextareaEditor" />,
                                    onClick: () => setAlert(false),
                                    style: { marginRight: 4 }
                                },
                                {
                                    bsStyle: 'primary',
                                    text: <Message msgId="styleeditor.useLatestValidStyle" />,
                                    onClick: () => {
                                        onUpdateMetadata({ editorType: 'visual' });
                                        setAlert(false);
                                    }
                                }
                            ]}
                        />
                    </p>
                </Alert>
            </div>}
        </BorderLayout>
    );
}

StyleEditor.defaultProps = {
    inlineWidgets
};

const editorTypeSelector = state => {
    const metadata = editorMetadataSelector(state);
    return metadata?.editorType;
};

const defaultStyleJSONSelector = state => {
    try {
        const metadata = editorMetadataSelector(state);
        return JSON.parse(metadata?.styleJSON);
    } catch (e) {
        return null;
    }
};

const StyleCodeEditor = connect(
    createShallowSelector(
        codeStyleSelector,
        errorStyleSelector,
        canEditStyleSelector,
        editorTypeSelector,
        defaultStyleJSONSelector,
        loadingStyleSelector,
        (code, error, canEdit, editorType, defaultStyleJSON, loading) => ({
            code,
            error: error.edit || null,
            canEdit,
            editorType,
            defaultStyleJSON,
            loading
        })
    ),
    {
        onUpdateMetadata: updateEditorMetadata,
        onChange: editStyleCode
    }
)(StyleEditor);

export default StyleCodeEditor;
