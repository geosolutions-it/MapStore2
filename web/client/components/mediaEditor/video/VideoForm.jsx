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

    const [errors, setErrors] = useState();
    const [loading, setLoading] = useState();
    // try to automatically create a thumbnail from video source
    // when thumbnail is missing
    const [createThumbnail, setCreateThumbnail] = useState(!thumbnail);
    useEffect(() => {
        if (src && createThumbnail) {
            setErrors(undefined);
            setLoading(true);
            getVideoThumbnail(src, {
                width: 640,
                height: 360,
                type: 'image/jpeg',
                quality: 0.5
            }).then((response) => {
                if (mounted.current) {
                    onUpdate(response);
                    setCreateThumbnail(false);
                    setLoading(false);
                }
            }).catch(() => {
                if (mounted.current) {
                    setCreateThumbnail(false);
                    setErrors([ 'CREATE' ]);
                    setLoading(false);
                }
            });
        }
    }, [ src, createThumbnail ]);

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
            onError={(err) => setErrors(err)}
            toolbarButtons={[
                {
                    glyph: 'refresh',
                    tooltipId: 'mediaEditor.mediaPicker.createVideoThumbnail',
                    visible: !thumbnail,
                    onClick: (event) => {
                        event.stopPropagation();
                        setCreateThumbnail(true);
                    }
                },
                {
                    glyph: 'trash',
                    tooltipId: 'removeThumbnail',
                    visible: !!thumbnail,
                    onClick: (event) => {
                        event.stopPropagation();
                        onUpdate(undefined);
                        setErrors(undefined);
                    }
                }
            ]}
        />
        {errors && errors.length > 0 &&
        <Alert bsStyle="danger" className="text-center">
            {errors.indexOf('CREATE') === -1 && <div><Message msgId="map.error"/></div>}
            {errors.indexOf('FORMAT') !== -1 && <div><Message msgId="map.errorFormat" /></div>}
            {errors.indexOf('SIZE') !== -1 && <div><Message msgId="map.errorSize" /></div>}
            {errors.indexOf('CREATE') !== -1 && <div><Message msgId="mediaEditor.mediaPicker.thumbnailCreateError" /></div>}
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
