/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';
import ReactQuill from "react-quill";
import { FormGroup, Checkbox, Col } from "react-bootstrap";

import Message from "../../../I18N/Message";
import InfoPopover from '../../../widgets/widget/InfoPopover';

/**
 * Common Advanced settings form, used by WMS/CSW/WMTS
 */
export default ({
    children,
    service,
    isLocalizedLayerStylesEnabled,
    onChangeMetadataTemplate = () => { },
    onChangeServiceProperty = () => { },
    onToggleTemplate = () => { },
    onToggleThumbnail = () => { }
}) => (
    <div>
        <FormGroup controlId="autoload" key="autoload">
            <Col xs={12}>
                <Checkbox value="autoload" onChange={(e) => onChangeServiceProperty("autoload", e.target.checked)}
                    checked={!isNil(service.autoload) ? service.autoload : false}>
                    <Message msgId="catalog.autoload" />
                </Checkbox>
            </Col>
        </FormGroup>
        <FormGroup controlId="thumbnail" key="thumbnail">
            <Col xs={12}>
                <Checkbox
                    onChange={() => onToggleThumbnail()}
                    checked={!isNil(service.hideThumbnail) ? !service.hideThumbnail : true}>
                    <Message msgId="catalog.showPreview" />
                </Checkbox>
            </Col>
        </FormGroup>
        {(isLocalizedLayerStylesEnabled && !isNil(service.type) ? service.type === "wms" : false) && (<FormGroup controlId="localized-styles" key="localized-styles">
            <Col xs={12}>
                <Checkbox data-qa="service-lacalized-layer-styles-option"
                    onChange={(e) => onChangeServiceProperty("localizedLayerStyles", e.target.checked)}
                    checked={!isNil(service.localizedLayerStyles) ? service.localizedLayerStyles : false}>
                    <Message msgId="catalog.enableLocalizedLayerStyles.label" />&nbsp;<InfoPopover text={<Message msgId="catalog.enableLocalizedLayerStyles.tooltip" />} />
                </Checkbox>
            </Col>
        </FormGroup>)}
        {(!isNil(service.type) ? service.type === "csw" : false) && (<FormGroup controlId="metadata-template" key="metadata-template" className="metadata-template-editor">
            <Col xs={12}>
                <Checkbox
                    onChange={() => onToggleTemplate()}
                    checked={service && service.showTemplate}>
                    <Message msgId="catalog.showTemplate" />
                </Checkbox>
                <br />
            </Col>
            {service && service.showTemplate &&
                (<Col xs={12}>
                    <span>
                        <p>
                            <Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: "{ }" }} />
                            &nbsp;&nbsp;

                        </p>
                        <pre>
                            <Message msgId="catalog.templateFormatDescriptionExample" />{" ${ description }"}
                        </pre>
                    </span>
                </Col>)}
            <Col xs={12}>
                {service && service.showTemplate && <ReactQuill
                    modules={{
                        toolbar: [
                            [{ "size": ["small", false, "large", "huge"] }, "bold", "italic", "underline", "blockquote"],
                            [{ "list": "bullet" }, { "align": [] }],
                            [{ "color": [] }, { "background": [] }, "clean"], ["link"]
                        ]
                    }}
                    value={service.metadataTemplate || ""}
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
        {children}
    </div>
);
