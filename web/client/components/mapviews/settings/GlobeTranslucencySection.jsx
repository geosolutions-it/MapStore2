/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
    Checkbox,
    FormGroup,
    ControlLabel
} from 'react-bootstrap';
import Section from './Section';
import FormControl from '../../misc/DebouncedFormControl';
import Message from '../../I18N/Message';
import { DefaultViewValues } from '../../../utils/MapViewsUtils';

function GlobeTranslucencySection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange
}) {
    const { globeTranslucency } = view || {};
    const {
        enabled,
        fadeByDistance,
        opacity,
        nearDistance,
        farDistance
    } = globeTranslucency || {};

    return (
        <Section
            title={<Message msgId="mapViews.globeTranslucency"/>}
            initialExpanded={expandedSections.translucency}
            onExpand={(expanded) => onExpandSection({ translucency: expanded })}
        >
            <FormGroup controlId="map-views-globe-translucency-enabled">
                <Checkbox
                    checked={!!enabled}
                    onChange={() => onChange({
                        globeTranslucency: { ...globeTranslucency, enabled: !enabled }
                    })}>
                    <Message msgId="mapViews.globeTranslucencyEnable"/>
                </Checkbox>
            </FormGroup>
            <FormGroup controlId="map-views-globe-translucency-opacity">
                <ControlLabel><Message msgId="mapViews.globeTranslucencyOpacity"/></ControlLabel>
                <FormControl
                    disabled={!enabled}
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    className="opacity-field"
                    fallbackValue={DefaultViewValues.TRANSLUCENCY_OPACITY}
                    value={opacity}
                    onChange={(value) => onChange({
                        globeTranslucency: { ...globeTranslucency, opacity: value }
                    })}
                />
            </FormGroup>
            <FormGroup controlId="map-views-globe-translucency-fade-by-distance">
                <Checkbox
                    disabled={!enabled}
                    checked={!!fadeByDistance}
                    onChange={() => onChange({
                        globeTranslucency: { ...globeTranslucency, fadeByDistance: !fadeByDistance }
                    })}
                >
                    <Message msgId="mapViews.globeTranslucencyFadeByDistance"/>
                </Checkbox>
            </FormGroup>
            <FormGroup controlId="map-views-globe-translucency-near-distance">
                <ControlLabel><Message msgId="mapViews.globeTranslucencyNearDistance"/></ControlLabel>
                <FormControl
                    className="distance-field"
                    disabled={!(enabled && fadeByDistance)}
                    type="number"
                    min={0}
                    max={(farDistance ?? DefaultViewValues.TRANSLUCENCY_FAR_DISTANCE) - 1}
                    fallbackValue={DefaultViewValues.TRANSLUCENCY_NEAR_DISTANCE}
                    value={nearDistance}
                    onChange={(value) => onChange({
                        globeTranslucency: { ...globeTranslucency, nearDistance: value }
                    })}
                />
            </FormGroup>
            <FormGroup controlId="map-views-globe-translucency-far-distance">
                <ControlLabel><Message msgId="mapViews.globeTranslucencyFarDistance"/></ControlLabel>
                <FormControl
                    className="distance-field"
                    disabled={!(enabled && fadeByDistance)}
                    type="number"
                    min={(nearDistance ?? DefaultViewValues.TRANSLUCENCY_NEAR_DISTANCE) + 1}
                    fallbackValue={DefaultViewValues.TRANSLUCENCY_FAR_DISTANCE}
                    value={farDistance}
                    onChange={(value) => onChange({
                        globeTranslucency: { ...globeTranslucency, farDistance: value }
                    })}
                />
            </FormGroup>
        </Section>
    );
}

export default GlobeTranslucencySection;
