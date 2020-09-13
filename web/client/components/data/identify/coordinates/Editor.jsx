/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const CoordinatesRow = require('../../../misc/coordinateeditors/CoordinatesRow');
const {isEmpty} = require('lodash');

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
        onSubmit={(id, value) => {
            props.onSubmit(isEmpty(value) ? undefined : value);
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
