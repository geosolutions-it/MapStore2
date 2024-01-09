/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from "react";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import castArray from "lodash/castArray";
import ReactSelect from "react-select";
import {
    ControlLabel,
    FormControl as FormControlRB,
    FormGroup,
    InputGroup
} from "react-bootstrap";

import PropertyField from "../../components/styleeditor/PropertyField";
import withDebounceOnCallback from "../../components/misc/enhancers/withDebounceOnCallback";
import localizedProps from "../../components/misc/enhancers/localizedProps";
import SwitchButton from "../../components/misc/switch/SwitchButton";
import Message from "../../components/I18N/Message";

const Select = localizedProps(["placeholder"])(ReactSelect);
const FormControl = withDebounceOnCallback(
    "onChange",
    "value"
)(
    localizedProps("placeholder")(({ debounceTime, ...props }) => (
        <FormControlRB
            {...props}
            onChange={(event) => props.onChange(event.target.value)}
        />
    ))
);

const getBandOptions = (bands = []) =>
    bands.map((band) => ({ value: band, label: `Band ${band}` }));
const defaultRGBAColorExpression = ["array", ["band", 1], ["band", 2], ["band", 3], ["band", 4]];
const defaultSingleColorExpression = ["array", ["band", 1], ["band", 1], ["band", 1], 1];

/**
 * Multi-Band Editor component
 * The DataTileSource supports multi-bands and the Geotiff source can provide multi-band data,
 * however the editor currently supports only RGB bands along with an optional alpha band and a single/gray band
 */
const MultiBandEditor = ({
    element: layer,
    bands,
    rbgBandLabels,
    onUpdateNode
}) => {
    const [enableBand, setEnableBand] = useState(true);
    const isRGB = get(layer, "sourceMetadata.isRGB", false);

    const updateStyle = (color) => {
        onUpdateNode(layer.id, "layers", {
            style: { color: !isEmpty(color) ? JSON.stringify(color) : color}
        });
    };

    useEffect(() => {
        !isRGB && updateStyle(defaultSingleColorExpression);
    }, [isRGB]);

    const onEnableBandStyle = (flag) => {
        setEnableBand(flag);
        let color;
        if (flag) {
            color = isRGB ? defaultRGBAColorExpression : defaultSingleColorExpression;
        }
        updateStyle(color);
    };

    const getParsedColor = () => {
        const color = get(layer, "style.color");
        return !isEmpty(color) && typeof color === "string"
            ? JSON.parse(color)
            : color;
    };

    const onChangeBand = (index, value) => {
        let color = getParsedColor() ?? [...defaultRGBAColorExpression];
        color[index] = value ? ["band", value] : 1;
        updateStyle(color);
    };

    const onChangeMinMax = (type, value) => {
        const source = get(layer, "sources[0]");
        onUpdateNode(layer.id, "layers", {
            sources: [{ ...source, [type]: value }]
        });
    };

    const getColors = () => {
        const colors = getParsedColor();
        if (isEmpty(colors)) {
            return [...bands];
        }
        return colors
            .filter((_, i) => i !== 0) // skip first index expression notation 'array'
            .map((c) => castArray(c)?.[1] ?? ""); // band expression is `['band', ${value}]`
    };

    const bandColors = getColors();
    const minSourceValue = get(layer, "sources[0].min");
    const maxSourceValue = get(layer, "sources[0].max");

    return (
        <div className="ms-style-band-container">
            <div className="ms-style-band-editor">
                <div className="ms-style-band">
                    <div className="enable-band">
                        <ControlLabel><Message msgId="styleeditor.enableBanding"/></ControlLabel>
                        <SwitchButton
                            onChange={() => onEnableBandStyle(!enableBand)}
                            checked={enableBand}
                        />
                    </div>
                    {isRGB ? (
                        bands.map((_, index) => {
                            const isAlpha = index === bands.length - 1;
                            return (
                                <PropertyField label={rbgBandLabels[index]}>
                                    <Select
                                        clearable={isAlpha}
                                        disabled={!enableBand}
                                        placeholder={'styleeditor.selectChannel'}
                                        options={getBandOptions(bands)}
                                        value={bandColors[index]}
                                        onChange={(option) => {
                                            onChangeBand(index + 1, option?.value);
                                        }}
                                    />
                                </PropertyField>
                            );
                        })
                    ) : (
                        <PropertyField label={`styleeditor.grayChannel`}>
                            <Select
                                clearable={false}
                                disabled={!enableBand}
                                options={[getBandOptions(bands)[0]]}
                                value={bandColors[0]}
                            />
                        </PropertyField>
                    )}
                    <PropertyField
                        label={"styleeditor.minLabel"}
                        infoMessageId={"styleeditor.minSourceValue"}
                    >
                        <FormGroup>
                            <InputGroup>
                                <FormControl
                                    type={"number"}
                                    value={minSourceValue}
                                    onChange={(value) => onChangeMinMax("min", value)}
                                />
                            </InputGroup>
                        </FormGroup>
                    </PropertyField>
                    <PropertyField
                        label={"styleeditor.maxLabel"}
                        infoMessageId={"styleeditor.maxSourceValue"}
                    >
                        <FormGroup>
                            <InputGroup>
                                <FormControl
                                    type={"number"}
                                    value={maxSourceValue}
                                    onChange={(value) => onChangeMinMax("max", value)}
                                />
                            </InputGroup>
                        </FormGroup>
                    </PropertyField>
                </div>
            </div>
        </div>
    );
};

MultiBandEditor.defaultProps = {
    bands: [1, 2, 3, 4],
    rbgBandLabels: [
        "styleeditor.redChannel",
        "styleeditor.greenChannel",
        "styleeditor.blueChannel",
        "styleeditor.alphaChannel"
    ],
    onUpdateNode: () => {}
};

export default MultiBandEditor;
