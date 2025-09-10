/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PropTypes from 'prop-types';

import React from 'react';
import proj4js from 'proj4';
import { Glyphicon } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import { reproject, getUnits } from '../../../utils/CoordinatesUtils';
import MousePositionLabelDMS from './MousePositionLabelDMS';
import MousePositionLabelYX from './MousePositionLabelYX';
import CRSSelector from './CRSSelector';
import Message from '../../I18N/Message';
import { isNumber } from 'lodash';
import Button from '../../misc/Button';


import FlexBox from '../../layout/FlexBox';
import Text from '../../layout/Text';

import './mousePosition.css';
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
        crsTemplate: crs => <span>{crs}</span>,
        elevationTemplate: elevation => isNumber(elevation) ? `Alt: ${elevation} m` : '',
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
            ({x, y} = reproject([x, y], this.props.mousePosition.crs, this.props.crs));
        }
        let units = getUnits(this.props.crs);
        if (units === "degrees") {
            return {lat: y, lng: x, z};
        }
        return {x, y, z};
    };

    getTemplateComponent = () => {
        return getUnits(this.props.crs) === "degrees" ? this.props.degreesTemplate : this.props.projectedTemplate;
    };

    render() {
        let Template = this.props.mousePosition ? this.getTemplateComponent() : null;
        if (this.props.enabled) {
            const position = this.getPosition();
            return (
                <div>
                    <FlexBox component={Text} fontSize="sm" centerChildrenVertically gap="sm" classNames={['_padding-lr-sm']}>
                        {this.props.showLabels ? <Message msgId="mouseCoordinates"/> : null}
                        <FlexBox centerChildrenVertically gap="sm" classNames={['_padding-xs']} style={{ border: '1px solid #ddd', borderRadius: 4 }}>
                            {Template ? <Template position={position} /> : '...'}
                            {this.props.showElevation ? this.props.elevationTemplate(position.z) : null}
                            {this.props.showCRS ? this.props.crsTemplate(this.props.crs) : null}
                            {this.props.copyToClipboardEnabled ?
                                <CopyToClipboard text={JSON.stringify(position)} onCopy={this.props.onCopy}>
                                    <Button bsSize={this.props.btnSize} style={{ padding: 0, borderColor: 'transparent' }}>
                                        {<Glyphicon glyph={this.props.glyphicon}/>}
                                    </Button>
                                </CopyToClipboard>
                                : null}
                        </FlexBox>
                        {this.props.editCRS ?
                            <CRSSelector
                                projectionDefs={this.props.projectionDefs}
                                filterAllowedCRS={this.props.filterAllowedCRS}
                                additionalCRS={this.props.additionalCRS}
                                label={this.props.showLabels ? <Message msgId="mousePositionCRS"/> : null}
                                crs={this.props.crs} enabled onCRSChange={this.props.onCRSChange}
                            /> : null}
                        {this.props.showToggle ? this.props.toggle : null}
                    </FlexBox>
                </div>
            );
        }
        return this.props.showToggle ? <div id={this.props.id} style={this.props.style}>{this.props.toggle}</div> : null;
    }
}

export default MousePosition;
