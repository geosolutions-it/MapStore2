/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import ReactDOM from 'react-dom';

import { filterCRSList, getAvailableCRS } from '../../../utils/CoordinatesUtils';
import FlexBox from '../../layout/FlexBox';

const CRSSelector = (props) => {
    const {
        id,
        label,
        availableCRS,
        filterAllowedCRS,
        projectionDefs,
        additionalCRS,
        crs,
        enabled,
        onCRSChange,
        useRawInput
    } = props;

    const formRef = useRef(null);

    const launchNewCRSAction = (ev) => {
        if (useRawInput) {
            onCRSChange(ev.target.value);
        } else {
            const element = ReactDOM.findDOMNode(formRef.current);
            const selectNode = element.getElementsByTagName('select').item(0);
            onCRSChange(selectNode.value);
        }
    };

    if (!enabled) {
        return null;
    }

    const filteredCRS = Object.keys(availableCRS).length
        ? filterCRSList(availableCRS, filterAllowedCRS, additionalCRS, projectionDefs)
        : {};

    const options = Object.entries(filteredCRS).map(([crsKey, crsValue]) => (
        <option value={crsKey} key={crsKey}>{crsValue.label}</option>
    ));

    if (useRawInput) {
        return (
            <select
                id={id}
                value={crs}
                onChange={launchNewCRSAction}
                bsSize="small"
            >
                {options}
            </select>
        );
    }

    return (
        <FlexBox
            ref={formRef}
            component={FormGroup}
            centerChildrenVertically
            gap="sm"
        >
            <ControlLabel style={{ margin: 0, fontWeight: 'normal', minWidth: 'max-content' }}>
                {label}
            </ControlLabel>
            <FormControl
                componentClass="select"
                id={id}
                value={crs}
                onChange={launchNewCRSAction}
                bsSize="small"
                style={{ borderRadius: 4 }}
            >
                {options}
            </FormControl>
        </FlexBox>
    );
};

CRSSelector.propTypes = {
    id: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
    availableCRS: PropTypes.object,
    filterAllowedCRS: PropTypes.array,
    projectionDefs: PropTypes.array,
    additionalCRS: PropTypes.object,
    crs: PropTypes.string,
    enabled: PropTypes.bool,
    onCRSChange: PropTypes.func,
    useRawInput: PropTypes.bool
};

CRSSelector.defaultProps = {
    id: "mapstore-crsselector",
    availableCRS: getAvailableCRS(),
    crs: null,
    onCRSChange: function() {},
    enabled: false,
    useRawInput: false
};

export default CRSSelector;
