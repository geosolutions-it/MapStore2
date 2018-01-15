const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {isString} = require('lodash');

const alwaysExcluded = ["exclude", "titleStyle", "listStyle", "componentStyle", "title", "feature"];

class PropertiesViewer extends React.Component {
    static displayName = 'PropertiesViewer';

    static propTypes = {
        title: PropTypes.string,
        exclude: PropTypes.array,
        titleStyle: PropTypes.object,
        listStyle: PropTypes.object,
        componentStyle: PropTypes.object
    };

    static defaultProps = {
        exclude: [],
        titleStyle: {
            height: "100%",
            width: "100%",
            padding: "4px 0px",
            background: "rgb(240,240,240)",
            borderRadius: "4px",
            textAlign: "center",
            textOverflow: "ellipsis"
        },
        listStyle: {
            margin: "0px 0px 4px 0px"
        },
        componentStyle: {
            padding: "0px 0px 2px 0px",
            margin: "2px 0px 0px 0px"
        }
    };

    getBodyItems = () => {
        return Object.keys(this.props)
            .filter(this.toExlude)
            .map((key) => {
                return (
                    <p key={key} style={this.props.listStyle}><b>{key}</b> {this.renderProperty(this.props[key])}</p>
                );
            });
    };

    renderHeader = () => {
        if (!this.props.title) {
            return null;
        }
        return (
            <div key={this.props.title} style={this.props.titleStyle}>
                {this.props.title}
            </div>
        );
    };

    renderBody = () => {
        var items = this.getBodyItems();
        if (items.length === 0) {
            return null;
        }
        return (
            <div style={{
                padding: "4px",
                margin: 0,
                borderRadius: "4px"
            }}>
                {items}
            </div>
        );
    };

    renderProperty = (prop) => {
        if (isString(prop)) {
            return prop;
        }
        return JSON.stringify(prop);
    };
    render() {
        return (
            <div style={this.props.componentStyle}>
                {this.renderHeader()}
                {this.renderBody()}
            </div>
        );
    }

    toExlude = (propName) => {
        return alwaysExcluded
            .concat(this.props.exclude)
            .indexOf(propName) === -1;
    };
}

module.exports = PropertiesViewer;
