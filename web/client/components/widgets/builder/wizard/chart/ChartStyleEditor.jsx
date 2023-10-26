/*
  * Copyright 2023, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import ColorSelector from '../../../../style/ColorSelector';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
import { FormGroup, ControlLabel, InputGroup, Checkbox } from 'react-bootstrap';
import Select from "react-select";
import Message from "../../../../I18N/Message";
import ChartClassification from './ChartClassification';
import set from 'lodash/fp/set';

const chartStyleEditors = {
    line: ({ data, onChangeStyle }) => {
        const mode = data?.style?.mode || 'lines';
        return (
            <>
                <FormGroup className="form-group-flex">
                    <ControlLabel><Message msgId="widgets.advanced.mode" /></ControlLabel>
                    <InputGroup>
                        <Select
                            value={mode}
                            clearable={false}
                            options={[
                                { value: 'lines+markers', label: 'Line with markers' },
                                { value: 'lines', label: 'Line' },
                                { value: 'markers', label: 'Scatter' }
                            ]}
                            onChange={(option) => onChangeStyle('mode', option?.value)}
                        />
                    </InputGroup>
                </FormGroup>
                {mode !== 'markers' && <>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId="widgets.advanced.lineColor" /></ControlLabel>
                        <InputGroup>
                            <ColorSelector
                                format="rgb"
                                color={data?.style?.line?.color}
                                line
                                onChangeColor={(color) => color && onChangeStyle('line.color', color)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId="widgets.advanced.lineWidth" /></ControlLabel>
                        <InputGroup style={{ maxWidth: 80 }}>
                            <DebouncedFormControl
                                type="number"
                                value={data?.style?.line?.width}
                                min={1}
                                fallbackValue={2}
                                style={{ zIndex: 0 }}
                                onChange={eventValue => onChangeStyle('line.width', eventValue)}
                            />
                        </InputGroup>
                    </FormGroup>
                </>}
                {mode !== 'lines' && <>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId="widgets.advanced.markerColor" /></ControlLabel>
                        <InputGroup>
                            <ColorSelector
                                format="rgb"
                                color={data?.style?.marker?.color}
                                onChangeColor={(color) => color && onChangeStyle('marker.color', color)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId="widgets.advanced.markerSize" /></ControlLabel>
                        <InputGroup style={{ maxWidth: 80 }}>
                            <DebouncedFormControl
                                type="number"
                                value={data?.style?.marker?.size}
                                min={1}
                                fallbackValue={6}
                                style={{ zIndex: 0 }}
                                onChange={eventValue => onChangeStyle('marker.size', eventValue)}
                            />
                        </InputGroup>
                    </FormGroup>
                </>}
            </>
        );
    },
    bar: ({ data, onChange, onChangeStyle, options }) => {
        const msMode = data?.style?.msMode || 'simple';
        return (
            <>
                <FormGroup className="form-group-flex">
                    <ControlLabel><Message msgId="widgets.advanced.mode" /></ControlLabel>
                    <InputGroup>
                        <Select
                            value={msMode}
                            clearable={false}
                            options={[
                                { value: 'simple', label: <Message msgId={'styleeditor.simpleStyle'} /> },
                                { value: 'classification', label: <Message msgId={'styleeditor.classificationStyle'} /> }
                            ]}
                            onChange={(option) => onChangeStyle('msMode', option?.value)}
                        />
                    </InputGroup>
                </FormGroup>
                {msMode === 'simple' && <>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId={'styleeditor.fill'} /></ControlLabel>
                        <InputGroup>
                            <ColorSelector
                                format="rgb"
                                color={data?.style?.marker?.color}
                                onChangeColor={(color) => color && onChangeStyle('marker.color', color)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="form-group-flex">
                        <ControlLabel><Message msgId={'styleeditor.outlineColor'} /></ControlLabel>
                        <InputGroup>
                            <ColorSelector
                                format="rgb"
                                color={data?.style?.line?.color}
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
                                value={data?.style?.line?.width}
                                min={0}
                                fallbackValue={0}
                                style={{ zIndex: 0 }}
                                onChange={eventValue => onChangeStyle('marker.line.width', eventValue)}
                            />
                        </InputGroup>
                    </FormGroup>
                </>}
                {msMode === 'classification' && <ChartClassification data={data} options={options} onChange={onChange} onChangeStyle={onChangeStyle}/> }
            </>
        );
    },
    pie: ({ data, onChange, onChangeStyle, options, traces }) => {
        return (
            <>
                <ChartClassification traces={traces} data={data} options={options} onChange={onChange} onChangeStyle={onChangeStyle}/>
                <FormGroup className="form-group-flex">
                    <Checkbox
                        checked={data?.textinfo === "none"}
                        onChange={(event) => onChange('textinfo', event?.target?.checked ? "none" : null)}
                    >
                        <Message msgId="widgets.advanced.hideLabels" />
                    </Checkbox>
                </FormGroup>
            </>
        );
    }
};
/**
 * ChartStyleEditor. A component that renders field to style a chart traces
 * @prop {object} data trace data
 * @prop {array} options list of available attributes
 * @prop {function} onChange callback on every input change
 * @prop {array} traces list of traces
 */
function ChartStyleEditor(props) {
    const Component = chartStyleEditors[props?.data?.type];
    if (!Component) {
        return null;
    }
    return (
        <>
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.traceStyle" /></div>
            <Component
                {...props}
                onChangeStyle={(path, value) => {
                    props.onChange('style',
                        set(path, value, props.data?.style || {})
                    );
                }}
            />
        </>
    );
}

export default ChartStyleEditor;
