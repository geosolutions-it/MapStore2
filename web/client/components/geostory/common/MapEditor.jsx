/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Row, Col} from 'react-bootstrap';
import {compose, branch, withProps, defaultProps} from 'recompose';


import { Modes} from '../../../utils/GeoStoryUtils';
import connectMap, {withFocusedContentMap,
    handleMapUpdate,
    handleToolbar,
    withToolbar,
    withSaveChanges,
    withConfirmClose,
    handleAdvancedMapEditor} from './enhancers/map';

import localizeStringMap from '../../misc/enhancers/localizeStringMap';
import BorderLayout from '../../layout/BorderLayout';

import NodeEditor from '../../widgets/builder/wizard/map/NodeEditor';
import nodeEditor from '../../widgets/builder/wizard/map/enhancers/nodeEditor';

import Toolbar from '../../misc/toolbar/Toolbar';
import Message from '../../I18N/Message';

import MapConfiguratorTabs from './map/MapConfiguratorTabs';
import withMapConfiguratorTabs from './enhancers/withMapConfiguratorTabs';


const StepHeader = ({title, description}) => (
    <div className="text-center">
        <div className="mapstore-step-title">{title}</div>
        <div className="mapstore-step-description">{description}</div>
    </div>
);

const EditorTitle = compose(
    nodeEditor,
    withProps(({selectedNode: layer}) => ({
        title: layer && layer.title
    })),
    localizeStringMap('title')
)(StepHeader);

const Editor = nodeEditor(NodeEditor);
const MapConfigurator = withMapConfiguratorTabs(MapConfiguratorTabs);

/**
 * This component shows a simplified TOC, connected with a geostory map.
 * It enables group visibility, layer visibility and layer's advanced setting customization.
 */
const MapEditor = ({
    mode = Modes.VIEW,
    isFocused = false,
    map = {},
    onChange = () => {},
    onChangeMap = () => {},
    onNodeSelect =  () => {},
    selectedNodes,
    buttons = [],
    editNode,
    closeNodeEditor,
    CloseBtn = () => (null)
}) => {
    return (mode === Modes.EDIT && isFocused ? <div
        key="left-column"
        style={{ order: -1, width: 400, position: 'relative' }}>
        <BorderLayout className="ms-geostory-map-editor"
            header={
                <div className="ms-geostory-map-editor-header text-center">
                    <Row>
                        <Col md={12} className="text-center" style={{overflow: 'hidden', lineHeight: '52px'}}>
                            <CloseBtn glyph="1-close" className="pull-left on-close-btn square-button no-border " tooltipId="geostory.contentToolbar.closeMapEditing"/>
                            <div className="mapstore-step-title"><Message msgId={`geostory.mapEditor.configureMapOptions`} /></div>
                        </Col>
                    </Row>
                    <Toolbar
                        transitionProps={false}
                        btnGroupProps={{
                            className: "ms-geostory-map-editor-toolbar"
                        }}
                        btnDefaultProps={{
                            className: "square-button-md no-border",
                            bsStyle: "primary",
                            noTooltipWhenDisabled: true
                        }}
                        buttons={buttons}/>
                </div>
            }>
            {!!editNode &&
                [
                    <EditorTitle map={map} editNode={editNode} />,
                    <Editor
                        closeNodeEditor={closeNodeEditor}
                        editNode={editNode}
                        map={map}
                        onChange={onChange}/>
                ] ||
                [
                    <MapConfigurator
                        map={map}
                        onChange={onChange}
                        onChangeMap={onChangeMap}
                        selectedNodes={selectedNodes}
                        onSelect={onNodeSelect}
                    />
                ]}
        </BorderLayout>
    </div> : null);
};

export default branch(
    ({focusedContent: {path} = {}}) => path,
    compose(
        defaultProps({
            isFocused: true,
            editMap: true
        }),
        withFocusedContentMap,
        connectMap,
        withSaveChanges,
        handleMapUpdate,
        handleToolbar,
        handleAdvancedMapEditor,
        withToolbar,
        withConfirmClose
    )
)(MapEditor);
