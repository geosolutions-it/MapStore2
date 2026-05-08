/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import { FormGroup, ControlLabel, InputGroup, FormControl, Panel, Glyphicon, Collapse, Checkbox, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
const TICK_INPUT_DEBOUNCE_TIME = 300;
const normalizeTickAngle = (value) => {
    const angle = Number(value);
    if (!Number.isFinite(angle)) {
        return -90;
    }
    return Math.max(-90, Math.min(90, angle));
};

const TickAngleControl = ({
    value = -90,
    onChange = () => {}
}) => {
    const normalizedValue = normalizeTickAngle(value);
    const [inputValue, setInputValue] = useState(String(normalizedValue));

    useEffect(() => {
        setInputValue(String(normalizedValue));
    }, [normalizedValue]);

    const commitValue = (nextValue) => {
        onChange(normalizeTickAngle(nextValue));
    };

    return (
        <div className="ms-filter-tick-angle-control">
            <FormControl
                className="ms-filter-tick-angle-range"
                type="range"
                min={-90}
                max={90}
                step={1}
                value={normalizedValue}
                onChange={(event) => commitValue(event.target.value)}
            />
            <FormControl
                className="ms-filter-tick-angle-number"
                type="number"
                min={-90}
                max={90}
                step={1}
                value={inputValue}
                onChange={(event) => {
                    const nextValue = event.target.value;
                    setInputValue(nextValue);
                    if (nextValue !== '') {
                        commitValue(nextValue);
                    }
                }}
                style={{ width: 68, flex: '0 0 68px', textAlign: 'right' }}
            />
        </div>
    );
};

// Keep typing local and debounced layout update later.
const DebouncedLocalizedFormControl = ({
    value = '',
    onChange = () => {},
    debounceTime = TICK_INPUT_DEBOUNCE_TIME,
    ...props
}) => {
    const inputValue = value || '';
    const [localValue, setLocalValue] = useState(inputValue);
    const committedValue = useRef(inputValue);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        committedValue.current = inputValue;
        setLocalValue(inputValue);
    }, [inputValue]);

    useEffect(() => {
        let timeout;
        if (localValue !== committedValue.current) {
            timeout = setTimeout(() => {
                committedValue.current = localValue;
                onChangeRef.current(localValue);
            }, debounceTime);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [localValue, debounceTime]);

    return (
        <LocalizedFormControl
            {...props}
            value={localValue}
            onChange={(event) => setLocalValue(event.target.value)}
        />
    );
};

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
    selections = {},
    selectableItems = []
}) => {
    const layout = data?.layout || {};
    const filterItems = Array.isArray(selectableItems) ? selectableItems : [];
    const [expandedPanel, setExpandedPanel] = useState("items");
    const isStyleList = data?.data?.userDefinedType === USER_DEFINED_TYPES.STYLE_LIST;
    const showTickAutofillButton = layout.variant === 'slider';

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
    const isSliderVariant = layout.variant === 'slider';
    const showTicks = layout.showTicks !== false;
    const tickAngle = normalizeTickAngle(layout.tickAngle);
    const variantOptions = [
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'button', label: 'Button' },
        { value: 'dropdown', label: 'Dropdown' },
        { value: 'switch', label: 'Switch' },
        ...(layout.selectionMode === 'single' ? [{ value: 'slider', label: 'Slider' }] : [])
    ];
    const localizedSelectionModeOptionsWithDisabledMultiple = localizedSelectionModeOptions.map(opt => (
        opt.value === 'multiple' && isSliderVariant
            ? { ...opt, disabled: true }
            : opt
    ));

    const handlePanelToggle = (panelName) => {
        setExpandedPanel(expandedPanel === panelName ? null : panelName);
    };

    const handleVariantChange = (val) => {
        onChange('layout.variant', val?.value);
        if (val?.value === 'slider') {
            onChange('layout.selectionMode', 'single');
            onEditorChange('selections', {
                ...selections,
                [data.id]: selections?.[data.id]?.length > 0 ? [selections[data.id][0]] : []
            });
        }
    };

    const handleSelectionModeChange = (val) => {
        const nextSelectionMode = val?.value;
        const currentSelections = selections?.[data.id] || [];
        onChange('layout.selectionMode', nextSelectionMode);
        onEditorChange('selections', {
            ...selections,
            [data.id]: nextSelectionMode === 'single' ? (currentSelections.length > 0 ? [currentSelections[0]] : []) : currentSelections
        });
        if (nextSelectionMode !== 'single' && isSliderVariant) {
            onChange('layout.variant', 'checkbox');
        }
    };

    const handleAutofillTickValues = () => {
        const tickValues = filterItems
            .map(item => item?.id)
            .filter(item => item !== undefined && item !== null && item !== '')
            .join(', ');
        onChange('layout.tickValues', tickValues);
    };

    return (
        <div className="ms-filter-wizard-layout-tab">
            <Panel
                className="ms-filter-title-panel"
                header={
                    <FlexBox style={{ width: '100%' }}>
                        <div
                            onClick={() => handlePanelToggle('title')}
                            className="accordion-title"
                        >
                            <Glyphicon glyph={expandedPanel === 'title' ? 'bottom' : 'next'} style={{ marginRight: 8 }} />
                            <strong style={{ color: 'inherit' }}><Message msgId="widgets.filterWidget.title" /></strong>
                        </div>
                        <FlexBox.Fill />
                        <div style={{height: 20}} onClick={(e) => e.stopPropagation()}>
                            <SwitchButton
                                checked={!layout.titleDisabled}
                                onChange={(checked) => onChange('layout.titleDisabled', !checked)}
                                className="mapstore-switch-btn-xs"
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
                        className="accordion-title"
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
                                        options={variantOptions}
                                        placeholder="Select variant..."
                                        onChange={handleVariantChange}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup className="form-group-flex">
                                <ControlLabel><Message msgId="widgets.filterWidget.selectionMode" /></ControlLabel>
                                <InputGroup>
                                    <Select
                                        clearable={false}
                                        value={localizedSelectedSelectionMode}
                                        options={localizedSelectionModeOptionsWithDisabledMultiple}
                                        placeholder="Select selection mode..."
                                        disabled={isStyleList}
                                        onChange={handleSelectionModeChange}
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
                                <ControlLabel>
                                    <Message msgId={layout.variant === 'slider' ? 'height' : 'widgets.filterWidget.maxHeight'} />
                                </ControlLabel>
                                <InputGroup>
                                    <LocalizedFormControl
                                        type="number"
                                        value={layout.maxHeight || ''}
                                        placeholder={layout.variant === 'slider' ? 'styleeditor.placeholderInput' : 'widgets.filterWidget.maxHeightPlaceholder'}
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

                            <FormGroup className="form-group-flex">
                                <ControlLabel>
                                    <Message msgId="widgets.filterWidget.forceSelection" />&nbsp;
                                    <InfoPopover
                                        placement="top"
                                        text={<Message msgId="widgets.filterWidget.forceSelectionTooltip" />}
                                        iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                    />
                                </ControlLabel>
                                <Checkbox
                                    checked={layout.forceSelection}
                                    onChange={() => onChange('layout.forceSelection', !layout.forceSelection)}
                                />
                            </FormGroup>
                            {layout.variant === 'slider' && (
                                <>
                                    <FormGroup className="form-group-flex">
                                        <ControlLabel>
                                            <Message msgId="widgets.filterWidget.showSelectedValue" />
                                            &nbsp;
                                            <InfoPopover
                                                placement="top"
                                                text={<Message msgId="widgets.filterWidget.showSelectedValueTooltip" />}
                                                iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                            />
                                        </ControlLabel>
                                        <Checkbox
                                            checked={layout.showSelectedValue ?? layout.showValueLabel !== false}
                                            onChange={() => onChange('layout.showSelectedValue', !(layout.showSelectedValue ?? layout.showValueLabel !== false))}
                                        />
                                    </FormGroup>
                                    <FormGroup className="form-group-flex">
                                        <ControlLabel>
                                            <Message msgId="widgets.filterWidget.showTicks" />
                                            &nbsp;
                                            <InfoPopover
                                                placement="top"
                                                text={<Message msgId="widgets.filterWidget.showTicksTooltip" />}
                                                iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                            />
                                        </ControlLabel>
                                        <Checkbox
                                            checked={showTicks}
                                            onChange={() => onChange('layout.showTicks', !showTicks)}
                                        />
                                    </FormGroup>
                                    {showTicks && (
                                        <>
                                            <FormGroup className="form-group-flex">
                                                <ControlLabel>
                                                    <Message msgId="widgets.filterWidget.tickAngle" />
                                                    &nbsp;
                                                    <InfoPopover
                                                        placement="top"
                                                        text={<Message msgId="widgets.filterWidget.tickAngleTooltip" />}
                                                        iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                                    />
                                                </ControlLabel>
                                                <TickAngleControl
                                                    value={tickAngle}
                                                    onChange={(nextTickAngle) => onChange('layout.tickAngle', nextTickAngle)}
                                                />
                                            </FormGroup>
                                            <FormGroup className="form-group-flex">
                                                <ControlLabel>
                                                    <Message msgId="widgets.filterWidget.tickValues" />
                                                    &nbsp;
                                                    <InfoPopover
                                                        placement="top"
                                                        text={<Message msgId="widgets.filterWidget.tickValuesTooltip" />}
                                                        iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                                    />
                                                </ControlLabel>
                                                <InputGroup>
                                                    <DebouncedLocalizedFormControl
                                                        type="text"
                                                        value={layout.tickValues || ''}
                                                        placeholder="widgets.filterWidget.tickValuesPlaceholder"
                                                        onChange={(value) => onChange('layout.tickValues', value)}
                                                    />
                                                    {showTickAutofillButton && (
                                                        <InputGroup.Button>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={(
                                                                    <Tooltip id="ms-filter-slider-fill-tick-values-tooltip">
                                                                        <Message msgId="widgets.filterWidget.fillTickValuesTooltip" />
                                                                    </Tooltip>
                                                                )}
                                                            >
                                                                <Button
                                                                    className="ms-filter-slider-fill-tick-values-btn"
                                                                    bsSize="small"
                                                                    onClick={handleAutofillTickValues}
                                                                >
                                                                    <Glyphicon glyph="list" />
                                                                </Button>
                                                            </OverlayTrigger>
                                                        </InputGroup.Button>
                                                    )}
                                                </InputGroup>
                                            </FormGroup>
                                            <FormGroup className="form-group-flex">
                                                <ControlLabel>
                                                    <Message msgId="widgets.filterWidget.tickLabels" />
                                                    &nbsp;
                                                    <InfoPopover
                                                        placement="top"
                                                        text={<Message msgId="widgets.filterWidget.tickLabelsTooltip" />}
                                                        iconStyle={{ marginLeft: 8, color: '#999', cursor: 'default' }}
                                                    />
                                                </ControlLabel>
                                                <InputGroup>
                                                    <DebouncedLocalizedFormControl
                                                        type="text"
                                                        value={layout.tickLabels || ''}
                                                        placeholder="widgets.filterWidget.tickLabelsPlaceholder"
                                                        onChange={(value) => onChange('layout.tickLabels', value)}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </Collapse>
                )}
            </Panel>
        </div>
    );
};

export default FilterLayoutTab;
