/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const ChartWizard = require('./wizard/ChartWizard');
module.exports = ({
    step = 0,
    valid,
    onFinish = () => {},
    setValid = () => {},
    onEditorChange = () => {},
    setPage = () => {},
    layer,
    types,
    featureTypeProperties,
    dependencies,
    editorData = {}}
) =>
    (<ChartWizard
        dependencies={dependencies}
        valid={valid}
        types={types}
        featureTypeProperties={featureTypeProperties}
        step={step}
        layer={layer}
        data={editorData}
        setValid={setValid}
        onFinish={onFinish}
        setPage={setPage}
        onChange={onEditorChange}/>);
