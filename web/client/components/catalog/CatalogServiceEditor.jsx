/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';
import Spinner from "react-spinkit";
import ReactQuill from "react-quill";
import localizedProps from '../misc/enhancers/localizedProps';
import BorderLayout from "../layout/BorderLayout";
import Message from "../I18N/Message";


import OverlayTrigger from '../misc/OverlayTrigger';
import SwitchPanel from "../misc/switch/SwitchPanel";
import Select from "react-select";
import 'react-select/dist/react-select.css';
import 'react-quill/dist/quill.snow.css';
import { FormControl as FC, FormGroup, Checkbox, Button, Form, Col, ControlLabel, Glyphicon, Tooltip } from "react-bootstrap";
const FormControl = localizedProps('placeholder')(FC);

export default ({
    id,
    showTemplate,
    newService = {
        title: "",
        type: "wms",
        url: "",
        format: "image/png"
    },
    buttonStyle,
    onToggleAdvancedSettings = () => {},
    onChangeTitle = () => {},
    onChangeUrl = () => {},
    onChangeType = () => {},
    saving,
    formats = [{ name: "csw", label: "CSW" }],
    formatOptions,
    onChangeServiceFormat = () => {},
    onChangeMetadataTemplate = () => {},
    onChangeAutoload = () => {},
    onToggleTemplate = () => {},
    onToggleThumbnail = () => {},
    onAddService = () => {},
    onDeleteService = () => {},
    onChangeCatalogMode = () => {}
}) => (<BorderLayout
    bodyClassName="ms2-border-layout-body catalog"
    header={<Form horizontal >
        <FormGroup>
            <Col xs={12}>
                <ControlLabel><Message msgId="catalog.url" /></ControlLabel>
                <FormControl
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    placeholder={"catalog.urlPlaceholder"}
                    value={newService && newService.url}
                    onChange={(e) => onChangeUrl(e.target.value)} />
            </Col>
        </FormGroup>
        <FormGroup controlId="title" key="title">
            <Col xs={12} sm={3} md={3}>
                <ControlLabel><Message msgId="catalog.type" /></ControlLabel>
                <FormControl
                    onChange={(e) => onChangeType(e.target.value)}
                    value={newService && newService.type}
                    componentClass="select">
                    {formats.map((format) => <option value={format.name} key={format.name}>{format.label}</option>)}
                </FormControl>
            </Col>
            <Col xs={12} sm={9} md={9}>
                <ControlLabel><Message msgId="catalog.serviceTitle" /></ControlLabel>
                <FormControl
                    type="text"
                    style={{
                        textOverflow: "ellipsis"
                    }}
                    placeholder={"catalog.serviceTitlePlaceholder"}
                    value={newService && newService.title}
                    onChange={(e) => onChangeTitle(e.target.value)} />
            </Col>
        </FormGroup>
    </Form>}>
    <Form >
        <SwitchPanel
            useToolbar
            title={<Message msgId="catalog.advancedSettings" />}
            expanded={!isNil(newService.showAdvancedSettings) ? newService.showAdvancedSettings : false}
            onSwitch={onToggleAdvancedSettings}>
            <div>
                <FormGroup controlId="autoload" key="autoload">
                    <Col xs={12}>
                        <Checkbox value="autoload" onChange={(e) => onChangeAutoload(e.target.checked)}
                            checked={!isNil(newService.autoload) ? newService.autoload : false}>
                            <Message msgId="catalog.autoload" />
                        </Checkbox>
                    </Col>
                </FormGroup>
                <FormGroup controlId="thumbnail" key="thumbnail">
                    <Col xs={12}>
                        <Checkbox
                            onChange={() => onToggleThumbnail()}
                            checked={!isNil(newService.hideThumbnail) ? !newService.hideThumbnail : true}>
                            <Message msgId="catalog.showPreview" />
                        </Checkbox>
                    </Col>
                </FormGroup>
                {(!isNil(newService.type) ? newService.type === "csw" : false) && (<FormGroup controlId="metadata-template" key="metadata-template" className="metadata-template-editor">
                    <Col xs={12}>
                        <Checkbox
                            onChange={() => onToggleTemplate()}
                            checked={showTemplate}>
                            <Message msgId="catalog.showTemplate" />
                        </Checkbox>
                        <br />
                    </Col>
                    {showTemplate &&
                        (<Col xs={12}>
                            <span>
                                <p>
                                    <Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: "{ }" }} />
                                    &nbsp;&nbsp;
                                    <OverlayTrigger
                                        placement="top"
                                        key={"overlay-trigger." + id}
                                        overlay={<Tooltip id="metadata-tooltip">
                                            <Message msgId="catalog.templateMetadataAvailable" />
                                        </Tooltip>}>
                                        <Glyphicon glyph="question-sign" />
                                    </OverlayTrigger>
                                </p>
                                <pre>
                                    <Message msgId="catalog.templateFormatDescriptionExample" />{" ${ description }"}
                                </pre>
                            </span>
                        </Col>)}
                    <Col xs={12}>
                        {showTemplate && <ReactQuill
                            modules={{
                                toolbar: [
                                    [{ "size": ["small", false, "large", "huge"] }, "bold", "italic", "underline", "blockquote"],
                                    [{ "list": "bullet" }, { "align": [] }],
                                    [{ "color": [] }, { "background": [] }, "clean"], ["link"]
                                ]
                            }}
                            value={newService.metadataTemplate || ""}
                            onChange={(metadataTemplate) => {
                                if (metadataTemplate && metadataTemplate !== "<p><br></p>") {
                                    onChangeMetadataTemplate(metadataTemplate);
                                } else {
                                    // TODO think about this
                                    onChangeMetadataTemplate("");
                                }
                            }} />
                        }
                    </Col>
                </FormGroup>)}
                <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: 15, borderTop: '1px solid #ddd' }}>
                    <Col xs={6}>
                        <ControlLabel>Format</ControlLabel>
                    </Col >
                    <Col xs={6}>
                        <Select
                            value={newService && newService.format}
                            clearable
                            options={formatOptions}
                            onChange={event => onChangeServiceFormat(event && event.value)} />
                    </Col >
                </FormGroup>
            </div>
        </SwitchPanel>
        <FormGroup controlId="buttons" key="buttons">
            <Col xs={12}>
                <Button style={buttonStyle} disabled={saving} onClick={() => onAddService()} key="catalog_add_service_button">
                    {saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                    <Message msgId="save" />
                </Button>
                {newService && !newService.isNew
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
