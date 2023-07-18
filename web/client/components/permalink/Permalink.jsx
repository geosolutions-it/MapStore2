/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from "react";
import uuid from 'uuid';
import isEmpty from 'lodash/isEmpty';
import {
    Checkbox,
    ControlLabel,
    FormControl as FC,
    FormGroup
} from "react-bootstrap";
import localizedProps from "../misc/enhancers/localizedProps";
import ShareLink from "../share/ShareLink";
import Button from "../misc/Button";
import Message from "../I18N/Message";
import ShareQRCode from "../share/ShareQRCode";
import LoadingSpinner from "../misc/LoadingSpinner";

const FormControl = localizedProps("placeholder")(FC);

const getPathinfo = (url = "") => {
    const [, path] = url?.split("#/") ?? [];
    const pathInfos = path?.split("/") ?? [];
    let [pathType] = pathInfos ?? [];
    let pathTemplate = pathType === "context"
        ? "context"
        : (path?.substring(0, path?.lastIndexOf("/")) ?? "");
    pathTemplate = `/${pathTemplate}/` + '${id}';

    let type;
    switch (pathType) {
    case "viewer":
        type = "map";
        break;
    case "dashboard":
        type = "dashboard";
        break;
    case "geostory":
        type = "geostory";
        break;
    case "context":
        type = "context";
        pathTemplate = pathTemplate.replace("id", "name");
        break;
    default:
        break;
    }
    return {
        type,
        pathTemplate
    };
};

export default ({
    loading = false,
    settings = {},
    shareUrl = "",
    onSave = () => {},
    onReset = () => {},
    onUpdateSettings = () => {}
}) => {
    const onChange = (event) => {
        const { value, name, checked } = event?.target || {};
        onUpdateSettings({
            [name]: name === "allowAllUser" ? checked : value
        });
    };
    const getPermalinkUrl = (id) => {
        const url = location.href?.split("#")[0];
        return url + `#/permalink/${id}`;
    };

    const onClickSave = () => {
        const pathInfo = getPathinfo(shareUrl);
        onSave({
            permalinkType: pathInfo.type,
            resource: {
                category: "PERMALINK",
                metadata: {name: uuid()},
                attributes: {
                    ...pathInfo,
                    title: settings.title,
                    description: settings.description
                }
            },
            allowAllUser: settings.allowAllUser
        });
    };

    useEffect(() => {
        return () => onReset();
    }, []);

    return (
        <div id="permalink" style={{padding: 4}}>
            {settings.id ? (
                <>
                    <ShareLink shareUrl={getPermalinkUrl(settings.id)} />
                    <Button bsStyle="primary" onClick={onReset}>
                        <Message msgId={"share.permalink.create"}/>
                    </Button>
                    <ShareQRCode shareUrl={getPermalinkUrl(settings.id)} />
                </>
            ) : (
                <>
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId={"share.permalink.titleLabel"} />*
                        </ControlLabel>
                        <FormControl
                            key="permalinkTitle"
                            type="text"
                            value={settings.title || ""}
                            name="title"
                            onChange={onChange}
                            placeholder={"share.permalink.titlePlaceholder"}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>
                            <Message
                                msgId={"share.permalink.descriptionLabel"}
                            />
                        </ControlLabel>
                        <FormControl
                            key="permalinkDescription"
                            type="text"
                            value={settings.description || ""}
                            name="description"
                            onChange={onChange}
                            placeholder={
                                "share.permalink.descriptionPlaceholder"
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Checkbox
                            name="allowAllUser"
                            checked={settings.allowAllUser}
                            onChange={onChange}
                        >
                            <Message msgId="share.permalink.accessible" />
                        </Checkbox>
                    </FormGroup>
                    <Button
                        style={{ display: "flex", alignItems: "center", "float": "right" }}
                        disabled={loading || isEmpty(settings.title)}
                        onClick={onClickSave}
                    >
                        <Message msgId="share.permalink.save" />
                        {loading && <LoadingSpinner />}
                    </Button>
                </>
            )}
        </div>
    );
};
