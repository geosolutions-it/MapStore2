/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {indexOf, has} = require('lodash');
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
        onLayerChange: PropTypes.func,
        setCurrentBackgroundLayer: PropTypes.func,
        projection: PropTypes.string
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
        const compatibleCrs = ['EPSG:4326', 'EPSG:3857', 'EPSG:900913'];
        const validCrs = indexOf(compatibleCrs, this.props.projection) > -1;
        const compatibleWmts = this.props.layer.type === "wmts" && has(this.props.layer.allowedSRS, this.props.projection);
        const containerClass = this.props.vertical ? 'background-preview-icon-container-vertical' : 'background-preview-icon-container-horizontal';
        const type = this.props.layer.visibility ? ' bg-primary' : ' bg-body';
        const valid = ((validCrs || compatibleWmts || this.props.layer.type === "wms" || this.props.layer.type === "empty") && !this.props.layer.invalid );

        const click = !valid ? () => {} : () => {
            this.props.onToggle();
            this.props.onPropertiesChange(this.props.layer.id, {visibility: true});
            this.props.setCurrentBackgroundLayer(this.props.layer.id);
        };
        return (
            <div className={containerClass + type + (valid ? '' : ' disabled-icon')} style={{padding: this.props.frame / 2, marginLeft: this.props.vertical ? this.props.margin : 0, marginRight: this.props.vertical ? 0 : this.props.margin, marginBottom: this.props.margin, width: this.props.side + this.props.frame, height: this.props.side + this.props.frame}}>
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
