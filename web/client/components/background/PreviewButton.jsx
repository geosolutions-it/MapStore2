/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

require('./css/previewbutton.css');

const PreviewButton = React.createClass({
    propTypes: {
        src: React.PropTypes.string,
        side: React.PropTypes.number,
        label: React.PropTypes.string,
        labelHeight: React.PropTypes.number,
        onToggle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            src: '/dist/web/client/components/TOC/background/images/mapthumbs/OpenTopoMap.jpg',
            side: 50,
            label: '',
            labelHeight: 29,
            onToggle: () => {}
        };
    },
    render() {
        const {src, side, label, labelHeight, onToggle} = this.props;

        return (
            <div className="background-preview-button">
                <div className="background-preview-button-label" style={{width: side + 4, height: labelHeight}} >{label}</div>
                <div className="background-preview-button-container" onClick={onToggle} style={{width: side + 4, height: side + 4}}>
                    <div className="background-preview-button-frame" style={{width: side, height: side}}>
                        <img src={src}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PreviewButton;
