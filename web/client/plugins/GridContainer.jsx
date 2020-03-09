const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const ToolsContainer = require('./containers/ToolsContainer');

/**
 * GridContainerPlugin. This is a plugin that works as container
 * of other plugins displaying them in a grid
*/
class GridContainer extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        mapType: PropTypes.string
    };

    static defaultProps = {
        items: [],
        className: "grid-home-container",
        style: {},
        id: "mapstore-grid-home",
        mapType: "leaflet"
    };

    getPanels = () => {
        return this.props.items.filter((item) => item.tools).reduce((previous, current) => {
            return previous.concat(
                current.tools.map((tool, index) => ({
                    name: current.name + index,
                    panel: tool,
                    cfg: current.cfg.toolsCfg ? current.cfg.toolsCfg[index] : {}
                }))
            );
        }, []);
    };

    getTools = () => {
        return this.props.items.sort((a, b) => a.position - b.position);
    };

    render() {
        return (<ToolsContainer
            id={this.props.id}
            style={this.props.style}
            className={this.props.className}
            mapType={this.props.mapType}
            container={(props) => (<Grid fluid><Row>
                {props.children.map( (item, idx) => <Col key={idx} xs={12} xsOffset={0} sm={6} smOffset={3}>{item}</Col>)}
            </Row></Grid>)}
            toolStyle="primary"
            activeStyle="default"
            stateSelector="omnibar"
            tool={(props) => <div>{props.children}</div>}
            tools={this.getTools()}
            panels={this.getPanels()}
        />);
    }
}

module.exports = {
    GridContainerPlugin: GridContainer,
    reducers: {}
};
