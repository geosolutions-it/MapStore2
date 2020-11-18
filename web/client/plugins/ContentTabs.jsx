/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Col, Grid, Nav, NavItem, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { onTabSelected } from '../actions/contenttabs';
import Message from '../components/I18N/Message';
import contenttabsEpics from '../epics/contenttabs';
import contenttabsReducers from '../reducers/contenttabs';
import ToolsContainer from './containers/ToolsContainer';

const selectedSelector = createSelector(
    state => state && state.contenttabs && state.contenttabs.selected,
    state => state && state.contenttabs && state.contenttabs.hiddenTabs,
    (selected, hiddenTabs) => ({ selected, hiddenTabs })
);

const DefaultTitle = ({ item = {}, index }) => <span>{ item.title || `Tab ${index}` }</span>;

/**
 * @name ContentTabs
 * @memberof plugins
 * @class
 * @classdesc
 * ContentTabs plugin is used in {@link #pages.Maps|home page} allowing to switch between contained plugins (i.e. Maps and Dashboards plugins).
 * <br/>Each contained plugin must have the contenttabs configuration property in its plugin configuration.
 * The key property is mandatory and position property is used to order give tabs order.
 * An example of the contenttabs config in Maps plugin
 * @example
 *   ContentTabs: {
 *       name: 'maps',
 *       key: 'maps',
 *       TitleComponent:
 *       connect(mapsCountSelector)(({ count = "" }) => <Message msgId="resources.maps.title" msgParams={{ count: count + "" }} />),
 *       position: 1,
 *       tool: true
 *   }
 */
class ContentTabs extends React.Component {
    static propTypes = {
        selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        hiddenTabs: PropTypes.object,
        id: PropTypes.string,
        onSelect: PropTypes.func

    };
    static defaultProps = {
        selected: 0,
        items: [],
        hiddenTabs: {},
        className: "content-tabs",
        style: {},
        id: "content-tabs",
        onSelect: () => {}
    };
    render() {
        return (
            <Grid id={this.props.id}>
                <Row>
                    <Col>
                        <h2><Message msgId="resources.contents.title" /></h2>
                        <ToolsContainer
                            id="content-tabs-container"
                            style={this.props.style}
                            className={this.props.className}
                            toolCfg={{title: ""}}
                            container={(props) => <div {...props}>
                                <div style={{marginTop: "10px"}}>
                                    <Nav bsStyle="tabs" activeKey="1" onSelect={k => this.props.onSelect(k)}>
                                        {[...this.props.items].filter(item => !this.props.hiddenTabs[item.name])
                                            .sort((a, b) => a.position - b.position).map(
                                                ({ TitleComponent = DefaultTitle, ...item }, idx) =>
                                                    (<NavItem
                                                        key={item.key || idx}
                                                        active={(item.key || idx) === this.props.selected}
                                                        eventKey={item.key || idx} >
                                                        <TitleComponent index={idx} item={item} />
                                                    </NavItem>)
                                            )}
                                    </Nav>
                                </div>
                                {props.children}
                            </div>}
                            toolStyle="primary"
                            stateSelector="contentTabs"
                            activeStyle="default"
                            tools={[...this.props.items].sort((a, b) => a.position - b.position).filter( ({key}, i) => (key || i) === this.props.selected)}
                            panels={[]}
                        /></Col>
                </Row>
            </Grid>
        );
    }
    handleSelect = () => {}
}

export default {
    ContentTabsPlugin: assign(connect(selectedSelector, {
        onSelect: onTabSelected
    })(ContentTabs), {
        NavMenu: {
            position: 2,
            label: <Message msgId="resources.contents.title" />,
            linkId: '#content-tabs',
            glyph: 'dashboard'
        }
    }),
    reducers: {contenttabs: contenttabsReducers},
    epics: contenttabsEpics
};
