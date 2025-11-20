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
import HeightTypeSelector from './HeightTypeSelector';
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
 * @prop {string[]} filterAllowedHeight list of allowed height type in the combobox list. Accepted values are "Ellipsoidal" and "MSL"
 * @prop {object[]} projectionDefs list of additional project definitions
 * @prop {object} additionalCRS additional crs to be added to the list
 */
const MousePosition = (props) => {
    const {
        id,
        mousePosition,
        crs,
        heightType,
        enabled,
        showCRS,
        editCRS,
        editHeight,
        degreesTemplate,
        projectedTemplate,
        crsTemplate,
        elevationTemplate,
        style,
        copyToClipboardEnabled,
        glyphicon,
        btnSize,
        onCopy,
        onCRSChange,
        onHeightTypeChange,
        toggle,
        showLabels,
        showToggle,
        showElevation,
        crsId,
        heightId,
        projectionDefs,
        filterAllowedCRS,
        additionalCRS,
        filterAllowedHeight,
        additionalHeight
    } = props;

    const getPosition = () => {
        let {x, y, z} = mousePosition ? mousePosition : [null, null];
        if (!x && !y && !z) {
            // if we repoject null coordinates we can end up with -0.00 instead of 0.00
            return {x: 0, y: 0, z};
        } else if (proj4js.defs(mousePosition.crs) !== proj4js.defs(crs)) {
            const reprojected = reproject([x, y], mousePosition.crs, crs);
            return {x: reprojected.x, y: reprojected.y, z};
        }
        let units = getUnits(crs);
        if (units === "degrees") {
            return {lat: y, lng: x, z};
        }
        return {x, y, z};
    };

    const getTemplateComponent = () => {
        return getUnits(crs) === "degrees" ? degreesTemplate : projectedTemplate;
    };

    if (!enabled) {
        return showToggle ? <div id={id} style={style}>{toggle}</div> : null;
    }

    const Template = mousePosition ? getTemplateComponent() : null;
    const position = mousePosition ? getPosition() : null;

    return (
        <div id={id}>
            <FlexBox component={Text} fontSize="sm" centerChildrenVertically gap="sm" classNames={['_padding-lr-sm']}>
                {showLabels ? <Message msgId="mouseCoordinates"/> : null}
                <FlexBox centerChildrenVertically gap="sm" classNames={['_padding-xs']} style={{ border: '1px solid #ddd', borderRadius: 4 }}>
                    {Template ? <Template position={position} /> : '...'}
                    {showElevation && position ? elevationTemplate(position.z) : null}
                    {showCRS ? crsTemplate(crs) : null}
                    {copyToClipboardEnabled && position ?
                        <CopyToClipboard text={JSON.stringify(position)} onCopy={onCopy}>
                            <Button bsSize={btnSize} style={{ padding: 0, borderColor: 'transparent' }}>
                                {<Glyphicon glyph={glyphicon}/>}
                            </Button>
                        </CopyToClipboard>
                        : null}
                </FlexBox>
                {editCRS ?
                    <CRSSelector
                        id={crsId}
                        projectionDefs={projectionDefs}
                        filterAllowedCRS={filterAllowedCRS}
                        additionalCRS={additionalCRS}
                        label={showLabels ? <Message msgId="mousePositionCRS"/> : null}
                        crs={crs} enabled onCRSChange={onCRSChange}
                    /> : null}
                {editHeight ?
                    <HeightTypeSelector
                        id={heightId}
                        filterAllowedHeight={filterAllowedHeight}
                        additionalHeight={additionalHeight}
                        label={showLabels ? <Message msgId="mousePositionHeight"/> : null}
                        heightType={heightType} enabled onHeightTypeChange={onHeightTypeChange}
                    /> : null}
                {showToggle ? toggle : null}
            </FlexBox>
        </div>
    );
};

MousePosition.propTypes = {
    crsId: PropTypes.string,
    heightId: PropTypes.string,
    id: PropTypes.string,
    mousePosition: PropTypes.object,
    crs: PropTypes.string,
    heightType: PropTypes.string,
    enabled: PropTypes.bool,
    showCRS: PropTypes.bool,
    editCRS: PropTypes.bool,
    editHeight: PropTypes.bool,
    filterAllowedCRS: PropTypes.array,
    projectionDefs: PropTypes.array,
    filterAllowedHeight: PropTypes.array,
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
    onHeightTypeChange: PropTypes.func,
    toggle: PropTypes.object,
    showLabels: PropTypes.bool,
    showToggle: PropTypes.bool,
    showElevation: PropTypes.bool
};

MousePosition.defaultProps = {
    crsId: "mapstore-crsselector",
    id: "mapstore-mouseposition",
    heightId: "mapstore-heightselector",
    mousePosition: null,
    crs: "EPSG:4326",
    heightType: "Ellipsoidal",
    enabled: true,
    showCRS: false,
    editCRS: false,
    editHeight: false,
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
    onHeightTypeChange: function() {},
    toggle: <div></div>,
    showLabels: false,
    showToggle: false,
    showElevation: false
};

export default MousePosition;
