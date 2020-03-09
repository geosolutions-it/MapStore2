/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const CoordinatesRow = require('../../../misc/coordinateeditors/CoordinatesRow');

const Editor = (props) => (
    <CoordinatesRow
        format={props.formatCoord || "decimal"}
        aeronauticalOptions={{
            seconds: {
                decimals: 4,
                step: 0.0001
            }
        }}
        idx={1}
        onChange={(id, key, value) => {
            props.onChange(key, value === null || value === "" ? undefined : value);
        }}
        onChangeFormat={(format) => {
            props.onChangeFormat(format);
        }}
        key="GFI row coord editor"
        component={props.coordinate || {}}
        customClassName="coord-editor"
        isDraggable={false}
        showDraggable={false}
        formatVisible
        showLabels
        removeVisible={false}
    />);

module.exports = Editor;
