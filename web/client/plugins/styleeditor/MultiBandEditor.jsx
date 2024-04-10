/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import castArray from "lodash/castArray";
import cloneDeep from "lodash/cloneDeep";
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
const defaultSingleColorExpression = ["array", ["band", 1], ["band", 1], ["band", 1], ["band", 2]];

/**
 * Multi-Band Editor component
 * The DataTileSource supports multi-bands and the Geotiff source can provide multi-band data,
 * however the editor currently supports only RGB bands (3 samples) along with an optional alpha band and a single/gray band (1 sample)
 */
const MultiBandEditor = ({
    element: layer,
    bands: defaultBands,
    rbgBandLabels,
    onUpdateNode
}) => {
    const isBandStylingEnabled = !isEmpty(get(layer, "style.body.color"));
    /**
     * Samples per pixel are a combination of image samples + extra samples (alpha) [nodata presence adds the alpha channel]
     * Each pixel can have N extra samples, however currently only +1 extra sample included
     * i.e Multi extra samples are not supported
     * Sample >=3 is generally considered 'RGB' as the GeoTIFF source is set with convertToRGB:'auto'
     */
    const samples = get(layer, "sourceMetadata.samples");

    /**
     * There are instances where the sample is 3 or above with PhotometricInterpretation as 0 or 1 [gray scale indicator],
     * this could be because the band channels are not properly defined.
     * Hence we consider if the sample is >=3 or PhotometricInterpretation is not a gray scale image,
     * to determine the RGB image
     */
    const isRGB = samples >= 3
    || ![0, 1].includes(get(layer, "sourceMetadata.fileDirectory.PhotometricInterpretation"));

    const bands = samples === 3 ? defaultBands.slice(0, -1) : defaultBands;

    const updateStyle = (color) => {
        onUpdateNode(layer.id, "layers", {
            style: { body: { color }, format: "openlayers"}
        });
    };

    const onEnableBandStyle = (flag) => {
        let color;
        if (flag) {
            color = [...(isRGB ? defaultRGBAColorExpression : defaultSingleColorExpression)];
        }
        updateStyle(color);
    };

    const onChangeBand = (index, value) => {
        let color = cloneDeep(get(layer, "style.body.color") ?? defaultRGBAColorExpression);
        color[index] = value ? ["band", value] : 1;
        updateStyle(color);
    };

    const onChangeMinMax = (type, value) => {
        const source = get(layer, "sources[0]");
        onUpdateNode(layer.id, "layers", {
            sources: [{ ...source, [type]: isEmpty(value) ? undefined : value }]
        });
    };

    const getColors = () => {
        const colors = get(layer, "style.body.color");
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
                            onChange={() => onEnableBandStyle(!isBandStylingEnabled)}
                            checked={isBandStylingEnabled}
                        />
                    </div>
                    {isRGB ? (
                        bands.map((_, index) => {
                            const bandLength = bands.length;
                            // 4th band is alpha channel
                            const isAlpha =  bandLength === 4 && index === bandLength - 1;
                            return (
                                <PropertyField label={rbgBandLabels[index]}>
                                    <Select
                                        clearable={isAlpha}
                                        disabled={!isBandStylingEnabled}
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
                                disabled={!isBandStylingEnabled}
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
