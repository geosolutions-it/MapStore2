/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { formatDate } from '../constants';

/**
 * Display a dataset's title, interval and last visible refresh time.
 * @function AutoRefreshLayerRow
 * @param {object} props Component props.
 * @param {object} props.layer Dataset entry with id, title, visibility, autoRefreshInterval and optional _v_.
 * Interval and timestamp values are in milliseconds.
 * @returns {React.ReactElement} Dataset summary row.
 */
const AutoRefreshLayerRow = ({layer}) => {
    /**
     * Build the row tooltip using seconds and the localized last-refresh time.
     * @function getFullyQualifiedLayerTitle
 * @returns {string} Dataset title, interval and visible refresh timestamp.
     */
    const getFullyQualifiedLayerTitle = React.useCallback(() => {
        const title = layer.title;
        const interval = `(${layer.autoRefreshInterval / 1000}s)`;
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
        <span className="ms-autorefresh-layer-summary__row__interval badge badge-info">{layer.autoRefreshInterval / 1000}s</span>
    </div>);
};

export default AutoRefreshLayerRow;
