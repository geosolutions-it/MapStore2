/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const proj4js = require('proj4').default;
const {Glyphicon, Button, Label} = require('react-bootstrap');
const CopyToClipboard = require('react-copy-to-clipboard');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const MousePositionLabelDMS = require('./MousePositionLabelDMS');
const MousePositionLabelYX = require('./MousePositionLabelYX');
const CRSSelector = require('./CRSSelector');
const Message = require('../../I18N/Message');
const {isNumber} = require('lodash');

require('./mousePosition.css');
/**
 * MousePosition is a component that shows the coordinate of the mouse position in a selected crs.
 * @class
 * @memberof components.mousePosition
 * @prop {boolean} showElevation shows elevation in addition to planar coordinates (requires a WMS layer with useElevation: true to be configured in the map)
 * @prop {function} elevationTemplate custom template to show the elevation if showElevation is true (default template shows the elevation number with no formatting)
 * @prop {string[]} filterAllowedCRS list of allowed crs in the combobox list
 * @prop {object[]} projectionDefs list of additional project definitions
 * @prop {object} additionalCRS additional crs to be added to the list
 */
class MousePosition extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        mousePosition: PropTypes.object,
        crs: PropTypes.string,
        enabled: PropTypes.bool,
        showCRS: PropTypes.bool,
        editCRS: PropTypes.bool,
        filterAllowedCRS: PropTypes.array,
        projectionDefs: PropTypes.array,
        additionalCRS: PropTypes.object,
        degreesTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        projectedTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        crsTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        elevationTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        style: PropTypes.object,
        copyToClipboardEnabled: PropTypes.bool,
        glyphicon: PropTypes.string,
        btnSize: PropTypes.oneOf(["large", "medium", "small", "xsmall"]),
        onCopy: PropTypes.func,
        onCRSChange: PropTypes.func,
        toggle: PropTypes.object,
        showLabels: PropTypes.bool,
        showToggle: PropTypes.bool,
        showElevation: PropTypes.bool
    };

    static defaultProps = {
        id: "mapstore-mouseposition",
        mousePosition: null,
        crs: "EPSG:4326",
        enabled: true,
        showCRS: false,
        editCRS: false,
        degreesTemplate: MousePositionLabelDMS,
        projectedTemplate: MousePositionLabelYX,
        crsTemplate: crs => <span className="mouseposition-crs">{crs}</span>,
        elevationTemplate: elevation => isNumber(elevation) ? <span className="mouseposition-elevation">{elevation} m</span> : <Message msgId="mousePositionNoElevation"/>,
        style: {},
        copyToClipboardEnabled: false,
        glyphicon: "paste",
        btnSize: "xsmall",
        onCopy: () => {},
        onCRSChange: function() {},
        toggle: <div></div>,
        showLabels: false,
        showToggle: false,
        showElevation: false
    };

    getPosition = () => {
        let {x, y, z} = this.props.mousePosition ? this.props.mousePosition : [null, null];
        if (!x && !y) {
            // if we repoject null coordinates we can end up with -0.00 instead of 0.00
            ({x, y} = {x: 0, y: 0, z});
        } else if (proj4js.defs(this.props.mousePosition.crs) !== proj4js.defs(this.props.crs)) {
            ({x, y} = CoordinatesUtils.reproject([x, y], this.props.mousePosition.crs, this.props.crs));
        }
        let units = CoordinatesUtils.getUnits(this.props.crs);
        if (units === "degrees") {
            return {lat: y, lng: x, z};
        }
        return {x, y, z};
    };

    getTemplateComponent = () => {
        return CoordinatesUtils.getUnits(this.props.crs) === "degrees" ? this.props.degreesTemplate : this.props.projectedTemplate;
    };

    render() {
        let Template = this.props.mousePosition ? this.getTemplateComponent() : null;
        if (this.props.enabled) {
            const position = this.getPosition();
            return (
                <div id={this.props.id} style={this.props.style}>
                    <span className="mapstore-mouse-coordinates">
                        {this.props.showLabels ? <label><Message msgId="mouseCoordinates"/></label> : null}
                        {Template ? <Template position={position} /> :
                            <h5>
                                <Label bsSize="lg" bsStyle="info">{'...'}<span/></Label>
                            </h5>
                        }
                    </span>
                    {this.props.copyToClipboardEnabled &&
                            <CopyToClipboard text={JSON.stringify(position)} onCopy={this.props.onCopy}>
                                <Button bsSize={this.props.btnSize}>
                                    {<Glyphicon glyph={this.props.glyphicon}/>}
                                </Button>
                            </CopyToClipboard>
                    }
                    {this.props.showElevation ? <span className="mapstore-mouse-elevation">
                        {this.props.showLabels ? <label><Message msgId="mousePositionElevation" /></label> : null}
                        <h5>{this.props.elevationTemplate(position.z)}</h5>
                    </span> : null}
                    {this.props.showCRS ? this.props.crsTemplate(this.props.crs) : null}
                    {this.props.editCRS ?
                        <CRSSelector projectionDefs={this.props.projectionDefs}
                            filterAllowedCRS={this.props.filterAllowedCRS}
                            additionalCRS={this.props.additionalCRS} label={this.props.showLabels ? <label><Message msgId="mousePositionCRS"/></label> : null}
                            crs={this.props.crs} enabled onCRSChange={this.props.onCRSChange}/> : null}
                    {this.props.showToggle ? this.props.toggle : null}
                </div>
            );
        }
        return this.props.showToggle ? <div id={this.props.id} style={this.props.style}>{this.props.toggle}</div> : null;
    }
}

module.exports = MousePosition;
