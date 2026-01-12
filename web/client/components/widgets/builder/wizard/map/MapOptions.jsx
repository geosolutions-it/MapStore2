/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useState } from 'react';
import {compose, withProps} from 'recompose';
import { FormGroup, Checkbox, Nav, NavItem as BSNavItem, Glyphicon, Alert } from 'react-bootstrap';

import Message from '../../../../I18N/Message';
import emptyState from '../../../../misc/enhancers/emptyState';
import localizeStringMap from '../../../../misc/enhancers/localizeStringMap';
import StepHeader from '../../../../misc/wizard/StepHeader';
import tooltip from '../../../../misc/enhancers/tooltip';
import nodeEditor from './enhancers/nodeEditor';
import NodeEditorComp from './NodeEditor';
import TOCComp from './TOC';

const NavItem = tooltip(BSNavItem);

const TOC = emptyState(
    ({ map = {} } = {}) => !map.layers || (map.layers || []).filter(l => l.group !== 'background').length === 0,
    () => ({
        glyph: "1-layer",
        title: <Message msgId="widgets.selectMap.TOC.noLayerTitle" />,
        description: <Message msgId="widgets.selectMap.TOC.noLayerDescription" />
    })
)(TOCComp);

const Editor = nodeEditor(NodeEditorComp);
const EditorTitle = compose(
    nodeEditor,
    withProps(({selectedNode: layer}) => ({
        title: layer && layer.title
    })),
    localizeStringMap('title')
)(StepHeader);

// Map View Options
const MapViewOptions = ({ map, onChange = () => {}, widgets = [], widgetId }) => {
    const mapPath = `maps[${map.mapId}]`;

    // Check if there's a legend widget that depends on this map widget (any map within it)
    const hasLegendWidget = useMemo(() => widgets.some(widget =>
        widget.widgetType === 'legend' &&
        widget.dependenciesMap?.layers?.startsWith(`widgets[${widgetId}].maps`)
    ), [widgets, widgetId]);

    const handleShowLegendChange = (checked) => {
        onChange(`${mapPath}.showLegend`, checked);
    };

    return (
        <div className="widget-options-form">
            {hasLegendWidget && (
                <Alert bsStyle="warning">
                    <Message msgId="widgets.mapWidget.legendAlreadyExists" />
                </Alert>
            )}
            <FormGroup>
                <Checkbox
                    checked={map.showBackgroundSelector || false}
                    onChange={(e) => onChange(`${mapPath}.showBackgroundSelector`, e.target.checked)}
                >
                    <Message msgId="widgets.mapWidget.showBackgroundSelector" />
                </Checkbox>
            </FormGroup>
            <FormGroup>
                <Checkbox
                    checked={map.showLegend || false}
                    onChange={(e) => handleShowLegendChange(e.target.checked)}
                >
                    <Message msgId="widgets.mapWidget.showLegend" />
                </Checkbox>
            </FormGroup>
        </div>
    );
};

// TOC/Layer Editor
const LayersTab = ({
    map = {},
    editNode,
    closeNodeEditor = () => {},
    onChange = () => {},
    selectedNodes = [],
    onNodeSelect = () => {},
    isLocalizedLayerStylesEnabled
}) => (
    editNode
        ? [
            <EditorTitle key="editor-title" map={map} editNode={editNode} />,
            <Editor
                key="editor"
                closeNodeEditor={closeNodeEditor}
                editNode={editNode}
                map={map}
                onChange={onChange}
                isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
            />
        ] : [
            <TOC
                key="toc"
                selectedNodes={selectedNodes}
                onSelect={onNodeSelect}
                onChange={onChange}
                map={map}
            />
        ]
);

const mapOptionTabs = [
    {
        id: 'toc',
        tooltipId: 'layers',
        glyph: '1-layer',
        visible: true,
        Component: LayersTab
    }, {
        id: 'settings',
        tooltipId: 'settings',
        glyph: 'wrench',
        visible: true,
        Component: MapViewOptions
    }
];

export default ({ preview, widgets = [], widgetId, ...props }) => {
    const [activeTab, setActiveTab] = useState('toc');
    return (
        <>
            <div>
                <StepHeader title={<Message msgId={`widgets.builder.wizard.configureMapOptions`} />} />

                <div key="sample" style={{ marginTop: 10 }}>
                    <StepHeader title={<Message msgId={`widgets.builder.wizard.preview`} />} />
                    <div style={{ width: "100%", height: "200px"}}>
                        {preview}
                    </div>
                </div>
            </div>
            <div key="ms-map-options-tabs" className="ms-row-tab" style={{ marginTop: 10 }}>
                <div>
                    <Nav bsStyle="tabs" activeKey={activeTab} justified>
                        {mapOptionTabs.map(tab =>
                            <NavItem
                                key={'ms-tab-settings-' + tab.id}
                                tooltipId={tab.tooltipId}
                                eventKey={tab.id}
                                onClick={() => setActiveTab(tab.id)}>
                                <Glyphicon glyph={tab.glyph} />
                            </NavItem>
                        )}
                    </Nav>
                </div>
                <div style={{ paddingTop: 8 }}>
                    {mapOptionTabs.filter(tab => tab.id && tab.id === activeTab)
                        .filter(tab => tab.Component).map(tab => (
                            <tab.Component
                                key={'ms-tab-settings-body-' + tab.id}
                                widgets={widgets}
                                widgetId={widgetId}
                                {...props}
                            />
                        ))}
                </div>
            </div>
        </>
    );
};
