/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isObject } from 'lodash';
import React from 'react';
import { NavItem as BSNavItem, Col, Glyphicon, Nav, Row } from 'react-bootstrap';

import Message from '../../../../I18N/Message';
import tooltip from '../../../../misc/enhancers/tooltip';

const NavItem = tooltip(BSNavItem);

/**
 * Provides a node (layer or group) property editor for the TOC
 */
export default ({
    settings, element = {}, tabs = [], activeTab, width, groups,
    isLocalizedLayerStylesEnabled,
    setActiveTab = () => { }, onUpdateParams = () => { }, onRetrieveLayerData = () => { }, realtimeUpdate, ...props} = {}) =>
    (<Row key="ms-toc-settings-navbar" className="ms-row-tab">
        <Col xs={12}>
            <Nav bsStyle="tabs" activeKey={activeTab} justified>
                {tabs.map(tab =>
                    <NavItem
                        key={'ms-tab-settings-' + tab.id}
                        tooltip={<Message msgId={tab.tooltipId} />}
                        eventKey={tab.id}
                        onClick={() => setActiveTab(tab.id)}>
                        <Glyphicon glyph={tab.glyph} />
                    </NavItem>
                )}
            </Nav>
        </Col>
        <Col xs={12}>
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
                    isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                    onChange={(key, value) => isObject(key) ? onUpdateParams(key, realtimeUpdate) : onUpdateParams({ [key]: value }, realtimeUpdate)} />
            ))}</Col>
    </Row>);
