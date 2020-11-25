/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import Toolbar from './toolbar/Toolbar';
import './style/gridcard.css';

class GridCard extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        titleStyle: PropTypes.object,
        className: PropTypes.string,
        header: PropTypes.node,
        actions: PropTypes.array,
        onClick: PropTypes.func,
        toolbarProps: PropTypes.object
    };

    static defaultProps = {
        actions: [],
        header: "",
        toolbarProps: {
            btnDefaultProps: {
                className: 'square-button-md',
                bsStyle: 'primary'
            }
        }
    };

    renderActions = () => {
        return (
            <div className="gridcard-tools">
                <Toolbar buttons={this.props.actions} {...this.props.toolbarProps}/>
            </div>
        );
    };

    render() {
        return (<div
            style={this.props.style}
            className={"gridcard" + (this.props.className ? " " + this.props.className : "")}
            onClick={this.props.onClick}>
            <div style={this.props.titleStyle} className="gridcard-title bg-primary">{this.props.header}</div>
            {this.props.children}
            {this.renderActions()}
        </div>)
        ;
    }
}

export default GridCard;
