import React, {useEffect} from 'react';
import { ControlLabel, Form, FormGroup, FormControl, Checkbox  } from "react-bootstrap";

import Message from '../../../components/I18N/Message';
import AutoRefreshService from '../services/AutoRefreshService';
import { AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC, AUTOREFRESH_MIN_INTERVAL_IN_SEC, AUTOREFRESH_MAX_INTERVAL_IN_SEC, AUTOREFRESH_STEP_INTERVAL_IN_SEC } from '../constants';

const AutoRefreshForm = ({
    interval = AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC,
    layers = [],
    activeLayerIds = [],
    handleLayerEnabilityChange,
    handleIntervalChange
}) => {

    useEffect(() => {
        AutoRefreshService.updateIntervalInSec(interval);
    }, [interval]);

    useEffect(() => {
        console.debug('[arxit] layers to follow', layers);
        AutoRefreshService.setActiveLayers(layers);
    }, [layers]);

    return (
        <div>
            <Form>
                <FormGroup  controlId="autorefresh-settings-form-interval">
                    <ControlLabel  >
                        <Message msgId="autorefresh.label.interval"/>
                    </ControlLabel>
                    <FormControl
                        type="number"
                        value={interval}
                        placeholder="Enter text"
                        onChange={handleIntervalChange}
                        min={AUTOREFRESH_MIN_INTERVAL_IN_SEC}
                        max={AUTOREFRESH_MAX_INTERVAL_IN_SEC}
                        step={AUTOREFRESH_STEP_INTERVAL_IN_SEC}
                    />
                </FormGroup>
                {layers.map(l => (<FormGroup>
                    <Checkbox
                        key={`autorefresh-layer-${l.id}`}
                        id={`autorefresh-layer-${l.id}`}
                        inline
                        checked={activeLayerIds.includes(l.id)}
                        onChange={(e) => handleLayerEnabilityChange(e, l)}>
                        {l.title}
                    </Checkbox>
                </FormGroup>))}
            </Form>
        </div>
    );
};

export default AutoRefreshForm;
