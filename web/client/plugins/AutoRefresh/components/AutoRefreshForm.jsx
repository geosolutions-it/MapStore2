import React from 'react';
import { Glyphicon, ControlLabel, Form, FormGroup, FormControl, InputGroup  } from "react-bootstrap";

import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import Message from '../../../components/I18N/Message';
import { AUTOREFRESH_STEP_INTERVAL_IN_SECONDS, formatDate } from '../constants';

const Button = tooltip(ButtonRB);

const AutoRefreshForm = ({
    defaultRefreshInterval,
    minRefreshInterval,
    availableLayers = {},
    activeLayers = {},
    ticks = {},
    handleAddLayer,
    handleRemoveLayer,
    handleIntervalChange
}) => {

    const onIntervalChange = (event, layer) => {
        const { value } = event.target || {};
        const numericValue = Number(value);

        handleIntervalChange(numericValue < minRefreshInterval ? minRefreshInterval : numericValue, layer.id);
    };

    const onAddLayer = (e) => {
        if (e.target.value === "none") {
            return;
        }

        handleAddLayer(e.target.value, defaultRefreshInterval);
        e.target.value = "none";
    };


    return (
        <div className="ms-autorefresh-form-container">
            <Form>
                <FormGroup controlId="autorefresh-settings-add-layer">
                    <ControlLabel>
                        <Message msgId="autorefresh.label.addLayer"/>
                    </ControlLabel>
                    <FormControl componentClass="select"
                        onChange={onAddLayer}>
                        <option value="none"></option>
                        {Object.values(availableLayers).map(l => (<option key={`autorefresh-layer-option-${l.id}`} value={l.id}>{l.title}</option>))}
                    </FormControl>
                </FormGroup>
            </Form>
            <form>
                {Object.values(activeLayers).map(layer => {

                    return (
                        <section className={"ms-autorefresh-form-group" + (layer.visibility ? '' : ' ms-autorefresh-form-group-hidden') + (layer.visibility && ticks[layer.id] ? '' : ' ms-autorefresh-form-group-inactive')}
                            key={`autorefresh-form-group-${layer.id}`}>
                            <Button bsSize="small" bsStyle="primary"
                                onClick={() => handleRemoveLayer(layer.id)}
                                className="square-button-sm ms-autorefresh-form-group__button"
                                tooltipPosition="top"
                                tooltip={<Message msgId="autorefresh.label.removeLayer"/>}>
                                <Glyphicon glyph="trash" />
                            </Button>
                            <span className="ms-autorefresh-form-group__title">{layer.title}</span>
                            <InputGroup className="ms-autorefresh-form-group__input">
                                <FormControl
                                    type="number"
                                    value={layer.autorefreshInterval ?? defaultRefreshInterval}
                                    onChange={(e) => onIntervalChange(e, layer)}
                                    min={minRefreshInterval}
                                    step={AUTOREFRESH_STEP_INTERVAL_IN_SECONDS}
                                />
                                <InputGroup.Addon>
                                    s
                                </InputGroup.Addon>
                            </InputGroup>
                            {ticks[layer.id] && layer.visibility && <em className="ms-autorefresh-form-group__summary">{ formatDate(ticks[layer.id]) }</em>}
                        </section>
                    );
                })}
            </form>
        </div>
    );
};

export default AutoRefreshForm;
