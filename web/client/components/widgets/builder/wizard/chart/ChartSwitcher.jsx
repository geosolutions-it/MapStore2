/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from 'react';
import ReactSelect from "react-select";
import {FormControl as FC, Glyphicon} from "react-bootstrap";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import tooltip from "../../../../misc/enhancers/tooltip";

import localizedProps from "../../../../misc/enhancers/localizedProps";
import Message from "../../../../I18N/Message";
import ButtonRB from "../../../../misc/Button";
const Select = localizedProps(["noResultsText"])(ReactSelect);
const FormControl = localizedProps("placeholder")(FC);
const Button = tooltip(ButtonRB);


/**
 * Chart switcher component
 */
export default ({
    charts = [],
    onChange = () => {},
    value = '',
    disabled = false,
    className = '',
    editorData = {},
    setSelectedChart = () => {},
    selectedChart,
    withContainer = false,
    featureTypeProperties,
    width,
    ...props
}) => {
    const [showInput, setShowInput] = useState(false);
    const [inputVal, setInputVal] = useState(selectedChart?.name);
    const renderChartSwitchSelector = (options) => {
        if (options.length === 1) {
            return null;
        }
        if (!withContainer && width <= 410) {
            // Show info icon when widget width cannot contain Map Switcher
            return (<Button
                tooltipId="widgets.chartSwitcher.infoOnHide"
                className="square-button-md no-border"
                key="info-sign">
                <Glyphicon glyph="info-sign" />
            </Button>);
        }
        const formValue = inputVal ?? options?.find(o => o.chartId === value)?.name;
        return (
            <div className={"chart-fields"}>
                {showInput
                    ? <FormControl
                        type="text"
                        placeholder={"widgets.chartSwitcher.placeholder"}
                        style={{
                            textOverflow: "ellipsis"
                        }}
                        value={formValue}
                        onChange={(e) => setInputVal(e.target.value)}/>
                    : <Select
                        className={className}
                        disabled={disabled}
                        noResultsText="widgets.chartSwitcher.noResults"
                        options={isEmpty(options)
                            ? []
                            : options.map(m => ({
                                label: m?.name || (m?.layer?.title),
                                value: m.chartId
                            }))
                        }
                        onChange={(chart) => {
                            if (chart.value) {
                                onChange("selectedChartId", chart.value);
                                setInputVal(null);
                            }
                        }}
                        value={value || options?.[0]?.chartId}
                        clearable={false}
                    />}
                {withContainer && <Button
                    bsStyle="primary"
                    disabled={showInput && isEmpty(formValue)}
                    onClick={() => {
                        if (!showInput) {
                            setShowInput(true);
                        } else {
                            inputVal && onChange(`charts[${selectedChart?.chartId}].name`, inputVal);
                            setShowInput(false);
                        }
                    }}>
                    <Glyphicon glyph={showInput ? "ok" : "pencil"}/>
                </Button>}
            </div>
        );
    };

    if (!withContainer) {
        return renderChartSwitchSelector(charts);
    }

    useEffect(() => {
        if (!isEmpty(editorData?.charts) && withContainer) {
            let selected = get(editorData, 'charts[0]', {});
            if (!isEmpty(editorData.selectedChartId)) {
                selected = editorData.charts?.find(m => m.chartId === editorData.selectedChartId);
            } else {
                onChange("selectedChartId", selected.chartId);
            }
            setSelectedChart({...selectedChart, ...selected});
        }
    }, [
        editorData.charts,
        editorData.selectedChartId,
        withContainer,
        setSelectedChart,
        onChange
    ]);
    return (<>
        { editorData?.charts?.length > 1
            ? <div className="chart-switcher">
                <strong>
                    <Message msgId={"widgets.chartSwitcher.selectLabel"}/>
                </strong>
                {renderChartSwitchSelector(editorData.charts)}
            </div> : null
        }
        {
            withContainer && props.children
                ? React.Children.map(props.children, (child, i) =>
                    React.cloneElement(child, {key: `chart-component-${i}`, ...props}))
                : null
        }
    </>);
};
