import React from 'react';
import { Glyphicon, ControlLabel, Form, FormGroup, FormControl, Col, InputGroup  } from "react-bootstrap";

import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonRB from '../../../components/misc/Button';
import Message from '../../../components/I18N/Message';
import { AUTOREFRESH_STEP_INTERVAL_IN_SECONDS } from '../constants';

const Button = tooltip(ButtonRB);

const AutoRefreshForm = ({
    defaultRefreshInterval,
    minRefreshInterval,
    availableLayers = {},
    activeLayers = {},
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
            <Form horizontal>

                {Object.values(activeLayers).map(layer => {

                    return (
                        <FormGroup key={`autorefresh-form-group-${layer.id}`}>
                            <Col sm={2}>
                                <Button bsSize="small" bsStyle="primary"
                                    onClick={() => handleRemoveLayer(layer.id)}
                                    className="square-button-sm"
                                    tooltipPosition="top"
                                    tooltip={<Message msgId="autorefresh.label.removeLayer"/>}>
                                    <Glyphicon glyph="trash" />
                                </Button>
                            </Col>
                            <Col className="ms-autorefresh-layer-title" sm={5}>
                                <span title={layer.title}>{layer.title}</span>
                            </Col>
                            <Col sm={5}>
                                <InputGroup>
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
                            </Col>
                        </FormGroup>
                    );
                })}
            </Form>
        </div>
    );
};

export default AutoRefreshForm;
