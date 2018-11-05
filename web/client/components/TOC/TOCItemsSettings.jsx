/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col, Nav, NavItem, Glyphicon} = require('react-bootstrap');
const DockablePanel = require('../misc/panels/DockablePanel');
const Toolbar = require('../misc/toolbar/Toolbar');
const tooltip = require('../misc/enhancers/tooltip');
const NavItemT = tooltip(NavItem);
const ResizableModal = require('../misc/ResizableModal');
const Portal = require('../misc/Portal');
const {head, isObject, isString} = require('lodash');
const Message = require('../I18N/Message');

/**
 * Component for rendering TOC Settings as tabs inside a Dockable contanier
 * @memberof components.TOC
 * @name TOCItemsSettings
 * @class
 * @prop {boolean} dock switch between Dockable Panel and Resizable Modal, default true (DockPanel)
 * @prop {string} activeTab current active tab, should match the tab id
 * @prop {function} getTabs must return an array of object representing the tabs, eg (props) => [{ id: 'general', Component: MyGeneralComponent}]
 * @prop {string} className additional calss name
 */

const TOCItemSettings = (props, context) => {
    const {
        className = '',
        activeTab = 'general',
        currentLocale = 'en-US',
        width = 500,
        groups = [],
        element = {},
        settings = {},
        getTabs = () => [],
        onSave = () => {},
        onClose = () => {},
        onHideSettings = () => {},
        onSetTab = () => {},
        onUpdateParams = () => {},
        onRetrieveLayerData = () => {},
        onShowAlertModal = () => {},
        realtimeUpdate = true,
        alertModal = false,
        dockStyle = {},
        dock = true,
        showFullscreen,
        draggable,
        position = 'left'
    } = props;

    const tabs = getTabs(props, context);

    return (
        <div>
            <DockablePanel
                open={settings.expanded}
                glyph="wrench"
                title={element.title && isObject(element.title) && (element.title[currentLocale] || element.title.default) || isString(element.title) && element.title || ''}
                className={className}
                onClose={onClose ? () => { onClose(); } : onHideSettings}
                size={width}
                style={dockStyle}
                showFullscreen={showFullscreen}
                dock={dock}
                draggable={draggable}
                position={position}
                header={[
                    <Row key="ms-toc-settings-toolbar" className="text-center">
                        <Col xs={12}>
                            <Toolbar
                                btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                buttons={[{
                                    glyph: 'floppy-disk',
                                    tooltipId: 'save',
                                    visible: !!onSave,
                                    onClick: onSave
                                },
                                ...(head(tabs.filter(tab => tab.id === activeTab && tab.toolbar).map(tab => tab.toolbar)) || [])]}/>
                        </Col>
                    </Row>,
                    ...(tabs.length > 1 ? [<Row key="ms-toc-settings-navbar" className="ms-row-tab">
                        <Col xs={12}>
                            <Nav bsStyle="tabs" activeKey={activeTab} justified>
                                {tabs.map(tab =>
                                    <NavItemT
                                        key={'ms-tab-settings-' + tab.id}
                                        tooltip={<Message msgId={tab.tooltipId}/> }
                                        eventKey={tab.id}
                                        onClick={() => onSetTab(tab.id)}>
                                        <Glyphicon glyph={tab.glyph}/>
                                    </NavItemT>
                                )}
                            </Nav>
                        </Col>
                    </Row>] : [])
                ]}>
            {tabs.filter(tab => tab.id && tab.id === activeTab).filter(tab => tab.Component).map(tab => (
                <tab.Component
                    {...props}
                    key={'ms-tab-settings-body-' + tab.id}
                    containerWidth={width}
                    element={element}
                    groups={groups}
                    nodeType={settings.nodeType}
                    settings={settings}
                    retrieveLayerData={onRetrieveLayerData}
                        onChange={(key, value) => isObject(key) ? onUpdateParams(key, realtimeUpdate) : onUpdateParams({[key]: value}, realtimeUpdate)}/>
            ))}
            </DockablePanel>
            <Portal>
                <ResizableModal
                    fade
                    show={alertModal}
                    title={<Message msgId="layerProperties.changedSettings"/>}
                    size="xs"
                    onClose={() => onShowAlertModal(false)}
                    buttons={[
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="close"/>,
                            onClick: () => onClose(true)
                        },
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="save"/>,
                            onClick: onSave
                        }
                    ]}>
                    <div className="ms-alert">
                        <div className="ms-alert-center">
                            <Message msgId="layerProperties.changedSettingsAlert"/>
                        </div>
                    </div>
                </ResizableModal>
            </Portal>
        </div>
    );
};
TOCItemSettings.contextTypes = {
    plugins: PropTypes.object,
    pluginsConfig: PropTypes.object,
    loadedPlugins: PropTypes.object
};

module.exports = TOCItemSettings;
