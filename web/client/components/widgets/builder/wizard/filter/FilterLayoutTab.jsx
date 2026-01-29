/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { FormGroup, ControlLabel, InputGroup, FormControl, Panel, Glyphicon, Collapse, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import ColorSelector from '../../../../style/ColorSelector';
import FontAwesomeIconSelector from './FontAwesomeIconSelector/FontAwesomeIconSelector';
import SwitchButton from '../../../../misc/switch/SwitchButton';
import FlexBox from '../../../../layout/FlexBox';
import Message from '../../../../I18N/Message';
import { useLocalizedOptions } from './hooks/useLocalizedOptions';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import InfoPopover from '../../../widget/InfoPopover';
import { USER_DEFINED_TYPES } from './FilterDataTab/constants';

const LocalizedFormControl = localizedProps('placeholder')(FormControl);

const SELECTION_MODE_OPTIONS = [
    { value: 'multiple', label: 'Multiple', labelKey: 'widgets.filterWidget.multiple' },
    { value: 'single', label: 'Single', labelKey: 'widgets.filterWidget.single' }
];

const DIRECTION_OPTIONS = [
    { value: 'horizontal', label: 'Horizontal', labelKey: 'widgets.filterWidget.directionHorizontal' },
    { value: 'vertical', label: 'Vertical', labelKey: 'widgets.filterWidget.directionVertical' }
];

const FilterLayoutTab = ({
    data = {},
    onChange = () => {},
    onEditorChange = () => {},
    selections = {}
}) => {
    const layout = data?.layout || {};
    const [expandedPanel, setExpandedPanel] = useState("items");
    const isStyleList = data?.data?.userDefinedType === USER_DEFINED_TYPES.STYLE_LIST;

    // Localized options for selection mode
    const selectedSelectionMode = SELECTION_MODE_OPTIONS.find(opt => opt.value === layout.selectionMode);
    const { localizedOptions: localizedSelectionModeOptions, localizedSelectedOption: localizedSelectedSelectionMode } = useLocalizedOptions(
        SELECTION_MODE_OPTIONS,
        selectedSelectionMode
    );

    // Localized options for direction
    const selectedDirection = DIRECTION_OPTIONS.find(opt => opt.value === layout.direction);
    const { localizedOptions: localizedDirectionOptions, localizedSelectedOption: localizedSelectedDirection } = useLocalizedOptions(
        DIRECTION_OPTIONS,
        selectedDirection
    );

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
                            <Glyphicon glyph={expandedPanel === 'title' ? 'bottom' : 'next'} style={{ marginRight: 8 }} />
                            <strong style={{ color: 'inherit' }}><Message msgId="widgets.filterWidget.title" /></strong>
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
                                <ControlLabel><Message msgId="widgets.filterWidget.label" /></ControlLabel>
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
                                <ControlLabel><Message msgId="widgets.filterWidget.icon" /></ControlLabel>
                                <InputGroup>
                                    <FontAwesomeIconSelector
                                        value={layout.icon}
                                        onChange={(iconName) => onChange('layout.icon', iconName)}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.fontSize" /></ControlLabel>
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
                                <ControlLabel><Message msgId="widgets.filterWidget.fontWeight" /></ControlLabel>
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
                                <ControlLabel><Message msgId="widgets.filterWidget.fontStyle" /></ControlLabel>
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
                                <ControlLabel><Message msgId="widgets.filterWidget.color" /></ControlLabel>
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
                        <Glyphicon glyph={expandedPanel === 'items' ? 'bottom' : 'next'} style={{ marginRight: 8 }} />
                        <strong ><Message msgId="widgets.filterWidget.items" /></strong>
                    </div>
                }
            >
                {expandedPanel === 'items' && (
                    <Collapse in>
                        <div>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.variant" /></ControlLabel>
                                <InputGroup>
                                    <Select
                                        clearable={false}
                                        value={layout.variant}
                                        options={[
                                            { value: 'checkbox', label: 'Checkbox' },
                                            { value: 'button', label: 'Button' },
                                            { value: 'dropdown', label: 'Dropdown' },
                                            { value: 'switch', label: 'Switch' }
                                        ]}
                                        placeholder="Select variant..."
                                        onChange={(val) => onChange('layout.variant', val?.value)}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.selectionMode" /></ControlLabel>
                                <InputGroup>
                                    <Select
                                        clearable={false}
                                        value={localizedSelectedSelectionMode}
                                        options={localizedSelectionModeOptions}
                                        placeholder="Select selection mode..."
                                        disabled={isStyleList}
                                        onChange={(val) => {
                                            onChange('layout.selectionMode', val?.value);
                                            // pick first one if changed to single
                                            onEditorChange('selections', {
                                                ...selections,
                                                [data.id]: val?.value === 'single' ? selections[data.id].length > 0 ? [selections[data.id][0]] : [] : selections[data.id]
                                            });

                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.direction" /></ControlLabel>
                                <InputGroup>
                                    <Select
                                        value={localizedSelectedDirection}
                                        options={localizedDirectionOptions}
                                        placeholder="Select direction..."
                                        onChange={(val) => onChange('layout.direction', val?.value)}
                                        clearable={false}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.maxHeight" /></ControlLabel>
                                <InputGroup>
                                    <LocalizedFormControl
                                        type="number"
                                        value={layout.maxHeight || ''}
                                        placeholder="widgets.filterWidget.maxHeightPlaceholder"
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                            onChange('layout.maxHeight', value);
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>
                                    <Message msgId="widgets.filterWidget.showSelectAllClear" />
                                </ControlLabel>

                                <Checkbox
                                    checked={layout.showSelectAll !== false}
                                    onChange={() => onChange('layout.showSelectAll', !(layout.showSelectAll !== false))}
                                />
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel>
                                    <Message msgId="widgets.filterWidget.showNoTargetsInfoLabel" />&nbsp;
                                    <InfoPopover
                                        placement="top"
                                        text={<Message msgId="widgets.filterWidget.showNoTargetsInfoDescription" />}
                                        iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                    />
                                </ControlLabel>
                                <Checkbox
                                    checked={layout.showNoTargetsInfo !== false}
                                    onChange={() => onChange('layout.showNoTargetsInfo', !(layout.showNoTargetsInfo !== false))}
                                />
                            </FormGroup>
                        </div>
                    </Collapse>
                )}
            </Panel>
        </div>
    );
};

export default FilterLayoutTab;

