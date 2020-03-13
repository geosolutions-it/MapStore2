/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../../I18N/Message';

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

const PROVIDERS_ALLOWED = ["OpenStreetMap", "OpenSeaMap"];

const getProviderLabel = k=> k === TMS ? "TMS 1.0.0" : k;
const TileProviderURLEditor = ({ onChangeServiceProperty, service = {}, onChangeUrl = () => { }, onChangeTitle = () => { } }) => {
    const providers = Object.keys(CONFIG_PROVIDER).filter(k => PROVIDERS_ALLOWED.indexOf(k) >= 0);
    const selectedProvider = service === TMS ? service : service?.provider?.split?.(".")?.[0];
    const isCustom = !selectedProvider || selectedProvider === CUSTOM;
    const isTMS = selectedProvider === TMS;
    const needURL = isTMS || isCustom;
    return (<FormGroup>
        <Col xs={12} sm={isCustom ? 3 : 12} md={needURL ? 3 : 12}>
            <ControlLabel><Message msgId="catalog.tileProvider.provider" /></ControlLabel>
            <FormControl
                onChange={(e) => {
                    const provider = e.target.value;
                    onChangeServiceProperty("provider", `${provider}`);
                    onChangeTitle(provider);
                }}
                value={selectedProvider}
                componentClass="select">
                {[CUSTOM, TMS, ...providers].map(k => ({ name: k, label: getProviderLabel(k) })).map((format) => <option value={format.name} key={format.name}>{format.label}</option>)}
            </FormControl>
        </Col>
        <Col xs={12} sm={9} md={9}>
            {isCustom
                ? <React.Fragment>
                    <ControlLabel><Message msgId="catalog.tileProvider.urlTemplate" /></ControlLabel>
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
                    ? <Col xs={12}>
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
                    : null
            }
        </Col>
    </FormGroup>);
};


/**
 * Main Form for editing a catalog entry
 */
export default ({
    service = {},
    formats,
    onChangeTitle,
    onChangeUrl,
    onChangeServiceProperty,
    onChangeType
}) => {
    const URLEditor = service.type === "tms" ? TileProviderURLEditor : DefaultURLEditor;
    return (
        <Form horizontal >
            <FormGroup controlId="title" key="type-title-row">
                <Col key="type" xs={12} sm={3} md={3}>
                    <ControlLabel><Message msgId="catalog.type" /></ControlLabel>
                    <FormControl
                        onChange={(e) => onChangeType(e.target.value)}
                        value={service && service.type}
                        componentClass="select">
                        {formats.map((format) => <option value={format.name} key={format.name}>{format.label}</option>)}
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
            <URLEditor key="url-row" service={service} onChangeUrl={onChangeUrl} onChangeTitle={onChangeTitle} onChangeServiceProperty={onChangeServiceProperty} />
        </Form>);
};
