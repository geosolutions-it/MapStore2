/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isEqual, isNil } from 'lodash';

import JSONEditor from '../../../misc/codeEditors/JSONEditor';


import Message from "../../../I18N/Message";
import HTML from "../../../I18N/HTML";

import { FormGroup, Checkbox, Col, ControlLabel } from "react-bootstrap";
import InfoPopover from '../../../widgets/widget/InfoPopover';

// TODO: add variants
const INITIAL_CODE_VALUE = {
    "options": {}
};
/**
 * Advanced settings form, used by TMS
 * @prop {object} service the service to edit
 * @prop {function} onChangeServiceProperty handler (key, value) to change a property of service.
 */
export default ({
    service = {},
    setValid = () => { },
    onToggleThumbnail = () => {},
    onChangeServiceProperty = () => { }
}) => {
    const settings = service.options || service.variants ? {
        options: service.options || {},
        variants: service.variants
    } : undefined;
    const onValid = (config) => {
        const { options, variants } = config;
        if (!isEqual(options, service.options)) {
            onChangeServiceProperty("options", options);
        }
        if (!isEqual(variants, service.variants)) {
            onChangeServiceProperty("variants", variants);
        }
        setValid(true);
    };
    const onError = () => {
        if (service.options) {
            onChangeServiceProperty("options", undefined);
        }
        if (service.variants) {
            onChangeServiceProperty("variants", undefined);
        }
        setValid(false);
    };
    return (<div>
        <FormGroup controlId="autoload" key="autoload">
            <Col xs={12}>
                <Checkbox key="autoload" value="autoload"
                    onChange={(e) => onChangeServiceProperty("autoload", e.target.checked)}
                    checked={!isNil(service.autoload) ? service.autoload : false}>
                    <Message msgId="catalog.autoload" />
                </Checkbox>
                <Checkbox key="thumbnail" value="thumbnail"
                    onChange={() => onToggleThumbnail()}
                    checked={!isNil(service.hideThumbnail) ? !service.hideThumbnail : true}>
                    <Message msgId="catalog.showPreview" />
                </Checkbox>
                {service.provider === "tms"
                    ? <Checkbox key="forceDefaultTileGrid" value="forceDefaultTileGrid" onChange={(e) => onChangeServiceProperty("forceDefaultTileGrid", e.target.checked)}
                        checked={!isNil(service.forceDefaultTileGrid) ? service.forceDefaultTileGrid : false}>
                        <Message msgId="catalog.tms.forceDefaultTileGrid" />&nbsp;<InfoPopover text={<Message msgId="catalog.tms.forceDefaultTileGridDescription" />} />
                    </Checkbox>
                    : null}
            </Col>
            {!service.provider || service.provider === "custom"
                ? <Col>
                    <ControlLabel><Message msgId="catalog.tms.customTMSConfiguration" />&nbsp;&nbsp;<InfoPopover text={<HTML msgId="catalog.tms.customTMSConfigurationHint" />} /></ControlLabel>
                    <JSONEditor json={settings || INITIAL_CODE_VALUE} onValid={onValid} onError={onError} />
                </Col>
                : null}
        </FormGroup>
    </div>);
};
