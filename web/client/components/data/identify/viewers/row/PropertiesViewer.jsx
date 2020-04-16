/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {isString} = require('lodash');
const {containsHTML} = require('../../../../../utils/StringUtils');

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
        titleStyle: {},
        listStyle: {},
        componentStyle: {}
    };

    getBodyItems = () => {
        return Object.keys(this.props)
            .filter(this.toExclude)
            .map((key) => {
                const val = this.renderProperty(this.props[key]);
                return (
                    <tr
                        key={key}
                        style={this.props.listStyle}>
                        <td>{key}</td>
                        <td>{containsHTML(val) ? <span dangerouslySetInnerHTML={{__html: val}}/> : val}</td>
                    </tr>);
            });
    };

    renderHeader = () => {
        if (!this.props.title) {
            return null;
        }
        return (
            <thead
                key={this.props.title}
                style={this.props.titleStyle}
                className="ms-properties-viewer-title">
                <tr>
                    <th colSpan="2" >{this.props.title}</th>
                </tr>
            </thead>
        );
    };

    renderBody = () => {
        var items = this.getBodyItems();
        if (items.length === 0) {
            return null;
        }
        return (
            <tbody
                className="ms-properties-viewer-body">
                {items}
            </tbody>
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
            <table
                className="ms-properties-viewer"
                style={this.props.componentStyle}>
                {this.renderHeader()}
                {this.renderBody()}
            </table>
        );
    }

    toExclude = (propName) => {
        return alwaysExcluded
            .concat(this.props.exclude)
            .indexOf(propName) === -1;
    };
}

module.exports = PropertiesViewer;
