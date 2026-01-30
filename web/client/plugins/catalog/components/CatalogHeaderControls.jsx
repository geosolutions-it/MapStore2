/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';

const CatalogHeaderControls = ({ isPanel, onToggleMode, onClose }) => (
    <FlexBox gap="sm">
        <Button
            title={isPanel ? "Switch to Dialog View" : "Switch to Panel View"}
            onClick={onToggleMode}
        >
            <Glyphicon glyph={isPanel ? "1-full-screen" : "minus"} />
        </Button>
        <Button variant="outline" onClick={onClose}>
            <Glyphicon glyph="1-close" />
        </Button>
    </FlexBox>
);

export default CatalogHeaderControls;
