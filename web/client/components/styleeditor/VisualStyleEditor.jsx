/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useReducer, useState } from 'react';
import debounce from 'lodash/debounce';
import identity from 'lodash/identity';

import Toolbar from '../../components/misc/toolbar/Toolbar';
import Loader from '../../components/misc/Loader';
import RulesEditor from '../../components/styleeditor/RulesEditor';

import { getStyleParser } from '../../utils/VectorStyleUtils';
import getBlocks from './config/blocks';

import {
    parseJSONStyle,
    formatJSONStyle
} from '../../utils/StyleEditorUtils';

import undoable from 'redux-undo';

import InfoPopover from '../widgets/widget/InfoPopover';
import Message from '../I18N/Message';

const UPDATE_STYLE = 'UPDATE_STYLE';
const UNDO_STYLE = 'UNDO_STYLE';
const REDO_STYLE = 'REDO_STYLE';

const handlers = {
    [UPDATE_STYLE]: (state, newStyle) => ({
        ...newStyle
    })
};

const reducer = (state, action) => {
    return (handlers[action.type] || identity)(state, action.payload);
};

const historyVisualStyleReducer = undoable(reducer, {
    limit: 20,
    undoType: UNDO_STYLE,
    redoType: REDO_STYLE,
    jumpType: '',
    jumpToPastType: '',
    jumpToFutureType: '',
    clearHistoryType: ''
});

const DEFAULT_STYLE = {};

const updateFunc = ({
    options,
    rules,
    layer,
    styleUpdateTypes = {}
}) => {

    // if there is not a correspondent type simply update the changes in the selected rule
    const updateRules = () => {
        const { values } = options || {};
        return rules.map((rule) => {
            if (rule.ruleId === options.ruleId) {
                return {
                    ...rule,
                    ...values,
                    errorId: undefined
                };
            }
            return rule;
        });
    };

    return new Promise((resolve) => {
        const request = options.type && styleUpdateTypes[options.type];
        return request
            ? resolve(request({ options, rules, layer, updateRules }))
            : resolve(updateRules);
    });
};

function VisualStyleEditor({
    code,
    format,
    layer,
    zoom,
    scales,
    geometryType,
    fonts,
    bands,
    attributes,
    onChange,
    onError,
    defaultStyleJSON,
    config,
    loading,
    error,

    methods,
    getColors,
    styleUpdateTypes
}) {

    const { symbolizerBlock, ruleBlock } = getBlocks(config);
    const [updating, setUpdating] = useState(false);
    const [parserError, setParserError] = useState();
    const [styleHistory, dispacth] = useReducer(historyVisualStyleReducer, {});
    const style = styleHistory?.present || DEFAULT_STYLE;
    const state = useRef();
    state.current = style;

    const init = useRef(false);

    const handleReadStyle = () => {
        const parser = getStyleParser(format);
        if (parser && code && defaultStyleJSON === null) {
            return parser.readStyle(code)
                .then((newStyle) => {
                    dispacth({
                        type: UPDATE_STYLE,
                        payload: formatJSONStyle(newStyle)
                    });
                    init.current = true;
                })
                .catch((err) => setParserError(err && err.message));
        }
        if (parser && code && defaultStyleJSON) {
            init.current = true;
            return dispacth({
                type: UPDATE_STYLE,
                payload: defaultStyleJSON
            });
        }
        if (code && !parser) {
            return  onError({
                messageId: 'styleeditor.formatNotSupported'
            });
        }
        return null;
    };

    useEffect(() => {
        if (!init.current) {
            handleReadStyle();
        }
    }, [code, format, defaultStyleJSON]);

    const handleUpdateStyle = (newRules) => {
        setUpdating(false);
        if (!newRules) {
            return null;
        }
        const newStyle = {
            ...style,
            rules: newRules
        };
        return dispacth({
            type: UPDATE_STYLE,
            payload: newStyle
        });
    };

    const update = useRef();

    useEffect(() => {
        update.current = debounce((options) => {
            setParserError(undefined);
            const parser = getStyleParser(options.format);
            if (parser) {
                parser.writeStyle(parseJSONStyle(options.style))
                    .then((newCode) => {
                        onChange(newCode, options.style);
                    })
                    .catch((err) => setParserError(err && err.message));
            }
        }, 300);
        return () => {
            update.current.cancel();
        };
    }, []);

    useEffect(() => {
        update.current.cancel();
        update.current({
            format,
            style
        });
    }, [JSON.stringify(style)]);

    return (
        <RulesEditor
            loading={updating}
            toolbar={
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border'
                    }}
                    buttons={[
                        {
                            glyph: 'undo',
                            tooltipId: 'styleeditor.undoStyle',
                            disabled: styleHistory?.past?.length === 0,
                            onClick: () => dispacth({ type: UNDO_STYLE })
                        },
                        {
                            disabled: styleHistory?.future?.length === 0,
                            tooltipId: 'styleeditor.redoStyle',
                            glyph: 'redo',
                            onClick: () => dispacth({ type: REDO_STYLE })
                        },
                        {
                            visible: !!(error || parserError),
                            Element: () => <div
                                className="square-button-md"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <InfoPopover
                                    glyph="exclamation-mark"
                                    bsStyle="danger"
                                    placement="right"
                                    title={<Message msgId="styleeditor.validationErrorTitle"/>}
                                    text={<>
                                        <p><Message msgId="styleeditor.genericValidationError"/></p>
                                        <p><Message msgId="styleeditor.incorrectPropertyInputError"/></p>
                                        {error?.line && <p>
                                            <Message msgId="styleeditor.validationError"/>:&nbsp;
                                            {error.message}
                                        </p>}
                                        {parserError && <p>
                                            <Message msgId="styleeditor.validationError"/>:&nbsp;
                                            {parserError}
                                        </p>}
                                    </>}/>
                            </div>
                        },
                        {
                            visible: !!(loading || updating),
                            Element: () =>
                                <div
                                    className="square-button-md"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <Loader size={18} />
                                </div>
                        }
                    ]}
                />
            }
            ruleBlock={ruleBlock}
            symbolizerBlock={symbolizerBlock}
            rules={style?.rules}
            config={{
                geometryType,
                zoom,
                fonts,
                scales,
                bands,
                attributes,
                methods,
                getColors
            }}
            // changes that could need an asynch update
            onUpdate={(options) => {
                setUpdating(true);
                updateFunc({
                    options,
                    layer,
                    rules: state.current.rules,
                    styleUpdateTypes
                })
                    .then(newRules => handleUpdateStyle(newRules))
                    .catch(() => handleUpdateStyle());
            }}
            // changes synchronous updated
            onChange={newRules => handleUpdateStyle(newRules)}
        />
    );
}

export default VisualStyleEditor;
