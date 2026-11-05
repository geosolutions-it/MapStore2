/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactSelect from 'react-select';
import { Glyphicon, ControlLabel, Form, FormGroup, FormControl, InputGroup  } from "react-bootstrap";
import PropTypes from 'prop-types';

import { getMessageById } from "../../../utils/LocaleUtils";
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import Message from '../../../components/I18N/Message';
import { AUTOREFRESH_STEP_INTERVAL_IN_SECONDS, formatDate } from '../constants';

const SelectSync = ReactSelect;
const Button = tooltip(ButtonRB);

const AutoRefreshForm = ({
    defaultRefreshInterval,
    minimumRefreshInterval,
    availableLayers = [],
    activeLayers = [],
    handleAddLayer,
    handleRemoveLayer,
    handleIntervalChange
}, {messages}) => {

    const [filterText, setFilterText] = React.useState('');
    const filteredLayers = React.useMemo(
        () => activeLayers.filter(layer => layer.title.toLowerCase().includes(filterText.toLowerCase())),
        [filterText, activeLayers]
    );

    const onIntervalChange = (event, layer) => {
        const { value } = event.target || {};
        const numericValue = Number(value);

        handleIntervalChange(numericValue, layer.id);
    };

    const onAddLayer = (e) => {
        if (e.value === "none") {
            return;
        }

        handleAddLayer(e.value, defaultRefreshInterval);
        e.value = "none";
    };

    const getLayers = () => {
        return availableLayers.filter(layer => layer.title.toLowerCase().includes(filterText.toLowerCase())).map(l => ({ value: l.id, label: l.title }));
    };

    return (
        <div className="ms-autorefresh-form-container">
            <Form>
                <FormGroup controlId="autorefresh-settings-add-layer">
                    <ControlLabel>
                        <Message msgId="autorefresh.label.addLayer"/>
                    </ControlLabel>
                    <SelectSync
                        clearValueText={<Message msgId="autorefresh.label.add.clearValueText" />}
                        noResultsText={<Message msgId="autorefresh.label.add.noResultsText" />}
                        clearable
                        options={getLayers()}
                        value=""
                        onChange={onAddLayer}
                        placeholder={<Message msgId="autorefresh.label.add.placeholder" />}
                    />
                </FormGroup>
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
            <form>
                {filteredLayers.map(layer => {
                    return (
                        <section className={"ms-autorefresh-form-group" + (layer.visibility ? '' : ' ms-autorefresh-form-group-hidden') + (layer.visibility && layer._v_ ? '' : ' ms-autorefresh-form-group-inactive')}
                            key={`autorefresh-form-group-${layer.id}`}>
                            <div className="ms-autorefresh-form-group__text">
                                <div>
                                    <span className="glyphicon glyphicon-1-layer"/>
                                    <span className="ms-autorefresh-form-group__title" title={layer.title}>{layer.title}</span>
                                </div>
                                { layer.visibility && layer._v_ &&
                                <div>
                                    <span className="glyphicon glyphicon-refresh"/>
                                    <span className="ms-autorefresh-form-group__summary">{ formatDate(layer._v_) }</span>
                                </div>
                                }
                            </div>
                            <InputGroup className="ms-autorefresh-form-group__input">
                                <FormControl
                                    type="number"
                                    value={layer.autoRefreshInterval ?? defaultRefreshInterval}
                                    onChange={(e) => onIntervalChange(e, layer)}
                                    min={minimumRefreshInterval}
                                    step={AUTOREFRESH_STEP_INTERVAL_IN_SECONDS}
                                />
                                <InputGroup.Addon>
                                    s
                                </InputGroup.Addon>
                            </InputGroup>
                            <Button bsSize="small" bsStyle="primary"
                                onClick={() => handleRemoveLayer(layer.id)}
                                className="square-button-sm ms-autorefresh-form-group__button"
                                tooltipPosition="top"
                                tooltip={<Message msgId="autorefresh.label.removeLayer"/>}>
                                <Glyphicon glyph="trash" />
                            </Button>
                        </section>
                    );
                })}
            </form>
        </div>
    );
};

AutoRefreshForm.contextTypes = {
    messages: PropTypes.object
};

export default AutoRefreshForm;
