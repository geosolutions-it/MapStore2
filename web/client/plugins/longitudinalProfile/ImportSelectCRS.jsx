import React from 'react';
import { Button, FormGroup, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';

import Message from '../../components/I18N/Message';

import { getConfigProp } from '../../utils/ConfigUtils';
import { filterCRSList, getAvailableCRS, reprojectGeoJson } from '../../utils/CoordinatesUtils';

const ImportSelectCRS = ({
    additionalCRS = {},
    crsSelected = "EPSG:4326",
    feature,
    filterAllowedCRS = ["EPSG:4326", "EPSG:3857"],
    onChangeGeometry,
    onChangeCRS,
    onClose
}) => {
    let list = [];
    const usableCRS = getAvailableCRS();
    let availableCRS = {};
    if (Object.keys(usableCRS).length) {
        availableCRS = filterCRSList(usableCRS, filterAllowedCRS, additionalCRS, getConfigProp('projectionDefs') || [] );
    }
    for (let item in availableCRS) {
        if (availableCRS.hasOwnProperty(item)) {
            list.push({value: item, label: item});
        }
    }
    return (
        <FormGroup bsSize="small">
            <ControlLabel><Message msgId="longitudinalProfile.crsSelector"/></ControlLabel>
            <Select
                id="longitudinal-profile-crs"
                className="longitudinal-profile-crs"
                value={crsSelected}
                clearable={false}
                options={list}
                onChange={(newCrs) => onChangeCRS(newCrs?.value)}
            />
            <Button onClick={() => {
                onClose();
                const reprojectedFt = reprojectGeoJson(feature, crsSelected, "EPSG:3857");
                onChangeGeometry({
                    type: "LineString",
                    coordinates: reprojectedFt.geometry.coordinates,
                    projection: 'EPSG:3857'
                });
            }}>Continue</Button>
        </FormGroup>

    );
};

export default ImportSelectCRS;
