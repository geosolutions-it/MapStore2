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

export const getPathinfo = (url = "") => {
    const [, path] = url?.split("#/") ?? [];
    const [pathType] = path?.split("/") ?? [];
    let pathLastIndex = path?.lastIndexOf("/");
    pathLastIndex = pathLastIndex === -1 ? path?.length : pathLastIndex;
    let pathTemplate = pathType === "context"
        ? "context"
        : (path?.substring(0, pathLastIndex) ?? "");
    pathTemplate = `/${!isEmpty(pathTemplate) ? pathTemplate : "viewer"}/` + '${id}';

    let type;
    switch (pathType) {
    case "viewer":
    case "map":
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
        pathTemplate = pathTemplate.replace("id", "name") + '?category=PERMALINK';
        break;
    default:
        type = "map";
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
                metadata: {name: uuid(), description: settings.description},
                attributes: {
                    ...pathInfo,
                    title: settings.title
                }
            },
            allowAllUser: settings.allowAllUser
        });
    };

    useEffect(() => {
        return () => onReset();
    }, []);

    return (
        <div id="permalink">
            {settings.name ? (
                <>
                    <ShareLink shareTitle="permalink.shareLinkTitle" shareUrl={getPermalinkUrl(settings.name)} />
                    <span className="subtitle"><Message msgId={"permalink.subtitle"}/></span>

                    <ShareQRCode shareUrl={getPermalinkUrl(settings.name)} />
                    <div className="create-new">
                        <Button bsStyle="primary" onClick={onReset}>
                            <Message msgId={"permalink.create"}/>
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <FormGroup>
                        <ControlLabel>
                            <Message msgId={"permalink.titleLabel"} />*
                        </ControlLabel>
                        <FormControl
                            key="permalinkTitle"
                            type="text"
                            value={settings.title || ""}
                            name="title"
                            onChange={onChange}
                            placeholder={"permalink.titlePlaceholder"}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>
                            <Message
                                msgId={"permalink.descriptionLabel"}
                            />
                        </ControlLabel>
                        <FormControl
                            key="permalinkDescription"
                            type="text"
                            value={settings.description || ""}
                            name="description"
                            onChange={onChange}
                            placeholder={
                                "permalink.descriptionPlaceholder"
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Checkbox
                            name="allowAllUser"
                            checked={settings.allowAllUser}
                            onChange={onChange}
                        >
                            <Message msgId="permalink.accessible" />
                        </Checkbox>
                    </FormGroup>
                    <div className="permalink-save">
                        <Button
                            className={loading ? "loading" : ''}
                            disabled={loading || isEmpty(settings.title)}
                            onClick={onClickSave}
                        >
                            <Message msgId="permalink.generate" />
                            {loading && <LoadingSpinner />}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
