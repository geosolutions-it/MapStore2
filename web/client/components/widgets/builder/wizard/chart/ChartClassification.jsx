/*
  * Copyright 2023, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import uuid from 'uuid/v1';
import ColorSelector from '../../../../style/ColorSelector';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
import { FormGroup, ControlLabel, InputGroup, Checkbox, Button as ButtonRB, Glyphicon } from 'react-bootstrap';
import Select from "react-select";
import Message from "../../../../I18N/Message";
import ColorRamp from '../../../../styleeditor/ColorRamp';
import { ControlledPopover } from '../../../../styleeditor/Popover';
import multiProtocolChart from '../../../enhancers/multiProtocolChart';
import ThemeClassesEditor from '../../../../style/ThemaClassesEditor';
import { availableMethods } from '../../../../../api/GeoJSONClassification';
import { standardClassificationScales } from '../../../../../utils/ClassificationUtils';
import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import Loader from '../../../../misc/Loader';
import withClassifyGeoJSONSync from '../../../../charts/withClassifyGeoJSONSync';
import HTML from '../../../../I18N/HTML';
import {
    generateClassifiedData,
    getAggregationAttributeDataKey,
    parsePieNoAggregationFunctionData
} from '../../../../../utils/WidgetsUtils';
import tooltip from '../../../../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

const RAMP_PREVIEW_CLASSES = 5;

const rampOptions = standardClassificationScales
    .map((entry) => ({
        ...entry,
        colors: chroma.scale(entry.colors).colors(RAMP_PREVIEW_CLASSES)
    }));

const ComputeClassification = withClassifyGeoJSONSync(
    multiProtocolChart(({
        data,
        traces,
        chartType,
        classifyGeoJSONSync,
        onChangeStyle = () => {},
        loading
    }) => {
        const msClassification = traces?.[0]?.style?.msClassification || {};
        const groupByAttributesKey =  traces?.[0]?.options?.groupByAttributes;
        const classificationDataKey = traces?.[0]?.options?.classificationAttribute
            || groupByAttributesKey;
        const traceData = data?.[0] &&
            (traces?.[0]?.type === 'pie'
                ? parsePieNoAggregationFunctionData(data[0], traces?.[0]?.options)
                : data?.[0]);
        const classes = msClassification?.classes;
        const loader = loading ? <div style={{ display: 'flex', justifyContent: 'center' }}><Loader size={30} /></div> : null;
        if (!classes && !(classifyGeoJSONSync && traceData && classificationDataKey) || loading) {
            return loader;
        }
        const method = msClassification.method || 'uniqueInterval';
        const { classes: computedClasses } = !classes ? generateClassifiedData({
            type: traces?.[0]?.type,
            sortBy: traces?.[0]?.sortBy,
            data: traceData,
            options: traces?.[0]?.options,
            msClassification,
            classifyGeoJSON: classifyGeoJSONSync,
            excludeOthers: true,
            applyCustomSortFunctionOnClasses: true
        }) : [];
        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><Message msgId="widgets.builder.wizard.classAttributes.classColor"/></div>
                    {method === 'uniqueInterval' ?
                        <div style={{ flex: 1 }}><Message msgId="widgets.builder.wizard.classAttributes.classValue"/></div>
                        : <>
                            <div style={{ flex: 1 }}><Message msgId="widgets.builder.wizard.classAttributes.minValue"/></div>
                            <div style={{ flex: 1 }}><Message msgId="widgets.builder.wizard.classAttributes.maxValue"/></div>
                        </>}
                    <div style={{ flex: 1 }}>
                        <Message msgId="widgets.builder.wizard.classAttributes.classLabel"/>{' '}
                        <DisposablePopover
                            popoverClassName="chart-color-class-popover"
                            placement="top"
                            title={<Message msgId="widgets.builder.wizard.classAttributes.customLabels" />}
                            text={<HTML msgId={method === 'uniqueInterval'
                                ? `widgets.builder.wizard.classAttributes.${chartType}ChartCustomLabelsExample`
                                : `widgets.builder.wizard.classAttributes.${chartType}RangeClassChartCustomLabelsExample`} />}
                        />
                    </div>
                    <div style={{ width: 30 }} />
                </div>
                <ThemeClassesEditor
                    classification={classes || (computedClasses || []).map(({ insideClass, index, label, ...entry }) => ({
                        ...entry,
                        id: uuid()
                    }))}
                    uniqueValuesClasses={method === 'uniqueInterval'}
                    autoCompleteOptions={traces?.[0]?.layer && {
                        classificationAttribute: classificationDataKey,
                        dropUpAutoComplete: true,
                        layer: traces[0].layer
                    }}
                    customLabels
                    onUpdateClasses={(newClasses) => onChangeStyle('msClassification.classes', newClasses)}
                />
            </>
        );
    })
);

function getScrollableParent(node) {
    if (node === null || node === document.body) {
        return null;
    }
    if (node.scrollHeight > node.clientHeight) {
        return node;
    }
    return getScrollableParent(node.parentNode);
}

const CustomClassification = ({
    traces,
    containerNode,
    disabled,
    placement,
    onChangeStyle = () => {}
}) => {
    const [open, setOpen] = useState();
    const node = useRef();
    const msClassification = traces?.[0]?.style?.msClassification || {};
    const chartType = traces?.[0]?.type || '';
    useEffect(() => {
        const onScroll = () => setOpen(false);
        const scrollableNode = getScrollableParent(node.current);
        if (scrollableNode) {
            scrollableNode.addEventListener('scroll', onScroll);
        }
        return () => {
            if (scrollableNode) {
                scrollableNode.removeEventListener('scroll', onScroll);
            }
        };
    }, []);
    return (
        <ControlledPopover
            open={open}
            onClick={() => setOpen(!open)}
            disabled={disabled}
            placement={placement}
            containerNode={containerNode}
            content={
                <div className="ms-wizard-chart-custom-classification">
                    <div className="ms-wizard-form-separator">
                        <Message msgId="widgets.builder.wizard.classAttributes.title" />
                        <Button
                            className="no-border square-button-md"
                            onClick={() => setOpen(false)}
                        >
                            <Glyphicon glyph="1-close"/>
                        </Button>
                    </div>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId={"widgets.builder.wizard.classAttributes.defaultColor"} /></ControlLabel>
                        <InputGroup>
                            <ColorSelector
                                format="rgb"
                                color={msClassification?.defaultColor || '#ffff00'}
                                onChangeColor={(color) => color && onChangeStyle('msClassification.defaultColor', color)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="form-group-flex">
                        <ControlLabel>
                            <Message msgId="widgets.builder.wizard.classAttributes.defaultClassLabel" />{' '}
                            <DisposablePopover
                                popoverClassName="chart-color-class-popover"
                                placement="top"
                                title={<Message msgId="widgets.builder.wizard.classAttributes.customLabels" />}
                                text={<HTML msgId={
                                    msClassification?.method === 'uniqueInterval' || !msClassification?.method
                                        ? `widgets.builder.wizard.classAttributes.${chartType}ChartCustomLabelsExample`
                                        : `widgets.builder.wizard.classAttributes.${chartType}RangeDefaultChartCustomLabelsExample`
                                } />}
                            />
                        </ControlLabel>
                        <InputGroup>
                            <DebouncedFormControl
                                value={msClassification?.defaultLabel || ''}
                                style={{ zIndex: 0 }}
                                onChange={eventValue => onChangeStyle('msClassification.defaultLabel', eventValue)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="form-group-flex">
                        <div style={{ width: '100%' }}>
                            {open && <ComputeClassification
                                traces={traces}
                                onChangeStyle={onChangeStyle}
                                chartType={chartType}
                            />}
                        </div>
                    </FormGroup>
                    <div className="ms-wizard-chart-custom-classification-footer">
                        <Button
                            disabled={!msClassification?.classes}
                            onClick={() => onChangeStyle('msClassification.classes', undefined)}
                        >
                            <Message msgId="widgets.builder.wizard.classAttributes.removeCustomColors" />
                        </Button>
                    </div>
                </div>
            }
        >
            <Button
                disabled={disabled}
                bsStyle={msClassification?.classes ? 'success' : 'primary'}
                tooltipId="widgets.builder.wizard.classAttributes.editCustomColors"
            >
                {/* using a default button to access the node ref */}
                <span className="glyphicon glyphicon-pencil" ref={node}/>
            </Button>
        </ControlledPopover>
    );
};

const isCustomClassificationAvailable = (trace) => {
    const groupByAttributesKey =  trace?.options?.groupByAttributes;
    const aggregationAttributeDataKey = getAggregationAttributeDataKey(trace?.options);
    const classificationDataKey = trace?.options?.classificationAttribute
        || groupByAttributesKey;
    return groupByAttributesKey && groupByAttributesKey && aggregationAttributeDataKey
        && classificationDataKey;
};
/**
 * ChartClassification. A component that renders fields to change the trace style classification
 * @prop {object} data trace data
 * @prop {function} onChange callback on every input change
 * @prop {function} onChangeStyle callback on every style input change
 * @prop {array} options list of available attributes
 * @prop {array} traces list of traces supported by the chart
 * @prop {array} sortByOptions list of available sort by options
 */
const ChartClassification = ({
    data = {},
    onChangeStyle,
    onChange,
    options = [],
    traces,
    sortByOptions = [
        { value: 'groupBy', label: <Message msgId={`widgets.groupByAttributes.${data.type || "default"}`} /> },
        { value: 'aggregation', label: <Message msgId={`widgets.aggregationAttribute.${data.type || "default"}`} /> }
    ]
}) => {
    const {
        msClassification
    } = data.style || {};
    const classes = msClassification?.classes;
    const classesAvailable = !!classes;
    const classificationAttribute = data?.options?.classificationAttribute || data?.options?.groupByAttributes;
    const selectedAttribute = options.find((option) => option.value === classificationAttribute);
    const { filter, ...trace } = data; // remove filter to compute complete classification
    const disableClassificationAttribute = traces && traces.length > 1;
    return (
        <>
            {!disableClassificationAttribute && <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.builder.wizard.classAttributes.classificationAttribute" />
                </ControlLabel>
                <InputGroup>
                    <Select
                        disabled={classesAvailable}
                        value={classificationAttribute}
                        options={options}
                        clearable={false}
                        onChange={(option) => {
                            onChangeStyle('msClassification', {
                                intervals: 5,
                                ramp: 'viridis',
                                reverse: false,
                                ...msClassification,
                                method: option?.type === 'string'
                                    ? 'uniqueInterval'
                                    : selectedAttribute.type === 'string'
                                        ? 'jenks'
                                        : msClassification?.method || 'jenks'
                            });
                            onChange('options.classificationAttribute', option?.value);
                        }}
                    />
                </InputGroup>
            </FormGroup>}
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.method'} /></ControlLabel>
                <InputGroup>
                    <Select
                        disabled={classesAvailable || selectedAttribute?.type === 'string'}
                        value={msClassification?.method || 'uniqueInterval'}
                        clearable={false}
                        options={availableMethods.map((value) => ({
                            value,
                            label: <Message msgId={`styleeditor.${value}`} />
                        }))}
                        onChange={(option) => onChangeStyle('msClassification.method', option?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="widgets.advanced.sortBy" /></ControlLabel>
                <InputGroup>
                    <Select
                        disabled={classesAvailable}
                        value={data?.sortBy || (data.type === 'pie' ? 'aggregation' : 'groupBy')}
                        clearable={false}
                        options={sortByOptions}
                        onChange={(option) => onChange('sortBy', option?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.colorRamp'} /></ControlLabel>
                <InputGroup>
                    <ColorRamp
                        disabled={classesAvailable}
                        items={classesAvailable ? [{
                            name: 'custom',
                            label: 'global.colors.custom',
                            colors: classes.map(({ color }) => color)
                        }] : rampOptions}
                        rampFunction={({ colors }) => colors}
                        samples={RAMP_PREVIEW_CLASSES}
                        value={{ name: classesAvailable ? 'custom' : msClassification?.ramp }}
                        onChange={ramp => onChangeStyle('msClassification.ramp', ramp.name)}
                    />
                    <InputGroup.Button>
                        <CustomClassification
                            traces={[trace]}
                            placement="right"
                            onChangeStyle={onChangeStyle}
                            onChange={onChange}
                            disabled={!isCustomClassificationAvailable(data)}
                        />
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.intervals'} /></ControlLabel>
                <InputGroup style={{ maxWidth: 80 }}>
                    <DebouncedFormControl
                        type="number"
                        disabled={msClassification?.method === 'uniqueInterval' || classesAvailable}
                        value={msClassification?.intervals}
                        min={2}
                        max={25}
                        fallbackValue={5}
                        style={{ zIndex: 0 }}
                        onChange={eventValue => onChangeStyle('msClassification.intervals', eventValue)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <Checkbox
                    disabled={classesAvailable}
                    checked={!!msClassification?.reverse}
                    onChange={(event) => { onChangeStyle('msClassification.reverse', event?.target?.checked); }}
                >
                    <Message msgId="widgets.advanced.reverseRampColor" />
                </Checkbox>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.outlineColor'} /></ControlLabel>
                <InputGroup>
                    <ColorSelector
                        format="rgb"
                        color={data?.style?.marker?.line?.color}
                        line
                        onChangeColor={(color) => color && onChangeStyle('marker.line.color', color)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId={'styleeditor.outlineWidth'} /></ControlLabel>
                <InputGroup style={{ maxWidth: 80 }}>
                    <DebouncedFormControl
                        type="number"
                        value={data?.style?.marker?.line?.width}
                        min={0}
                        fallbackValue={0}
                        style={{ zIndex: 0 }}
                        onChange={eventValue => onChangeStyle('marker.line.width', eventValue)}
                    />
                </InputGroup>
            </FormGroup>
        </>
    );
};

export default ChartClassification;
