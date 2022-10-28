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
import FormControl from '../../misc/DebouncedFormControl';
import { DefaultViewValues } from '../../../utils/MapViewsUtils';
import Section from './Section';
import Message from '../../I18N/Message';

function AnimationSection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange
}) {

    return (
        <Section
            title={<Message msgId="mapViews.animation"/>}
            initialExpanded={expandedSections.animation}
            onExpand={(expanded) => onExpandSection({ animation: expanded })}
        >
            <FormGroup
                controlId="map-views-animation-duration">
                <ControlLabel><Message msgId="mapViews.durationLabel"/></ControlLabel>
                <FormControl
                    min={1}
                    className="time-field"
                    type="number"
                    fallbackValue={DefaultViewValues.DURATION}
                    value={view?.duration}
                    onChange={(value) => onChange({ duration: value })}
                />
            </FormGroup>
            <FormGroup
                controlId="map-views-animation-fly-to">
                <Checkbox
                    checked={!!view?.flyTo}
                    onChange={() => onChange({ flyTo: !view?.flyTo })}
                >
                    <Message msgId="mapViews.flyToLabel"/>
                </Checkbox>
            </FormGroup>
        </Section>
    );
}

export default AnimationSection;
