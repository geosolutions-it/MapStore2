const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const proj4js = require('proj4');
const {Glyphicon, Button} = require('react-bootstrap');
const CopyToClipboard = require('react-copy-to-clipboard');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const MousePositionLabelDMS = require('./MousePositionLabelDMS');
const MousePositionLabelYX = require('./MousePositionLabelYX');

require('./mousePosition.css');

class MousePosition extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        mousePosition: PropTypes.object,
        crs: PropTypes.string,
        enabled: PropTypes.bool,
        degreesTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        projectedTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        style: PropTypes.object,
        copyToClipboardEnabled: PropTypes.bool,
        glyphicon: PropTypes.string,
        btnSize: PropTypes.oneOf(["large", "medium", "small", "xsmall"]),
        onCopy: PropTypes.func
    };

    static defaultProps = {
        id: "mapstore-mouseposition",
        mousePosition: null,
        crs: "EPSG:4326",
        enabled: true,
        degreesTemplate: MousePositionLabelDMS,
        projectedTemplate: MousePositionLabelYX,
        style: {},
        copyToClipboardEnabled: false,
        glyphicon: "paste",
        btnSize: "xsmall",
        onCopy: () => {}
    };

    getUnits = (crs) => {
        return proj4js.defs(crs).units;
    };

    getPosition = () => {
        let {x, y} = this.props.mousePosition ? this.props.mousePosition : [null, null];
        if (!x && !y) {
            // if we repoject null coordinates we can end up with -0.00 instead of 0.00
            ({x, y} = {x: 0, y: 0});
        } else if (proj4js.defs(this.props.mousePosition.crs) !== proj4js.defs(this.props.crs)) {
            ({x, y} = CoordinatesUtils.reproject([x, y], this.props.mousePosition.crs, this.props.crs));
        }
        let units = this.getUnits(this.props.crs);
        if (units === "degrees") {
            return {lat: y, lng: x};
        }
        return {x, y};
    };

    getTemplateComponent = () => {
        return this.getUnits(this.props.crs) === "degrees" ? this.props.degreesTemplate : this.props.projectedTemplate;
    };

    render() {
        let Template = this.props.mousePosition ? this.getTemplateComponent() : null;
        if (this.props.enabled && Template) {
            const position = this.getPosition();
            return (
                    <div id={this.props.id} style={this.props.style}>
                        <Template position={position} />
                        {this.props.copyToClipboardEnabled &&
                            <CopyToClipboard text={JSON.stringify(position)} onCopy={this.props.onCopy}>
                                <Button bsSize={this.props.btnSize}>
                                    {<Glyphicon glyph={this.props.glyphicon}/>}
                                </Button>
                            </CopyToClipboard>
                        }
                    </div>
            );
        }
        return null;
    }
}

module.exports = MousePosition;
