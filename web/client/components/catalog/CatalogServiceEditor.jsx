/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import Loader from '../misc/Loader';

import { FormGroup, Form, Col } from "react-bootstrap";

import Button from '../misc/Button';
import BorderLayout from "../layout/BorderLayout";
import Message from "../I18N/Message";

import AdvancedSettings from './editor/AdvancedSettings';
import MainForm from './editor/MainForm';

const withAbort = (Component) => {
    return (props) => {
        const [abortController, setAbortController] = useState(null);
        const onSave = () => {
            // Currently abort request on saving is applicable only for COG service
            const controller = props.format === 'cog' ? new AbortController() : null;
            setAbortController(controller);
            return props.onAddService({save: true, controller});
        };
        const onCancel = () => abortController && props.saving ? abortController?.abort() : props.onChangeCatalogMode("view");
        return <Component {...props} onCancel={onCancel} onSaveService={onSave} disabled={!abortController && props.saving} />;
    };
};
const CatalogServiceEditor = ({
    service = {
        title: "",
        type: "wms",
        url: "",
        format: "image/png"
    },
    serviceTypes = [{ name: "csw", label: "CSW" }],
    onChangeTitle = () => {},
    onChangeUrl = () => {},
    addonsItems,
    onChangeType = () => {},
    id,
    urlTooltip,
    formatOptions,
    buttonStyle,
    saving,
    showFormatError,
    onChangeServiceFormat = () => {},
    onChangeMetadataTemplate = () => {},
    onToggleAdvancedSettings = () => { },
    onChangeServiceProperty = () => {},
    onToggleTemplate = () => {},
    onToggleThumbnail = () => {},
    onDeleteService = () => {},
    onCancel = () => {},
    onSaveService = () => {},
    onFormatOptionsFetch = () => {},
    selectedService,
    isLocalizedLayerStylesEnabled,
    tileSizeOptions = [256, 512],
    formatsLoading,
    layerOptions = {},
    infoFormatOptions,
    services,
    autoSetVisibilityLimits = false,
    disabled
}) => {
    const [valid, setValid] = useState(true);
    return (<BorderLayout
        bodyClassName="ms2-border-layout-body catalog"
        header={
            <MainForm
                setValid={setValid}
                service={service}
                serviceTypes={serviceTypes}
                onChangeTitle={onChangeTitle}
                onChangeUrl={onChangeUrl}
                addonsItems={addonsItems}
                onChangeType={onChangeType}
                onChangeServiceProperty={onChangeServiceProperty}
                urlTooltip={urlTooltip}
            />
        }>
        <Form >
            <AdvancedSettings
                setValid={setValid}
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
                isLocalizedLayerStylesEnabled={isLocalizedLayerStylesEnabled}
                tileSizeOptions={tileSizeOptions}
                currentWMSCatalogLayerSize={layerOptions.tileSize ? layerOptions.tileSize : 256}
                selectedService={selectedService}
                onFormatOptionsFetch={onFormatOptionsFetch}
                showFormatError={showFormatError}
                formatsLoading={formatsLoading}
                infoFormatOptions={infoFormatOptions}
                autoSetVisibilityLimits={autoSetVisibilityLimits}
            />
            <FormGroup controlId="buttons" key="buttons">
                <Col xs={12}>
                    <Button style={buttonStyle} disabled={saving || !valid} onClick={onSaveService} key="catalog_add_service_button">
                        {saving ? <Loader size={12} style={{display: 'inline-block'}} /> : null}
                        <Message msgId="save" />
                    </Button>
                    {service && !service.isNew
                        ? <Button style={buttonStyle} disabled={saving} onClick={() => onDeleteService(service, services)} key="catalog_delete_service_button">
                            <Message msgId="catalog.delete" />
                        </Button>
                        : null
                    }
                    <Button style={buttonStyle} disabled={disabled} onClick={onCancel} key="catalog_back_view_button">
                        <Message msgId="cancel" />
                    </Button>
                </Col>
            </FormGroup>
        </Form>
    </BorderLayout>);
};

export default withAbort(CatalogServiceEditor);
