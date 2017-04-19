/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

require('./css/previewicon.css');

const PreviewIcon = React.createClass({
    propTypes: {
        src: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            src: ''
        };
    },
    render() {
        const {src} = this.props;
        return (
            <div className="background-preview-icon-container">
                <div className="background-preview-icon-frame">
                    <img src={src}/>
                </div>
            </div>
        );
    }
});

module.exports = PreviewIcon;
