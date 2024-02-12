/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, memo } from 'react';
import { Alert, Glyphicon } from 'react-bootstrap';
import { compose, getContext } from 'recompose';
import PropTypes from 'prop-types';

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
 * Component select the wellKnownName property of a Mark symbolizer
 * @memberof components.styleeditor
 * @name ClassificationLayerSettings
 * @prop {string} value well know name or svg link
 * @prop {function} onChange returns the updated value
 * @prop {string} svgSymbolsPath path to symbols list (`index.json` or `symbol.json` endpoint)
 */
function ClassificationLayerSettings({
    onUpdate,
    thematicCustomParams,
    messages
}) {
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
            if (isValid) {

                if (!isEqual(config, thematicCustomParams )) {
                    onUpdate(config);
                }
                onValid(config);
            } else return;
        } catch (e) {
            onError(e);
            setAlert(true);
        }
    };


    return (
        <ControlledPopover
            open={open}
            onClick={() => {
                // info: showing an alert if entered json not valid
                if (isValidJson) setOpen(prev => !prev);
                else setAlert(true);
            }}
            placement={'right'}
            content={
                <div style={{background: 'white', border: 'solid 3px gray'}}>
                    <h4 style={{ margin: '0.5rem'}}>
                        <Message msgId="styleeditor.customParams" />
                    </h4>
                    <div style={{
                        position: 'relative',
                        width: '450px',
                        background: 'white'
                    }}>
                        <JSONEditor json={thematicCustomParams?.params ? thematicCustomParams : INITIAL_CODE_VALUE} editorWillUnmount={saveChanges} onValid={onValid} onError={onError} />
                        {alert &&
                        <div
                            className="ms-style-editor-alert"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 16,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                            }}>
                            <Alert bsStyle="warning" style={{ textAlign: 'center' }}>
                                <p style={{ padding: 8 }}><Message msgId="styleeditor.alertCustomParamsNotValid" /></p>
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
                                                    setOpen(false);
                                                    setValid(true);
                                                    setAlert(false);
                                                }
                                            }
                                        ]}
                                    />
                                </p>
                            </Alert>
                        </div>}
                    </div>
                </div>}
        >
            <Button
                className="square-button-md no-border"
                tooltipId="toc.thematic.go_to_cfg">
                <Glyphicon
                    glyph="cog"
                />
            </Button>
        </ControlledPopover>
    );
}

export default  compose(getContext({
    messages: PropTypes.object
}))(memo(ClassificationLayerSettings));
