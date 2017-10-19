 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const SimpleChart = require('../../charts/SimpleChart');
const ContainerDimensions = require('react-container-dimensions').default;
const React = require('react');
module.exports = (props) => (<div className="mapstore-widget-chart">
    <ContainerDimensions>
          <SimpleChart {...props}/>
    </ContainerDimensions>
</div>);
