/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, Dropdown, MenuItem, Form, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { getMessageById } from "../../../utils/LocaleUtils";
import AutoRefreshLayerRow from './AutoRefreshLayerRow';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';

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
}, {messages}) => {
    const [filterText, setFilterText] = React.useState('');
    const filteredLayers = React.useMemo(
        () => layers.filter(l => String(l.title || l.name || '').toLowerCase().includes(filterText.toLowerCase())),
        [filterText, layers]
    );

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
                <Form>
                    <FormGroup>
                        <InputGroup>
                            <FormControl
                                placeholder={getMessageById(messages, "autorefresh.label.filter.placeholder")}
                                value={filterText}
                                onChange={(event) => setFilterText(event?.target?.value)}
                            />
                            {filterText
                                ? <InputGroup.Button>
                                    <Button tooltipId="autorefresh.label.filter.clearFilter" onClick={() => setFilterText('')}><Glyphicon glyph="1-close"/></Button>
                                </InputGroup.Button>
                                : <InputGroup.Addon>
                                    <Glyphicon glyph="filter"/>
                                </InputGroup.Addon>}
                        </InputGroup>
                    </FormGroup>
                </Form>
                <div className="ms-autorefresh-layers-summary">
                    {layers.length === 0 && <Message msgId="autorefresh.label.noLayers"/>}
                    {filteredLayers.length > 0 &&
                        filteredLayers.map(l => (<AutoRefreshLayerRow key={`autorefresh-layer-summary-${l.id}`} layer={l} />))}
                </div>
            </AutoRefreshInformationsMenu>
        </Dropdown>
    </div>);
};

AutoRefreshInformations.contextTypes = {
    messages: PropTypes.object
};


export default AutoRefreshInformations;
