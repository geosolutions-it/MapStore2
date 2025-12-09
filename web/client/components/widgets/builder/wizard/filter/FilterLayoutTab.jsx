/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { FormGroup, ControlLabel, InputGroup, FormControl, Panel, Glyphicon, Collapse } from 'react-bootstrap';
import Select from 'react-select';
import ColorSelector from '../../../../style/ColorSelector';
import FontAwesomeIconSelector from './FontAwesomeIconSelector/FontAwesomeIconSelector';
import SwitchButton from '../../../../misc/switch/SwitchButton';
import FlexBox from '../../../../layout/FlexBox';

const FilterLayoutTab = ({
    data = {},
    onChange = () => {}
}) => {
    const layout = data?.layout || {};
    const [expandedPanel, setExpandedPanel] = useState(null);

    const handlePanelToggle = (panelName) => {
        setExpandedPanel(expandedPanel === panelName ? null : panelName);
    };

    return (
        <div className="ms-filter-wizard-layout-tab">
            <Panel
                className="ms-filter-title-panel"
                header={
                    <FlexBox style={{ width: '100%' }}>
                        <div
                            onClick={() => handlePanelToggle('title')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Glyphicon glyph={expandedPanel === 'title' ? 'chevron-down' : 'chevron-right'} style={{ marginRight: 8 }} />
                            <strong style={{ color: 'inherit' }}>Title</strong>
                        </div>
                        <FlexBox.Fill />
                        <div style={{height: 20}} onClick={(e) => e.stopPropagation()}>
                            <SwitchButton
                                checked={!layout.titleDisabled}
                                onChange={(checked) => onChange('layout.titleDisabled', !checked)}
                            />
                        </div>
                    </FlexBox>
                }
            >
                {expandedPanel === 'title' && (
                    <Collapse in>
                        <div>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Label</ControlLabel>
                                <InputGroup>
                                    <FormControl
                                        type="text"
                                        value={layout.label || ''}
                                        placeholder="Enter label for title..."
                                        onChange={(e) => {
                                            onChange('layout.label', e.target.value);
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Icon</ControlLabel>
                                <InputGroup>
                                    <FontAwesomeIconSelector
                                        value={layout.icon}
                                        onChange={(iconName) => onChange('layout.icon', iconName)}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Font Size</ControlLabel>
                                <InputGroup>
                                    <FormControl
                                        type="number"
                                        value={layout.titleStyle?.fontSize || ''}
                                        placeholder="Enter font size..."
                                        min={8}
                                        max={72}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                            onChange('layout.titleStyle.fontSize', value);
                                        }}
                                    />
                                    <InputGroup.Addon>px</InputGroup.Addon>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Font Weight</ControlLabel>
                                <InputGroup>
                                    <Select
                                        value={layout.titleStyle?.fontWeight}
                                        options={[
                                            { value: 'normal', label: 'Normal' },
                                            { value: 'bold', label: 'Bold' }
                                        ]}
                                        placeholder="Select font weight..."
                                        onChange={(val) => onChange('layout.titleStyle.fontWeight', val?.value)}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Font Style</ControlLabel>
                                <InputGroup>
                                    <Select
                                        value={layout.titleStyle?.fontStyle}
                                        options={[
                                            { value: 'normal', label: 'Normal' },
                                            { value: 'italic', label: 'Italic' }
                                        ]}
                                        placeholder="Select font style..."
                                        onChange={(val) => onChange('layout.titleStyle.fontStyle', val?.value)}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Color</ControlLabel>
                                <InputGroup>
                                    <ColorSelector
                                        color={layout.titleStyle?.textColor}
                                        format="hex6"
                                        onChangeColor={(color) => onChange('layout.titleStyle.textColor', color)}
                                        disableAlpha
                                    />
                                </InputGroup>
                            </FormGroup>
                        </div>
                    </Collapse>
                )}
            </Panel>
            <Panel
                className="ms-filter-items-panel"
                header={
                    <div
                        onClick={() => handlePanelToggle('items')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Glyphicon glyph={expandedPanel === 'items' ? 'chevron-down' : 'chevron-right'} style={{ marginRight: 8 }} />
                        <strong >Items</strong>
                    </div>
                }
            >
                {expandedPanel === 'items' && (
                    <Collapse in>
                        <div>
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
                        </div>
                    </Collapse>
                )}
            </Panel>
            <Panel
                className="ms-filter-colors-panel"
                header={
                    <div
                        onClick={() => handlePanelToggle('colors')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Glyphicon glyph={expandedPanel === 'colors' ? 'chevron-down' : 'chevron-right'} style={{ marginRight: 8 }} />
                        <strong>Colors</strong>
                    </div>
                }
            >
                {expandedPanel === 'colors' && (
                    <Collapse in>
                        <div>
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
                            <FormGroup className="form-group-flex">
                                <ControlLabel>Background Color</ControlLabel>
                                <InputGroup>
                                    <ColorSelector
                                        color={layout.backgroundColor}
                                        format="hex6"
                                        onChangeColor={(color) => onChange('layout.backgroundColor', color)}
                                        disableAlpha
                                    />
                                </InputGroup>
                            </FormGroup>
                        </div>
                    </Collapse>
                )}
            </Panel>
        </div>
    );
};

export default FilterLayoutTab;

