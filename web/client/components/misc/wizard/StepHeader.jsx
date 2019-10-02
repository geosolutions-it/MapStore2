/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const {Row, Col} = require('react-bootstrap');
module.exports = ({title, description}) => (<Row><Col xs={12} className="text-center">
    <div className="mapstore-step-title">{title}</div>
    <div className="mapstore-step-description">{description}</div>
</Col>
</Row>);
