/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {get, find} from 'lodash';
import Message from '../../I18N/Message';
import HTML from '../../I18N/HTML';

import {getConfigProp} from '../../../utils/ConfigUtils';

import InfoPopover from '../../widgets/widget/InfoPopover';
import { FormControl as FC, Form, Col, FormGroup, ControlLabel } from "react-bootstrap";

import localizedProps from '../../misc/enhancers/localizedProps';

const FormControl = localizedProps('placeholder')(FC);

const CUSTOM = "custom";
const TMS = "tms";

const DefaultURLEditor = ({ service = {}, onChangeUrl = () => { } }) => (<FormGroup controlId="URL">
    <Col xs={12}>
        <ControlLabel><Message msgId="catalog.url" /></ControlLabel>
        <FormControl
            type="text"
            style={{
                textOverflow: "ellipsis"
            }}
            placeholder="catalog.urlPlaceholder"
            value={service && service.url}
            onChange={(e) => onChangeUrl(e.target.value)} />
    </Col>
</FormGroup>);

// selector for tile provider
import CONFIG_PROVIDER from '../../../utils/ConfigProvider';

const getProviderLabel = k=> k === TMS ? "TMS 1.0.0" : k;
const TmsURLEditor = ({ serviceTypes = [], onChangeServiceProperty, service = {}, onChangeUrl = () => { }, onChangeTitle = () => { } }) => {
    const allowedProviders =
        getConfigProp('allowedProviders') // this allows overriding of the allowed providers list to remove some service that has been deactivated from the list
        || get(find(serviceTypes || [], {name: "tms"}), 'allowedProviders') // can be configured at plugin level or via props
        || [];
    const providers = Object.keys(CONFIG_PROVIDER)
        .filter(k =>
            allowedProviders === "ALL" // if set to "ALL" doesn't filter anything
            || allowedProviders.indexOf(k) >= 0);
    const selectedProvider = service === TMS ? service : service?.provider?.split?.(".")?.[0];
    const isCustom = !selectedProvider || selectedProvider === CUSTOM;
    const isTMS = selectedProvider === TMS;
    const needURL = isTMS || isCustom;
    return (<FormGroup>
        <Col xs={12} sm={isCustom ? 3 : 12} md={needURL ? 3 : 12}>
            <ControlLabel><Message msgId="catalog.tms.provider" /></ControlLabel>
            <FormControl
                onChange={(e) => {
                    const provider = e.target.value;
                    onChangeServiceProperty("provider", `${provider}`);
                    // auto-set title for pre-configured tile provider
                    if (provider !== CUSTOM && provider !== TMS) {
                        onChangeTitle(provider);
                    // auto reset if Title was set automatically
                    } else if (!isCustom && !isTMS) {
                        onChangeTitle("");
                    }
                }}
                value={selectedProvider}
                componentClass="select">
                {[CUSTOM, TMS, ...providers].map(k => ({ name: k, label: getProviderLabel(k) })).map((format) => <option value={format.name} key={format.name}>{format.label}</option>)}
            </FormControl>
        </Col>
        <Col xs={12} sm={9} md={9}>
            {isCustom
                ? <React.Fragment>
                    <ControlLabel><Message msgId="catalog.tms.urlTemplate" />&nbsp;&nbsp;<InfoPopover text={<HTML msgId="catalog.tms.urlTemplateHint" />} /></ControlLabel>
                    <FormControl
                        type="text"
                        style={{
                            textOverflow: "ellipsis"
                        }}
                        placeholder={"example: https://{s}.myUrl.com/{variant}/{z}/{x}/{y}"}
                        value={service && service.url}
                        onChange={(e) => onChangeUrl(e.target.value)} />
                </React.Fragment>
                : isTMS
                    ? <React.Fragment>
                        <ControlLabel><Message msgId="catalog.url" /></ControlLabel>
                        <FormControl
                            type="text"
                            style={{
                                textOverflow: "ellipsis"
                            }}
                            placeholder="catalog.urlPlaceholder"
                            value={service && service.url}
                            onChange={(e) => onChangeUrl(e.target.value)} />
                    </React.Fragment>
                    : null
            }
        </Col>
    </FormGroup>);
};


/**
 * Main Form for editing a catalog entry
 *
 */
export default ({
    service = {},
    serviceTypes, // TODO: this should be renamed most properly with something like serviceTypes
    onChangeTitle,
    onChangeUrl,
    onChangeServiceProperty,
    onChangeType
}) => {
    const URLEditor = service.type === "tms" ? TmsURLEditor : DefaultURLEditor;
    return (
        <Form horizontal >
            <FormGroup controlId="title" key="type-title-row">
                <Col key="type" xs={12} sm={3} md={3}>
                    <ControlLabel><Message msgId="catalog.type" /></ControlLabel>
                    <FormControl
                        onChange={(e) => onChangeType(e.target.value)}
                        value={service && service.type}
                        componentClass="select">
                        {serviceTypes.map((type) => <option value={type.name} key={type.name}>{type.label}</option>)}
                    </FormControl>
                </Col>
                <Col key="title" xs={12} sm={9} md={9}>
                    <ControlLabel><Message msgId="catalog.serviceTitle" /></ControlLabel>
                    <FormControl
                        type="text"
                        style={{
                            textOverflow: "ellipsis"
                        }}
                        placeholder={"catalog.serviceTitlePlaceholder"}
                        value={service && service.title}
                        onChange={(e) => onChangeTitle(e.target.value)} />
                </Col>
            </FormGroup>
            <URLEditor key="url-row" serviceTypes={serviceTypes} service={service} onChangeUrl={onChangeUrl} onChangeTitle={onChangeTitle} onChangeServiceProperty={onChangeServiceProperty} />
        </Form>);
};
