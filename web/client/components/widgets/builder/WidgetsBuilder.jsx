 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');

const ChartWizard = require('./ChartWizard');
module.exports = ({
        settings = {step: 0},
        insertWidget = () => {},
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
            types={types}
            featureTypeProperties={featureTypeProperties}
            step={settings.step}
            layer={layer}
            data={editorData}
            onFinish={insertWidget}
            setPage={setPage}
            onChange={onEditorChange}/>);
