/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Form, FormControl, FormGroup, Alert } from 'react-bootstrap';
import LocaleUtils from '../../../utils/LocaleUtils';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import withConfirm from '../../misc/withConfirm';
import Thumbnail from '../../misc/Thumbnail';
import SwitchButton from '../../misc/switch/SwitchButton';
import { getVideoThumbnail } from '../../../utils/ThumbnailUtils';

const form = [
    {
        placeholder: "mediaEditor.mediaPicker.videoUrlPlaceholder",
        type: "text",
        id: "src",
        label: <Message msgId = "mediaEditor.mediaPicker.videoUrl"/>,
        validation: ({ src }) => src !== undefined && src === "" ?
            "error"
            : src
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.mediaPicker.titlePlaceholder",
        type: "text",
        id: "title",
        label: <Message msgId = "mediaEditor.mediaPicker.title"/>,
        validation: ({ title }) => title !== undefined && title === "" ?
            "error"
            : title
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.mediaPicker.descriptionPlaceholder",
        type: "text",
        id: "description",
        label: <Message msgId = "mediaEditor.mediaPicker.description"/>
    },
    {
        placeholder: "mediaEditor.mediaPicker.creditsPlaceholder",
        type: "text",
        id: "credits",
        label: <Message msgId = "mediaEditor.mediaPicker.credits"/>
    }
];

const VideoThumbnail = ({
    src,
    thumbnail,
    onUpdate
}) => {

    const mounted = useRef();
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // try to generate a thumbnail from video when it's missing or removed
    // stop when throws an error
    const [loading, setLoading] = useState(false);
    const [generateProcessError, setGenerateProcessError] = useState(false);
    useEffect(() => {
        if (src && !thumbnail && !loading && !generateProcessError) {
            setLoading(true);
            getVideoThumbnail(src, {
                width: 640,
                height: 360,
                type: 'image/jpeg',
                quality: 0.5
            }).then((response) => {
                if (mounted.current) {
                    onUpdate(response);
                    setLoading(false);
                }
            }).catch(() => {
                if (mounted.current) {
                    setLoading(false);
                    setGenerateProcessError(true);
                }
            });
        }
    }, [ src, thumbnail, loading, generateProcessError ]);

    const [errors, setErrors] = useState();
    return (
        <>
        <Thumbnail
            thumbnail={thumbnail}
            thumbnailOptions={{
                width: 640,
                height: 360,
                type: 'image/jpeg',
                quality: 0.5
            }}
            loading={loading}
            message={<Message msgId="mediaEditor.mediaPicker.thumbnail"/>}
            onUpdate={(newImageData) => {
                onUpdate(newImageData);
                setErrors(undefined);
            }}
            onRemove={() => {
                onUpdate(undefined);
                setErrors(undefined);
                // clear error to generate a new thumbnail
                setGenerateProcessError(false);
            }}
            onError={(err) => setErrors(err)}
        />
        {errors && errors.length > 0 &&
        <Alert bsStyle="danger" className="text-center">
            <div><Message msgId="map.error"/></div>
            {errors.indexOf('FORMAT') !== -1 && <div><Message msgId="map.errorFormat" /></div>}
            {errors.indexOf('SIZE') !== -1 && <div><Message msgId="map.errorSize" /></div>}
        </Alert>}
        </>
    );
};

const VideoForm = ({
    properties,
    setProperties = () => {},
    onSave = () => {},
    onClick = () => {}
}, context) => {
    const { messages = {} } = context || {};
    const { src, thumbnail } = properties;
    return (
        <BorderLayout
            className="ms-video-form"
            header={
                <div
                    className="text-center"
                    key="toolbar"
                    style={{
                        borderBottom: "1px solid #ddd",
                        padding: 8
                    }}>
                    <Toolbar
                        btnGroupProps={{
                            style: {
                                marginBottom: 8
                            }
                        }}
                        btnDefaultProps={{
                            bsStyle: "primary",
                            className: "square-button-md"
                        }}
                        buttons={[{
                            glyph: "arrow-left",
                            tooltipId: "mediaEditor.mediaPicker.back",
                            onClick
                        }, {
                            glyph: "floppy-disk",
                            tooltipId: "mediaEditor.mediaPicker.save",
                            disabled: !properties.src || !properties.title,
                            onClick: () => onSave(properties)
                        }]} />
                </div>
            }>
            <Form style={{ padding: 8 }}>
                <VideoThumbnail
                    src={src}
                    thumbnail={thumbnail}
                    onUpdate={(newThumbnail) => setProperties({ ...properties, thumbnail: newThumbnail })}
                />
                {form.map((field) => (
                    <FormGroup
                        key={field.id}
                        validationState={field.validation && field.validation(properties)}>
                        <ControlLabel>
                            {field.label}
                        </ControlLabel>
                        <FormControl
                            type={field.type}
                            placeholder={LocaleUtils.getMessageById(messages, field.placeholder)}
                            value={properties[field.id] || ""}
                            onChange={(event) => {
                                setProperties({
                                    ...properties,
                                    [field.id]: event.target.value
                                });
                            }} />
                    </FormGroup>
                ))}
                <FormGroup key="autoplay">
                    <ControlLabel><Message msgId="mediaEditor.mediaPicker.autoplay"/></ControlLabel>
                    <SwitchButton
                        onChange={() => setProperties({ ...properties, autoplay: !properties.autoplay })}
                        className="ms-geostory-settings-switch"
                        checked={properties.autoplay}
                    />
                </FormGroup>
            </Form>
        </BorderLayout>
    );
};

VideoForm.contextTypes = {
    messages: PropTypes.object
};

const VideoFormWithConfirm = withConfirm(VideoForm);

export default (props) => {
    const [ confirmPredicate, setConfirmPredicate ] = useState(false);
    const [ properties, setProperties ] = useState(props?.editing ? { ...props?.selectedItem.data } : {});
    return (
        <VideoFormWithConfirm
            { ...props }
            confirmTitle={<Message msgId = "mediaEditor.mediaform.confirmExitTitle"/>}
            confirmContent={<Message msgId = "mediaEditor.mediaform.confirmExitContent"/>}
            confirmPredicate={confirmPredicate}
            properties={properties}
            setProperties={(newProperties) => {
                setProperties(newProperties);
                setConfirmPredicate(true);
            }}
            onClick={() =>
                props?.editing && props?.setEditingMedia(false) || props?.setAddingMedia(false)
            }
        />
    );
};
