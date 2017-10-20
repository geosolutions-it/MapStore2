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
        settings = {},
        insertWidget = () => {},
        onEditorChange = () => {},
        setPage = () => {},
        layer,
        editorData = {}}
    ) =>
        (<ChartWizard
            step={settings.step}
            layer={layer}
            data={editorData}
            onFinish={insertWidget}
            setPage={setPage}
            onChange={onEditorChange}/>);
