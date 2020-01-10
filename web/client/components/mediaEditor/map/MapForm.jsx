/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ControlLabel, Form, FormControl, FormGroup} from 'react-bootstrap';
import { compose, getContext, withState, withHandlers, defaultProps, withPropsOnChange} from 'recompose';
import {connect} from 'react-redux';
import {isEqual} from 'lodash';

import {show} from '../../../actions/mapEditor';
import LocaleUtils from '../../../utils/LocaleUtils';
import {MediaTypes} from '../../../utils/GeoStoryUtils';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';

import {isMediaResourceUsed} from '../../../selectors/geostory';
import Thumbnail from '../../maps/forms/Thumbnail';
import withConfirm from '../../misc/withConfirm';

const SaveButton = withConfirm(ToolbarButton);
const SaveButtonWithConfirm = (props) => {
    console.log(props);
    return (<SaveButton
        confirmTitle={<Message msgId = "mediaEditor.mapForm.confirmMapSaveTitle"/>}
        confirmContent={<Message msgId = "mediaEditor.mapForm.confirmMapSaveContent"/>} {...props}/>);
};

const form = [
    {
        placeholder: "mediaEditor.mediaPicker.titlePlaceholder",
        type: "text",
        id: "name",
        label: <Message msgId = "mediaEditor.mediaPicker.title"/>,
        validation: ({ name }) => name !== undefined && name === "" ?
            "error"
            : name
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.mediaPicker.descriptionPlaceholder",
        type: "text",
        id: "description",
        label: <Message msgId = "mediaEditor.mediaPicker.description"/>
    }
];

const enhance = compose(
    connect(
        (state, ownProps) => {
            const {selectedItem: {id, type} = {}} = ownProps || {};
            return {
                isResourceUsed: type === MediaTypes.MAP && isMediaResourceUsed(state, id)
            };
        }, {
            openMapEditor: show
        }),
    defaultProps({
        confirmTitle: <Message msgId = "mediaEditor.mediaform.confirmExitTitle"/>,
        confirmContent: <Message msgId = "mediaEditor.mediaform.confirmExitContent"/>
    }),
    withState("properties", "setProperties", ({selectedItem: {data: {name, thumbnail, description} = {}} = {}}) => {
        return ({name, thumbnail, description});
    }),
    withState("initialResource", null, ({properties, selectedItem: {data = {}} = {}}) => ({...data, ...properties})),
    withHandlers({
        openMapEditor: ({selectedItem, openMapEditor}) => () => {
            const {id, ...data} = selectedItem.data;
            openMapEditor('mediaEditor', {data, id});
        },
        onSave: ({onSave, selectedItem: {data = {}} = {}, properties}) =>
            () => onSave( {...data, ...properties}),
        updateThumb: ({setProperties, properties}) =>
            (dataURI) => setProperties({...properties, thumbnail: dataURI}),
        onClick: ({setAddingMedia, setEditingMedia, editing}) => () => {
            editing && setEditingMedia(false) || setAddingMedia(false);
        }
    }),
    withPropsOnChange(["selectedItem", "initialResource", "properties"], ({initialResource, selectedItem: {data = {}} = {}, properties, ...rest}) => {
        console.log(rest);
        return {confirmPredicate: !isEqual(initialResource, {...data, ...properties})};
    }),
    withConfirm,
    defaultProps({
        errorMessages: {
            "FORMAT": <Message msgId="map.errorFormat" />,
            "SIZE": <Message msgId="map.errorCustomSize" msgParams={{maxFileSize: '50kb'}}/>
        }
    }),
    withState("thumbnailErrors", "setErrors", () => ([])),
    getContext({messages: {}})
);


export const MapForm = ({
    properties = {},
    setProperties = () => {},
    onSave = () => {},
    updateThumb = () => {},
    messages,
    openMapEditor,
    setErrors,
    thumbnailErrors = [],
    errorMessages,
    onClick = () => {},
    confirmPredicate: saveEnabled,
    isResourceUsed = false
}) => (
    <BorderLayout
        className="ms-mapForm"
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
                        renderButton: <SaveButtonWithConfirm
                            glyph="floppy-disk"
                            tooltipId="mediaEditor.mediaPicker.save"
                            disabled={!properties.name || !saveEnabled}
                            onClick={onSave}
                            bsStyle="primary"
                            className="square-button-md"
                            confirmPredicate={saveEnabled && isResourceUsed}
                        />
                    },
                    {
                        glyph: 'pencil',
                        tooltipId: 'mediaEditor.mediaPicker.edit',
                        onClick: openMapEditor
                    }
                    ]} />
            </div>
        }>

        <Form style={{ padding: 8 }}>
            {
                thumbnailErrors.length > 0 ? (
                    <div className="dropzone-errorBox alert-danger">
                        <p><Message msgId="map.error"/></p>
                        {(thumbnailErrors.map(err =>
                            <div id={"error" + err} key={"error" + err} className={"error" + err}>
                                {errorMessages[err]}
                            </div>
                        ))}
                    </div>
                ) : null}
            <Thumbnail
                onUpdate={updateThumb}
                withLabel={false}
                onError={setErrors}
                message={<Message msgId="mediaEditor.mapForm.thumbnailMessage"/>}
                thumbnail={properties.thumbnail}
                suggestion=""
                maxFileSize={50000}
                map={{
                    newThumbnail: properties.thumbnail || "NODATA"
                }}
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

export default enhance(MapForm);
