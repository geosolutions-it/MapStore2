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
        frame: React.PropTypes.number,
        margin: React.PropTypes.number,
        labelHeight: React.PropTypes.number,
        label: React.PropTypes.string,
        showLabel: React.PropTypes.bool,
        onToggle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            src: './images/mapthumbs/none.jpg',
            side: 50,
            frame: 4,
            margin: 5,
            labelHeight: 29,
            label: '',
            showLabel: true,
            onToggle: () => {}
        };
    },
    render() {
        return (
            <div className="background-preview-button" style={{margin: this.props.margin}}>
                <div className="background-preview-button-container bg-body" onClick={this.props.onToggle} style={{padding: this.props.frame / 2, width: this.props.side + this.props.frame, height: this.props.side + this.props.frame}}>
                    {this.props.showLabel ? (<div className="background-preview-button-label" style={{width: this.props.side, height: this.props.labelHeight, marginTop: 0, padding: 0}} ><div className="bg-body bg-text" style={{padding: this.props.frame }}>{this.props.label}</div></div>) : null}
                    <div className="background-preview-button-frame" style={{width: this.props.side, height: this.props.side}}>
                        <img src={this.props.src}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PreviewButton;
