/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InputGroup } from 'react-bootstrap';
import { isNumber } from 'lodash';
import CoordinateEntry from '../../../misc/coordinateeditors/CoordinateEntry';
import Message from '../../../I18N/Message';

/**
 * Lightweight coordinate editor for geostory map center.
 * Renders Lat/Lon fields and fires onChange immediately when a value is modified.
 */
const CoordinatesEditor = ({ center = {}, onChange = () => {} }) => {
    const [lat, setLat] = useState(isNumber(center.y) ? center.y : "");
    const [lon, setLon] = useState(isNumber(center.x) ? center.x : "");
    const centerRef = useRef(center);
    centerRef.current = center;

    useEffect(() => {
        setLat(isNumber(center.y) ? center.y : "");
        setLon(isNumber(center.x) ? center.x : "");
    }, [center.x, center.y]);

    const onChangeLat = useCallback((val) => {
        const parsed = parseFloat(val);
        if (val === "" || isNaN(parsed)) return;
        setLat(parsed);
        onChange({
            ...centerRef.current,
            y: parsed,
            crs: centerRef.current.crs || 'EPSG:4326'
        });
    }, [onChange]);

    const onChangeLon = useCallback((val) => {
        const parsed = parseFloat(val);
        if (val === "" || isNaN(parsed)) return;
        setLon(parsed);
        onChange({
            ...centerRef.current,
            x: parsed,
            crs: centerRef.current.crs || 'EPSG:4326'
        });
    }, [onChange]);

    return (
        <div className="ms-geostory-center-coordinates">
            <div className="input-group-container">
                <InputGroup>
                    <InputGroup.Addon><Message msgId="latitude"/></InputGroup.Addon>
                    <CoordinateEntry
                        coordinate="lat"
                        idx={0}
                        value={lat}
                        onChange={onChangeLat}
                    />
                </InputGroup>
            </div>
            <div className="input-group-container">
                <InputGroup>
                    <InputGroup.Addon><Message msgId="longitude"/></InputGroup.Addon>
                    <CoordinateEntry
                        coordinate="lon"
                        idx={0}
                        value={lon}
                        onChange={onChangeLon}
                    />
                </InputGroup>
            </div>
        </div>
    );
};

export default CoordinatesEditor;
