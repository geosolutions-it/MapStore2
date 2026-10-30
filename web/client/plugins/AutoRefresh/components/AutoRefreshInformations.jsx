/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react';
import { Glyphicon, Dropdown, MenuItem } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import { formatDate } from '../constants';

const Button = tooltip(ButtonRB);

const AutoRefreshInformationsMenu = React.forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            className="dropdown-menu"
            style={{
                left: 'auto',
                right: 0,
                padding: '10px',
                minWidth: '300px',
                overflowY: "hidden",
                zIndex: 9999
            }}>
            <Message msgId={props.msgId} />
            <MenuItem divider />
            {props.children}
        </div>
    );
});


const AutoRefreshInformations = ({
    layers = []
}) => {
    const getFullyQualifiedLayerTitle = useCallback((layer) => {
        const title = layer.title;
        const interval = `(${layer.autoRefreshInterval}s)`;
        const lastUpdate = layer.visibility && layer._v_ ? formatDate(layer._v_) : '';
        return `${title} ${interval} ${lastUpdate}`;
    }, [layers]);

    return (<div className="ms-autorefresh-informations">
        <Dropdown dropup>
            <Button
                bsRole="toggle"
                bsStyle="link"
                className="ms-autorefresh-button"
                tooltip={<Message msgId="autorefresh.label.informations"/>}
                tooltipPosition="top">
                <Glyphicon glyph="info-sign" />
            </Button>
            <AutoRefreshInformationsMenu bsRole="menu" msgId="autorefresh.label.layersSummary">
                <div className="ms-autorefresh-layers-summary">
                    {layers.length === 0 && <Message msgId="autorefresh.label.noLayers"/>}
                    {layers.length > 0 &&
                        layers.map(l => (<div className={'ms-autorefresh-layer-summary__row ' + (l.visibility ? '' : 'ms-autorefresh-layer-summary__row-hidden ') + (l.visibility && l._v_ ? '' : 'ms-autorefresh-layer-summary__row-inactive')}
                            key={`autorefresh-layer-summary-${l.id}`}
                            title={getFullyQualifiedLayerTitle(l)}>
                            <span className="ms-autorefresh-layer-summary__row__title">{l.title}</span>
                            {l.visibility && l._v_ && <em>{formatDate(l._v_)}</em>}
                            <span className="ms-autorefresh-layer-summary__row__interval badge badge-info">{l.autoRefreshInterval}s</span>
                        </div>))}
                </div>
            </AutoRefreshInformationsMenu>
        </Dropdown>
    </div>);
};

export default AutoRefreshInformations;
