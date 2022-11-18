/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect, useState} from 'react';
import ReactSelect from "react-select";
import { FormControl as FC, Glyphicon } from "react-bootstrap";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import tooltip from "../../../../misc/enhancers/tooltip";

import localizedProps from "../../../../misc/enhancers/localizedProps";
import Message from "../../../../I18N/Message";
import ButtonRB from "../../../../misc/Button";
import { EMPTY_MAP } from "../../../../../utils/MapUtils";
const FormControl = localizedProps("placeholder")(FC);
const Select = localizedProps(["noResultsText"])(ReactSelect);
const Button = tooltip(ButtonRB);

/**
 * Map switcher component
 */
export default ({
    maps = [],
    onChange = () => {},
    value = '',
    disabled = false,
    className = '',
    editorData = {},
    setSelectedMap = () => {},
    setEmptyMap = () => {},
    emptyMap = false,
    withContainer = false,
    selectedMap = {}
}) => {
    const renderMapSwitchSelector = (options) => {
        if (options.length === 1) {
            return null;
        }
        const { size } = options?.find(o => o?.mapId === value) || {};
        if (!withContainer && size?.width <= 400) {
            // Show info icon when widget width cannot contain Map Switcher
            return (<Button
                tooltipId="widgets.mapSwitcher.infoOnHide"
                className="square-button-md no-border"
                key="info-sign">
                <Glyphicon glyph="info-sign" />
            </Button>);
        }
        return (<Select
            className={className}
            disabled={disabled}
            noResultsText="widgets.mapSwitcher.noResults"
            options={isEmpty(options)
                ? []
                : options.map(m => ({
                    label: m.name,
                    value: m.mapId
                }))
            }
            onChange={(val) => val.value && onChange("selectedMapId", val.value)}
            value={value || options?.[0]?.mapId}
            clearable={false}
        />);
    };

    if (!withContainer) {
        return renderMapSwitchSelector(maps);
    }

    const [emptyMapName, setEmptyMapName] = useState('');
    useEffect(() => {
        if (!isEmpty(editorData?.maps) && withContainer) {
            const emptyMapData =  editorData?.maps?.find(map => map.name === EMPTY_MAP);
            let selected;
            if (!isEmpty(emptyMapData)) {
                setEmptyMap(true);
                selected = emptyMapData;
            } else {
                setEmptyMap(false);
                selected = get(editorData, 'maps[0]', {});
                if (!isEmpty(editorData.selectedMapId)) {
                    selected = editorData.maps?.find(m => m.mapId === editorData.selectedMapId);
                } else {
                    onChange("selectedMapId", selected.mapId);
                }
            }
            setSelectedMap(selected);
        }
    }, [
        editorData.maps,
        editorData.selectedMapId,
        withContainer,
        setSelectedMap,
        onChange,
        setEmptyMap
    ]);

    return (emptyMap || editorData.maps?.length > 1)
        ? <div className="widget-selector">
            {emptyMap ? <div style={{display: 'inline-flex'}}>
                <FormControl
                    className={"widget-empty-map"}
                    type="text"
                    placeholder={"widgets.mapSwitcher.placeholder"}
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    value={emptyMapName}
                    onChange={(e) => setEmptyMapName(e.target.value)}/>
                <Button
                    bsStyle="primary"
                    disabled={!emptyMapName}
                    onClick={() => {
                        onChange(`maps[${selectedMap.mapId}].name`, emptyMapName);
                        onChange("selectedMapId", selectedMap.mapId);
                    }}
                >
                    <Glyphicon glyph="ok"/>
                </Button>
            </div>
                : (<>
                    <div className="widget-selector-label">
                        <strong>
                            <Message msgId={"widgets.mapSwitcher.selectLabel"}/>
                        </strong>
                    </div>
                    {renderMapSwitchSelector(editorData.maps)}
                </>)}
        </div> : null;
};
