/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, withProps } from 'recompose';
import Text from '../../contents/Text';

import Manager from '../../../style/vector/Manager';
import config from '../../../mapcontrols/annotations/AnnotationsConfig';

import {DropdownList} from 'react-widgets';

const styleSelectComponent = (props) => {
    const { options, value, onChange } = props;
    return (
        <DropdownList
            key="format-dropdown"
            value={value}
            data={options.map(opt => opt.value)}
            onChange={onChange} />
    );
};

const withDefaultTabs = withProps((props) => ({
    tabs: props.tabs || [{
        id: 'popup-editor',
        titleId: 'popup-editor',
        tooltipId: 'popup-editor',
        title: 'Popup',
        visible: true,
        Component: () => {
            const update = (pathToHtml, html) => {
                const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${props.currentMapLocation}"}].properties.${pathToHtml}`;
                props.update(path, html);
            };
            return (<div className="ms-locations-popup-editor"><Text {...props} update={update} allowBlur={false} keepOpen mode="edit" /></div>);
        }
    },
    {
        id: 'popup-style-editor',
        titleId: 'popup-style-editor',
        tooltipId: 'popup-style-editor',
        title: 'Style',
        visible: true,
        Component: () => {
            const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${props.currentMapLocation}"}].style`;

            const symbolList = [
                {
                    label: "Triangle",
                    symbolUrl: "product/assets/symbols/triangle.svg?_t=0.5599318810949812",
                    value: "triangle"
                },
                {
                    label: "Map Pin Marked",
                    symbolUrl: "product/assets/symbols/map-pin-marked.svg?_t=0.7977083047551663",
                    value: "map-pin-marked"
                }
            ];

            const defaultStyles = {
                POINT: {
                    marker: {
                        iconColor: "blue",
                        iconGlyph: "comment",
                        iconShape: "square"
                    },
                    symbol: {
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                        color: "#000000",
                        fillColor: "#000000",
                        fillOpacity: 1,
                        iconAnchor: [0.5, 0.5],
                        opacity: 1,
                        shape: "triangle",
                        size: 64,
                        symbolUrl: "product/assets/symbols/triangle.svg",
                        symbolUrlCustomized: "blob:http://localhost:8081/3deee860-ae2f-473d-9da5-1e5756c53556"
                    }
                }
            };
            return (
                <div className="ms-locations-popup-editor">
                    <Manager
                        selectComponent={styleSelectComponent}
                        markersOptions={{...config}}
                        symbolList={symbolList}
                        defaultStyles={defaultStyles}
                        onChangeStyle={(newStyles) => props.update(path, newStyles)}
                        style={props.currentLocationData.style} />
                </div>
            );
        }
    }]
}));

export const withLocationPopupTabs = compose(
    withDefaultTabs
);

export default withLocationPopupTabs;

