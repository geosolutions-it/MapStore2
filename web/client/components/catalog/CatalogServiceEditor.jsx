/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Spinner from "react-spinkit";

import {  FormGroup, Button, Form, Col } from "react-bootstrap";

import BorderLayout from "../layout/BorderLayout";
import Message from "../I18N/Message";

import AdvancedSettings from './editor/AdvancedSettings';
import MainForm from './editor/MainForm';


import 'react-select/dist/react-select.css';
import 'react-quill/dist/quill.snow.css';

export default ({
    service = {
        title: "",
        type: "wms",
        url: "",
        format: "image/png"
    },
    formats = [{ name: "csw", label: "CSW" }],
    urlPlaceholder = "catalog.urlPlaceholder",
    onChangeTitle = () => {},
    onChangeUrl = () => {},
    onChangeType = () => {},
    id,
    urlTooltip,
    formatOptions,
    buttonStyle,
    saving,
    onChangeServiceFormat = () => {},
    onChangeMetadataTemplate = () => {},
    onToggleAdvancedSettings = () => { },
    onChangeServiceProperty = () => {},
    onToggleTemplate = () => {},
    onToggleThumbnail = () => {},
    onAddService = () => {},
    onDeleteService = () => {},
    onChangeCatalogMode = () => {}
}) => (<BorderLayout
    bodyClassName="ms2-border-layout-body catalog"
    header={
        <MainForm
            service={service}
            formats={formats}
            urlPlaceholder={urlPlaceholder}
            onChangeTitle={onChangeTitle}
            onChangeUrl={onChangeUrl}
            onChangeType={onChangeType}
            urlTooltip={urlTooltip}
        />
    }>
    <Form >
        <AdvancedSettings
            id={id}
            service={service}
            formatOptions={formatOptions}
            buttonStyle={buttonStyle}
            saving={saving}
            onChangeServiceFormat={onChangeServiceFormat}
            onChangeMetadataTemplate={onChangeMetadataTemplate}
            onToggleAdvancedSettings={onToggleAdvancedSettings}
            onChangeServiceProperty={onChangeServiceProperty}
            onToggleTemplate={onToggleTemplate}
            onToggleThumbnail={onToggleThumbnail}
        />
        <FormGroup controlId="buttons" key="buttons">
            <Col xs={12}>
                <Button style={buttonStyle} disabled={saving} onClick={() => onAddService()} key="catalog_add_service_button">
                    {saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                    <Message msgId="save" />
                </Button>
                {service && !service.isNew
                    ? <Button style={buttonStyle} onClick={() => onDeleteService()} key="catalog_delete_service_button">
                        <Message msgId="catalog.delete" />
                    </Button>
                    : null
                }
                <Button style={buttonStyle} disabled={saving} onClick={() => onChangeCatalogMode("view")} key="catalog_back_view_button">
                    <Message msgId="cancel" />
                </Button>
            </Col>
        </FormGroup>
    </Form>
</BorderLayout>);
