/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

require('./css/previewicon.css');

class PreviewIcon extends React.Component {
    static propTypes = {
        side: PropTypes.number,
        frame: PropTypes.number,
        margin: PropTypes.number,
        src: PropTypes.string,
        vertical: PropTypes.bool,
        layer: PropTypes.object,
        currentLayer: PropTypes.object,
        onPropertiesChange: PropTypes.func,
        onToggle: PropTypes.func,
        onLayerChange: PropTypes.func
    };

    static defaultProps = {
        side: 50,
        frame: 4,
        margin: 5,
        src: '',
        vertical: false,
        layer: {},
        currentLayer: {},
        onPropertiesChange: () => {},
        onToggle: () => {},
        onLayerChange: () => {}
    };

    render() {
        const containerClass = this.props.vertical ? 'background-preview-icon-container-vertical' : 'background-preview-icon-container-horizontal';
        const type = this.props.layer.visibility ? ' bg-primary' : ' bg-body';
        const invalid = this.props.layer.invalid ? ' disabled-icon' : '';

        const click = this.props.layer.invalid ? () => {} : () => { this.props.onToggle(); this.props.onPropertiesChange(this.props.layer.id, {visibility: true}); this.props.onLayerChange('currentLayer', this.props.layer); };
        return (
            <div className={containerClass + type + invalid} style={{padding: this.props.frame / 2, marginLeft: this.props.vertical ? this.props.margin : 0, marginRight: this.props.vertical ? 0 : this.props.margin, marginBottom: this.props.margin, width: this.props.side + this.props.frame, height: this.props.side + this.props.frame}}>
                <div className="background-preview-icon-frame" style={{width: this.props.side, height: this.props.side}}>
                    <img
                        onMouseOver={() => { this.props.onLayerChange('tempLayer', this.props.layer); }}
                        onMouseOut={() => { this.props.onLayerChange('tempLayer', this.props.currentLayer); }}
                        onClick={click} src={this.props.src}/>
                </div>
            </div>
        );
    }
}

module.exports = PreviewIcon;
