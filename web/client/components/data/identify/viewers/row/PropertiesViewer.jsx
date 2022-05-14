/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isString } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { containsHTML } from '../../../../../utils/StringUtils';
import Message from '../../../../I18N/Message';
class PropertiesViewer extends React.Component {
    static displayName = 'PropertiesViewer';

    static propTypes = {
        exclude: PropTypes.array,
        include: PropTypes.array,
        titleStyle: PropTypes.object,
        listStyle: PropTypes.object,
        componentStyle: PropTypes.object,
        feature: PropTypes.object,
        labelIds: PropTypes.object
    };

    static defaultProps = {
        exclude: [],
        titleStyle: {},
        listStyle: {},
        componentStyle: {},
        labelIds: {}
    };

    getBodyItems = () => {
        return Object.keys(this.props?.feature?.properties || {})
            .filter(this.props?.include?.length > 0 ? this.toInclude : this.toExclude)
            .map((key) => {
                const val = this.renderProperty(this.props.feature.properties[key]);
                return (
                    <li
                        key={key}
                        style={this.props.listStyle}>
                        <div className="ms-properties-viewer-key">{this.props.labelIds[key] ? <Message msgId={this.props.labelIds[key]}/> : key}</div>
                        {containsHTML(val) ? <div className="ms-properties-viewer-value" dangerouslySetInnerHTML={{__html: val}}/> : <div className="ms-properties-viewer-value">{val}</div>}
                    </li>);
            });
    };

    renderHeader = () => {
        if (this.props.feature?.id === undefined) {
            return null;
        }
        const title = this.props.feature.id + '';
        return (
            <div
                key={title}
                style={this.props.titleStyle}
                className="ms-properties-viewer-title">
                {title}
            </div>
        );
    };

    renderBody = () => {
        const items = this.getBodyItems();
        if (items.length === 0) {
            return null;
        }
        return (
            <ul
                className="ms-properties-viewer-body">
                {items}
            </ul>
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
            <div
                className="ms-properties-viewer"
                style={this.props.componentStyle}>
                {this.renderHeader()}
                {this.renderBody()}
            </div>
        );
    }

    toExclude = (propName) => {
        return this.props.exclude
            .indexOf(propName) === -1;
    };

    toInclude = (propName) => {
        return this.props.include
            .indexOf(propName) !== -1;
    };
}

export default PropertiesViewer;
