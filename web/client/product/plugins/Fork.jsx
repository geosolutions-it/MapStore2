/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Fork Ribbon that links to MapStore GitHub repository
 * @memberof plugins
 * @prop {string} src image source
 * @class
 * @name Fork
 */
class ForkPlugin extends React.Component {
    static propTypes = {
        src: PropTypes.string
    }
    static defaultProps = {
        src: "https://github.blog/wp-content/uploads/2008/12/forkme_left_green_007200.png?resize=149%2C149"
    }
    render() {
        return (
            <a href="https://github.com/geosolutions-it/MapStore2">
                <img className="ms-fork-button" style={{position: "absolute", top: 40, left: 0, border: 0, zIndex: 100}} src={this.props.src} alt="Fork me on GitHub" />
            </a>
        );
    }
}

export default {
    ForkPlugin
};
