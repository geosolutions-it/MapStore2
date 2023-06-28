import React from 'react';
import { Button, Glyphicon, FormGroup, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';

import Message from '../../components/I18N/Message';

import { getConfigProp } from '../../utils/ConfigUtils';
import { filterCRSList, getAvailableCRS, reprojectGeoJson } from '../../utils/CoordinatesUtils';

const ImportSelectCRS = ({
    additionalCRS = {},
    crsSelectedDXF = "EPSG:3857",
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
        <div className="crs-container">

            <div className="file-selected">
                <span>
                    <Message msgId="longitudinalProfile.fileSelected"/> {feature.fileName}
                </span>
            </div>
            <ControlLabel><Message msgId="longitudinalProfile.crsSelector"/></ControlLabel>
            <FormGroup bsSize="small">
                <Select
                    className="longitudinal-profile-crs"
                    value={crsSelectedDXF}
                    clearable={false}
                    options={list}
                    onChange={(newCrs) => onChangeCRS(newCrs?.value)}
                />
                <Button onClick={() => {
                    onClose();
                    const reprojectedFt = reprojectGeoJson(feature, crsSelectedDXF, "EPSG:3857");
                    onChangeGeometry({
                        type: "LineString",
                        coordinates: reprojectedFt.geometry.coordinates,
                        projection: "EPSG:3857"
                    });
                }}>
                    <Glyphicon glyph="chevron-right"/>
                </Button>
            </FormGroup>
        </div>

    );
};

export default ImportSelectCRS;
