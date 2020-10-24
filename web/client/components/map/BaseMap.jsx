/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Map from "./Map";

/**
 * Base map component that renders a map.
 * It is implementation independent.
 * The implementation of the layer is provided by the `plugins` property
 * @prop {string} id the id of the map div
 * @prop {object} options. Options to pass to the map component (generically constant)
 * @prop {object} map the map properties (projection...) This is generically the dynamic part of the map options.
 * @prop {object[]} layers the layers to add to the map
 * @prop {object} plugins specific implementation of the components to render.
 * Must contain implementations for:
 *  - Map React component for Map
 *  - Layer React component for Layer
 *  - Feature (optional) React component for vector Feature
 *  - tools (optional) any support tool you want to use
 * @prop {array} tools. A list of tools (string name or object with `name` and other options as attribute) to add to the map.
 * @prop {object} eventHandlers handlers for map events
 * Each tool must be implemented in plugins.tools
 *
 */
const BaseMap = (props) => {
    const {plugins, ...others} = props;
    return (<Map id ="__base_map__" eventHandlers ={{
        onMapViewChanges: () => {},
        onClick: () => {},
        onMouseMove: () => {},
        onLayerLoading: () => {},
        onLayerError: () => {}
    }} components={plugins} tools={[]} {...others}/>);
};

export default BaseMap;
