/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Alert, Glyphicon } from 'react-bootstrap';
import { ControlledPopover } from './Popover';
import Toolbar from '../misc/toolbar/Toolbar';
import tooltip from '../misc/enhancers/tooltip';
import ButtonRB from '../misc/Button';
import JSONEditor from '../misc/codeEditors/JSONEditor';
import { isEqual } from 'lodash';
import Message from '../I18N/Message';
import {getMessageById} from '../../utils/LocaleUtils';

const Button = tooltip(ButtonRB);

const INITIAL_CODE_VALUE = {
    "params": []
};
/**
 * Component to change the layer classification options
 * @memberof components.styleeditor
 * @name ClassificationLayerSettings
 * @prop {object} thematicCustomParams parameters to update
 * @prop {function} onUpdate returns the updated value
 */
function ClassificationLayerSettings({
    onUpdate,
    thematicCustomParams,
    editorRef
}, { messages }) {
    const [open, setOpen] = useState(false);
    const [isValidJson, setValid] = useState(true);
    const [alert, setAlert] = useState(false);

    const validateEnteredParams = (jsonParams) =>{
        let valid = true;
        jsonParams.params.forEach((item) => {
            let isObject = typeof item === 'object';
            let hasFieldProp = item?.field;
            let hasValues = item?.values?.length && item?.values?.length >= 1;
            let hasCorrectValues = hasValues ? item?.values.every(val => val?.value && val?.name) : false;
            if (!(isObject && hasFieldProp && hasCorrectValues)) {
                valid = false;
            }
        });
        return valid;
    };

    // onValid handler: validate teh written json in run-time
    const onValid = (config) => {
        if (!config?.params?.length) return;
        let isValid = validateEnteredParams(config);
        if (!isValid) {
            setValid(false);
            throw new Error(getMessageById(messages, "styleeditor.wrongFormatMsg"));
        } else {
            !isValidJson && setValid(true);
        }
        return;
    };
    const onError = () => {
        setValid(false);
    };

    // fired on editorWillUnmount
    const saveChanges = (code) => {
        try {
            const config = JSON.parse(code);
            let isValid = validateEnteredParams(config);
            if (isValid && !isEqual(config, thematicCustomParams)) {
                onUpdate(config);
            }
        } catch (e) { /**/ }
    };

    const onToggle = () => {
        // info: showing an alert if entered json not valid
        if (isValidJson) {
            setOpen(prev => !prev);
        } else {
            setAlert(true);
        }
    };

    return (
        <ControlledPopover
            open={open}
            onClick={() => onToggle()}
            placement={'right'}
            content={
                <div className="ms-classification-layer-settings">
                    <div className="ms-classification-layer-settings-title">
                        <Message msgId="styleeditor.customParams" />
                        <Button
                            className="square-button-md no-border"
                            onClick={() => onToggle()}
                        >
                            <Glyphicon
                                glyph="1-close"
                            />
                        </Button>
                    </div>
                    <JSONEditor
                        json={thematicCustomParams?.params ? thematicCustomParams : INITIAL_CODE_VALUE}
                        editorWillUnmount={saveChanges}
                        onValid={onValid}
                        onError={onError}
                        editorRef={editorRef}
                    />
                    {alert &&
                        <div className="ms-style-editor-alert">
                            <Alert bsStyle="warning">
                                <p><Message msgId="styleeditor.alertCustomParamsNotValid" /></p>
                                <p>
                                    <Toolbar
                                        buttons={[
                                            {
                                                text: <Message msgId="styleeditor.stayInTextareaEditor" />,
                                                onClick: () => {
                                                    setAlert(false);
                                                    setOpen(true);
                                                },
                                                style: { marginRight: 4 }
                                            },
                                            {
                                                bsStyle: 'primary',
                                                text: <Message msgId="styleeditor.closeCustomParamsEditor" />,
                                                onClick: () => {
                                                    setValid(true);
                                                    setAlert(false);
                                                    setOpen(false);
                                                }
                                            }
                                        ]}
                                    />
                                </p>
                            </Alert>
                        </div>}
                </div>}
        >
            <Button
                className="square-button-md no-border"
                tooltipId="toc.thematic.goToCfg">
                <Glyphicon
                    glyph="cog"
                />
            </Button>
        </ControlledPopover>
    );
}

export default ClassificationLayerSettings;
