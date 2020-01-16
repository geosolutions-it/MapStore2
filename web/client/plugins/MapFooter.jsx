/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const ToolsContainer = require('./containers/ToolsContainer');
const { lifecycle } = require('recompose');

let fixedElements = {};
const fix = lifecycle({
    componentDidMount() {
        if (fixedElements[this.props.id]) {
            const el = document.getElementById(this.props.id);
            if (el && el.parentNode && !el.hasChildNodes()) {
                el.parentNode.replaceChild(fixedElements[this.props.id], el);
            }
        }
    },
    shouldComponentUpdate() { return false; },
    componentWillUnmount() {
        fixedElements[this.props.id] = document.getElementById(this.props.id);
    }
});
const FixedContainer = fix(({ id }) => <div id={id}></div>);

// these two elements are retained in fixedElementObject and reused when unmount/re-mount
// this prevents the div to be re-rendered so the component can be connected with map attribution tool.
const fixedTools = [
    {element: <FixedContainer key="attribution" id="footer-attribution-container" />},
    {element: <FixedContainer key="scalebar" id="footer-scalebar-container" />}
];

class MapFooter extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        items: PropTypes.array,
        id: PropTypes.string,
        mapType: PropTypes.string
    };

    static defaultProps = {
        items: [],
        className: "mapstore-map-footer",
        style: {},
        id: "mapstore-map-footer",
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
        return [fixedTools[0], ...this.props.items.sort((a, b) => b.position - a.position), fixedTools[1]];
    };

    render() {
        return (
            <ToolsContainer id={this.props.id}
                style={this.props.style}
                className={this.props.className}
                mapType={this.props.mapType}
                container={(props) => <div {...props}>{props.children}</div>}
                toolStyle="primary"
                activeStyle="default"
                stateSelector="mapFooter"
                tool={(props) => <div>{props.children}</div>}
                tools={this.getTools()}
                panels={this.getPanels()}/>
        );
    }
}

module.exports = {
    MapFooterPlugin: MapFooter,
    reducers: {}
};
