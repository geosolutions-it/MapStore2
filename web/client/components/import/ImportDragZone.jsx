/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const DragZone = require('./dragZone/DragZone.jsx');
const Content = require('./dragZone/Content');
const processFiles = require('./dragZone/enhancers/processFiles');

module.exports = processFiles(
    ({
    onClose = () => {},
    onDrop = () => {},
    ...props
}) => <DragZone
    onClose={onClose}
    onDrop={onDrop}
    >
    <Content {...props} />
</DragZone>);
