/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './css/settingsModal.css';

import { isArray, isString } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Template from '../../data/template/jsx/Template';
import Dialog from '../../misc/Dialog';
import Portal from '../../misc/Portal';
import RenderTemplate from './template/index';
import MetadataTemplate from './template/MetadataTemplate';

class LayerMetadataModal extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        layerMetadata: PropTypes.object,
        metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func]),
        hideLayerMetadata: PropTypes.func,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        maskLoading: PropTypes.bool,
        layerMetadataPanelTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    };

    static defaultProps = {
        id: "mapstore-layer-settings-metadata",
        layerMetadata: {expanded: false},
        metadataTemplate: null,
        closeGlyph: "1-close",
        panelStyle: {},
        panelClassName: "toolbar-panel portal-dialog",
        maskLoading: true,
        layerMetadataPanelTitle: ''
    };

    onDelete = () => {
        this.props.hideLayerMetadata();
    };

    onClose = () => {
        this.props.hideLayerMetadata();
    };

    getTemplate = () => {
        const template = this.props.metadataTemplate || MetadataTemplate;
        if (isArray(template) || isString(template)) {
            const templateString = isArray(template) ? template.join('\n') : template;
            return (<Template
                model={this.props.layerMetadata.metadataRecord}
                template={templateString}
                renderContent={RenderTemplate} />);
        }
        const CustomTemplate = template;
        return <CustomTemplate model={this.props.layerMetadata.metadataRecord}/>;
    };

    renderBodyTemplate = () => {
        if (!this.props.layerMetadata.maskLoading) {
            return this.getTemplate();
        }
        return null;
    };

    render() {
        const footer = (<span role="footer"></span>);
        if (this.props.layerMetadata.expanded) {
            return (
                <Portal>
                    <Dialog maskLoading={this.props.layerMetadata.maskLoading} id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                        <span role="header">
                            <span className="modal-title layer-settings-metadata-panel-title">{this.props.layerMetadataPanelTitle}</span>
                            <button onClick={this.onClose} className="layer-settings-metadata-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                        </span>
                        <div role="body" style={{minWidth: "500px"}}>
                            {this.renderBodyTemplate()}
                        </div>
                        {footer}
                    </Dialog>
                </Portal>
            );
        }
        return null;
    }
}

export default LayerMetadataModal;
