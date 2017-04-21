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
        side: React.PropTypes.number,
        frame: React.PropTypes.number,
        margin: React.PropTypes.number,
        src: React.PropTypes.string,
        vertical: React.PropTypes.bool,
        layer: React.PropTypes.object,
        currentLayer: React.PropTypes.object,
        onToggle: React.PropTypes.func,
        onClose: React.PropTypes.func,
        setLayer: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            side: 50,
            frame: 4,
            margin: 5,
            src: '',
            vertical: false,
            layer: {},
            currentLayer: {},
            onToggle: () => {},
            onClose: () => {},
            setLayer: () => {}
        };
    },
    render() {
        const containerClass = this.props.vertical ? 'background-preview-icon-container-vertical' : 'background-preview-icon-container-horizontal';
        let type = this.props.layer.visibility ? containerClass + ' bg-primary' : containerClass + ' bg-body';
        type = this.props.layer.invalid ? containerClass + ' disabled-icon bg-body' : type;
        const click = this.props.layer.invalid ? () => {} : () => { this.props.onClose(); this.props.onToggle(this.props.layer.id, {visibility: true}); this.props.setLayer('backgroundSelector', 'currentLayer', this.props.layer); };
        return (
            <div className={type} style={{padding: this.props.frame / 2, marginLeft: this.props.vertical ? this.props.margin : 0, marginRight: this.props.vertical ? 0 : this.props.margin, marginBottom: this.props.margin, width: this.props.side + this.props.frame, height: this.props.side + this.props.frame}}>
                <div className="background-preview-icon-frame" style={{width: this.props.side, height: this.props.side}}>
                    <img
                        onMouseOver={() => { this.props.setLayer('backgroundSelector', 'tempLayer', this.props.layer); }}
                        onMouseOut={() => { this.props.setLayer('backgroundSelector', 'tempLayer', this.props.currentLayer); }}
                        onClick={click} src={this.props.src}/>
                </div>
            </div>
        );
    }
});

module.exports = PreviewIcon;
