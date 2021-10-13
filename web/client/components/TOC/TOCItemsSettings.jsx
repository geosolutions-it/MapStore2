/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, Glyphicon } from 'react-bootstrap';
import DockablePanel from '../misc/panels/DockablePanel';
import Toolbar from '../misc/toolbar/Toolbar';
import tooltip from '../misc/enhancers/tooltip';
const NavItemT = tooltip(NavItem);
import { head, isObject, isString } from 'lodash';
import Message from '../I18N/Message';

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

const TOCItemSettings = (props) => {
    const {
        className = '',
        activeTab = 'general',
        currentLocale = 'en-US',
        currentLocaleLanguage = 'en',
        width = 500,
        groups = [],
        element = {},
        settings = {},
        onClose = () => {},
        onHideSettings = () => {},
        onSetTab = () => {},
        onUpdateParams = () => {},
        onRetrieveLayerData = () => {},
        realtimeUpdate = true,
        dockStyle = {},
        dock = true,
        showFullscreen,
        draggable,
        position = 'left',
        tabs = [],
        tabsConfig = {},
        isLocalizedLayerStylesEnabled = false
    } = props;


    const ToolbarComponent = head(tabs.filter(tab => tab.id === activeTab && tab.toolbarComponent).map(tab => tab.toolbarComponent));

    const tabsCloseActions = tabs && tabs.map(tab => tab && tab.onClose).filter(val => val) || [];

    const toolbarButtons = [
        ...(head(tabs.filter(tab => tab.id === activeTab && tab.toolbar).map(tab => tab.toolbar)) || [])];

    return (
        <div>
            <DockablePanel
                open={settings.expanded}
                glyph="wrench"
                title={element.title && isObject(element.title) && (element.title[currentLocale] || element.title.default) || isString(element.title) && element.title || ''}
                className={className}
                onClose={() => {
                    if (onClose) {
                        onClose(tabsCloseActions);
                    } else {
                        tabsCloseActions.forEach(tabOnClose => { tabOnClose(); });
                        onHideSettings();
                    }
                }}
                size={width}
                style={dockStyle}
                showFullscreen={showFullscreen}
                dock={dock}
                draggable={draggable}
                position={position}
                header={[
                    <Row key="ms-toc-settings-toolbar" className="text-center">
                        <Col xs={12}>
                            {ToolbarComponent ?
                                <ToolbarComponent buttons={toolbarButtons}/>
                                : <Toolbar
                                    btnDefaultProps={{ bsStyle: 'primary', className: 'square-button-md' }}
                                    buttons={toolbarButtons}/>}
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
                                        onClick={() => {
                                            onSetTab(tab.id);
                                            if (tab.onClick) { tab.onClick(); }
                                        }}>
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
                        {...tabsConfig[tab.id]}
                        key={'ms-tab-settings-body-' + tab.id}
                        containerWidth={width}
                        element={element}
                        groups={groups}
                        nodeType={settings.nodeType}
                        settings={settings}
                        retrieveLayerData={onRetrieveLayerData}
                        onChange={(key, value) => isObject(key) ? onUpdateParams(key, realtimeUpdate) : onUpdateParams({[key]: value}, realtimeUpdate)}
                        isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                        currentLocaleLanguage={currentLocaleLanguage}/>
                ))}
            </DockablePanel>
        </div>
    );
};
TOCItemSettings.contextTypes = {
    plugins: PropTypes.object,
    pluginsConfig: PropTypes.array,
    loadedPlugins: PropTypes.object
};

export default TOCItemSettings;
