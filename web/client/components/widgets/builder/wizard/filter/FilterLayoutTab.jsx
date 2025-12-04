/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, ControlLabel, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import ColorSelector from '../../../../style/ColorSelector';

const FilterLayoutTab = ({
    data = {},
    onChange = () => {}
}) => {
    const layout = data?.layout || {};

    return (
        <div className="ms-filter-wizard-layout-tab">
            <FormGroup className="form-group-flex">
                <ControlLabel>Icon</ControlLabel>
                <InputGroup>
                    {/* TODO: Replace by real Icon selector with visualization (Glyphicon, Font Awesome) */}
                    <Select
                        value={layout.icon}
                        options={[
                            { value: 'filter', label: 'Filter' },
                            { value: 'tag', label: 'Tag' },
                            { value: 'flag', label: 'Flag' },
                            { value: 'star', label: 'Star' },
                            { value: 'bookmark', label: 'Bookmark' },
                            { value: 'check', label: 'Check' },
                            { value: 'user', label: 'User' },
                            { value: 'calendar', label: 'Calendar' },
                            { value: 'cog', label: 'Settings' },
                            { value: 'search', label: 'Search' },
                            { value: 'list', label: 'List' },
                            { value: 'stats', label: 'Stats' },
                            { value: 'features-grid', label: 'Grid' },
                            { value: 'folder-open', label: 'Folder' },
                            { value: 'globe', label: 'Globe' },
                            { value: 'map', label: 'Map' },
                            { value: 'layer', label: 'Layer' },
                            { value: 'info-sign', label: 'Info' },
                            { value: 'alert', label: 'Alert' },
                            { value: 'time', label: 'Time' }
                        ]}
                        placeholder="Select icon..."
                        onChange={(val) => onChange('layout.icon', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Variant</ControlLabel>
                <InputGroup>
                    <Select
                        value={layout.variant}
                        options={[
                            { value: 'checkbox', label: 'Checkboxes' },
                            { value: 'chips', label: 'Chips' },
                            { value: 'dropdown', label: 'Dropdowns' },
                            { value: 'switch', label: 'Switches' }
                        ]}
                        placeholder="Select variant..."
                        onChange={(val) => onChange('layout.variant', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Selection Mode</ControlLabel>
                <InputGroup>
                    <Select
                        value={layout.selectionMode}
                        options={[
                            { value: 'multiple', label: 'Multiple' },
                            { value: 'single', label: 'Single' }
                        ]}
                        placeholder="Select selection mode..."
                        onChange={(val) => onChange('layout.selectionMode', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Direction</ControlLabel>
                <InputGroup>
                    <Select
                        value={layout.direction}
                        options={[
                            { value: 'horizontal', label: 'Horizontal' },
                            { value: 'vertical', label: 'Vertical' }
                        ]}
                        placeholder="Select direction..."
                        onChange={(val) => onChange('layout.direction', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Max Height</ControlLabel>
                <InputGroup>
                    <FormControl
                        type="number"
                        value={layout.maxHeight || ''}
                        placeholder="Enter max height..."
                        onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                            onChange('layout.maxHeight', value);
                        }}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Selected Color</ControlLabel>
                <InputGroup>
                    <ColorSelector
                        color={layout.selectedColor}
                        format="hex6"
                        onChangeColor={(color) => onChange('layout.selectedColor', color)}
                        disableAlpha
                    />
                </InputGroup>
            </FormGroup>
        </div>
    );
};

export default FilterLayoutTab;

