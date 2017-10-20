 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const Message = require('../../I18N/Message');
const emptyState = require('../../misc/enhancers/emptyState');
const loadingState = require('../../misc/enhancers/loadingState')();
const SimpleChart = loadingState(emptyState(
    ({data = []}) => !data || data.length === 0,
    ({mapSync} = {}) => ({
        tooltip: mapSync ? <Message msgId="widgets.errors.nodatainviewport" /> : <Message msgId="widgets.errors.nodata" />
    })
)((require('../../charts/SimpleChart'))));
const ContainerDimensions = require('react-container-dimensions').default;
const React = require('react');
module.exports = (props) => (<div className="mapstore-widget-chart">
    <ContainerDimensions>
          <SimpleChart {...props}/>
    </ContainerDimensions>
</div>);
