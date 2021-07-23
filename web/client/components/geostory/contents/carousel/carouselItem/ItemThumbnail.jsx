/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import Message from "../../../../I18N/Message";
import {get} from "lodash";
import {ControlLabel, Form, FormControl as FC, FormGroup} from "react-bootstrap";
import Thumbnail from "../../../../maps/forms/Thumbnail";
import ResizableModal from "../../../../misc/ResizableModal";
import localizedProps from "../../../../misc/enhancers/localizedProps";
const FormControl = localizedProps('placeholder')(FC);

export default (props) => {
    const [thumbnailErrors, setThumbnailErrors] = useState([]);
    const [thumbnail, setThumbnail] = useState({data: props?.thumbnail?.image});
    const [title, setTitle] = useState(props?.title);
    const renderThumbnailErrors = () => {
        const errorMessages = {
            "FORMAT": <Message msgId="map.errorFormat" />,
            "SIZE": <Message msgId="map.errorSize" />
        };
        return thumbnailErrors.length > 0 ? (
            <div className="dropzone-errorBox alert-danger">
                <p><Message msgId="map.error"/></p>
                {(thumbnailErrors.map(err =>
                    <div id={"error" + err} key={"error" + err} className={"error" + err}>
                        {errorMessages[err]}
                    </div>
                ))}
            </div>
        ) : null;
    };
    return (
        <ResizableModal
            fitContent
            title={<Message msgId={props.editing ? 'geostory.carouselEditTitle' : 'geostory.carouselAddTitle'}/>}
            show
            fade
            clickOutEnabled={false}
            bodyClassName="ms-flex modal-properties-container background-dialog"
            onClose={props.onClose}
            buttons={props.loading ? [] : [
                {
                    text: <Message msgId={props.editing ? 'save' : 'backgroundDialog.add'}/>,
                    bsStyle: 'primary',
                    onClick: () => {
                        props.update("thumbnail", { image: thumbnail.data });
                        props.update("title", title);
                        props.onClose();
                    }
                }
            ]}
        >
            {<Form style={{width: '100%'}}>
                {renderThumbnailErrors()}
                <Thumbnail
                    onUpdate={(data, url) => setThumbnail({data, url})}
                    onError={(errors) => setThumbnailErrors(errors)}
                    message={<Message msgId="backgroundDialog.thumbnailMessage"/>}
                    suggestion=""
                    map={{
                        newThumbnail: get(thumbnail, 'url') || props.thumbnail?.image || "NODATA"
                    }}
                />
                <FormGroup>
                    <ControlLabel><Message msgId="layerProperties.title"/></ControlLabel>
                    <FormControl
                        value={title}
                        placeholder={"backgroundDialog.titlePlaceholder"}
                        onChange={event => setTitle(event.target.value)}/>
                </FormGroup>
            </Form>}
        </ResizableModal>
    );
};
