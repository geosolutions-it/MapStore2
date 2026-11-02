/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { formatDate } from '../constants';

const AutoRefreshLayerRow = ({layer}) => {
    const getFullyQualifiedLayerTitle = React.useCallback(() => {
        const title = layer.title;
        const interval = `(${layer.autoRefreshInterval}s)`;
        const lastUpdate = layer.visibility && layer._v_ ? formatDate(layer._v_) : '';
        return `${title} ${interval} ${lastUpdate}`;
    }, [layer]);

    return (<div className={'ms-autorefresh-layer-summary__row ' + (layer.visibility ? '' : 'ms-autorefresh-layer-summary__row-hidden ') + (layer.visibility && layer._v_ ? '' : 'ms-autorefresh-layer-summary__row-inactive')}
        key={`autorefresh-layer-summary-${layer.id}`}
        title={getFullyQualifiedLayerTitle()}>
        <div className="ms-autorefresh-layer-summary__row__title">
            <span className="glyphicon glyphicon-1-layer"/>
            <span >{layer.title}</span>
        </div>
        {layer.visibility && layer._v_ && <div className="ms-autorefresh-layer-summary__row__refreshed">
            <span className="glyphicon glyphicon-refresh"/>
            <span>{formatDate(layer._v_)}</span>
        </div>}
        <span className="ms-autorefresh-layer-summary__row__interval badge badge-info">{layer.autoRefreshInterval}s</span>
    </div>);
};

export default AutoRefreshLayerRow;
