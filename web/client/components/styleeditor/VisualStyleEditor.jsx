/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
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
    values,
    properties,
    rules,
    layer,
    styleUpdateTypes = {}
}) => {

    // if there is not a correspondent type simply update the changes in the selected rule
    const defaultUpdateRules = () => {
        return rules.map((rule) => {
            if (rule.ruleId === properties.ruleId) {
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
        const request = properties.type && styleUpdateTypes[properties.type];
        return request
            ? resolve(request({ values, properties, rules, layer }))
            : resolve(defaultUpdateRules());
    });
};

function validateStyle(rules) {
    const isStyleEmpty = !rules || rules.length === 0;
    if (isStyleEmpty) {
        return {
            messageId: 'styleeditor.styleEmpty',
            status: 400
        };
    }
    // find first rule with error
    const ruleErrorMessageId = find(rules.map(({ errorId }) => errorId), (errorId) => errorId);
    if (ruleErrorMessageId) {
        return {
            messageId: ruleErrorMessageId,
            status: 400
        };
    }
    // find classification rules without classification entries
    const missingClassification = find(rules, ({ kind, classification }) =>
        (kind === 'Classification' || kind === 'Raster')
        && (!classification || classification.length === 0));
    if (missingClassification) {
        return {
            messageId: 'styleeditor.incompleteClassification',
            status: 400
        };
    }
    // if the image is missing in icon symbolizer is not possible to create the rule
    const emptyImageIconSymbolizer = find(rules, ({ symbolizers = [] }) =>
        find(symbolizers, ({ kind, image }) => kind === 'Icon' && (image === undefined || image === ''))
    );
    if (emptyImageIconSymbolizer) {
        return {
            messageId: 'styleeditor.emptyImageIconSymbolizer',
            status: 400
        };
    }
    return null;
}

/**
 * Visual style editor provides functionality to edit css or sld styles with ui component
 * @memberof components.styleeditor
 * @name VisualStyleEditor
 * @class
 * @prop {string} code body style code of specific encoding
 * @prop {string} format style format: css or sld
 * @prop {node} layer content of floating popover
 * @prop {number} zoom current map zoom
 * @prop {array} scales available scales in map
 * @prop {string} geometryType one of: polygon, line, point, vector or raster
 * @prop {array} fonts list of fonts available for the style (eg ['monospace', 'serif'])
 * @prop {array} bands available bands for raster layers, list of numbers
 * @prop {array} attributes available attributes for vector layers
 * @prop {function} onChange return the new changed style
 * @prop {function} onError return the validation/parsing errors
 * @prop {boolean} loading loading state
 * @prop {object} error error object
 * @prop {function} getColors return colors for available ramps in classification
 * @prop {number} debounceTime debounce time for on change function, default 300
 */
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
    styleUpdateTypes,
    debounceTime
}) {

    const { symbolizerBlock, ruleBlock } = getBlocks(config);
    const [updating, setUpdating] = useState(false);
    const [styleHistory, dispatch] = useReducer(historyVisualStyleReducer, {});
    const style = styleHistory?.present || DEFAULT_STYLE;
    const state = useRef();
    state.current = {
        style
    };

    const init = useRef(false);

    const handleReadStyle = () => {
        const parser = getStyleParser(format);
        if (parser && code && defaultStyleJSON === null) {
            return parser.readStyle(code)
                .then((newStyle) => {
                    dispatch({
                        type: UPDATE_STYLE,
                        payload: formatJSONStyle(newStyle)
                    });
                    init.current = true;
                })
                .catch((err) => onError({
                    ...err,
                    status: 400
                }));
        }
        if (parser && code && defaultStyleJSON) {
            init.current = true;
            return dispatch({
                type: UPDATE_STYLE,
                payload: defaultStyleJSON
            });
        }
        if (code && !parser) {
            return onError({
                messageId: 'styleeditor.formatNotSupported',
                status: 400
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
            ...state.current.style,
            rules: newRules
        };
        return dispatch({
            type: UPDATE_STYLE,
            payload: newStyle
        });
    };

    const update = useRef();

    useEffect(() => {
        update.current = debounce((options) => {
            const styleRules = options?.style?.rules;
            const styleError = validateStyle(styleRules);
            if (styleError) {
                return onError(styleError);
            }
            const parser = getStyleParser(options.format);
            if (parser) {
                return parser.writeStyle(parseJSONStyle(options.style))
                    .then((newCode) => {
                        onChange(newCode, options.style);
                    })
                    .catch((err) => {
                        onError({
                            ...err,
                            status: 400
                        });
                    });
            }
            return null;
        }, debounceTime);
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

    const errorMessage = error && (error.message || error.messageId && <Message msgId={error.messageId}/>);

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
                            onClick: () => dispatch({ type: UNDO_STYLE })
                        },
                        {
                            disabled: styleHistory?.future?.length === 0,
                            tooltipId: 'styleeditor.redoStyle',
                            glyph: 'redo',
                            onClick: () => dispatch({ type: REDO_STYLE })
                        },
                        {
                            visible: !!error,
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
                                        {errorMessage
                                            ? <p>
                                                <Message msgId="styleeditor.validationError"/>:&nbsp;
                                                {errorMessage}
                                            </p>
                                            : <p><Message msgId="styleeditor.incorrectPropertyInputError"/></p>}
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
            // reverse rules order to show top rendered style
            // as first item of the list
            rules={style?.rules && [...style.rules].reverse()}
            // changes synchronous updated
            // reverse the rules to their original order
            onChange={newRules => handleUpdateStyle([...newRules].reverse())}
            // changes that could need an async update
            onUpdate={({ values, ...properties }) => {
                setUpdating(true);
                updateFunc({
                    values,
                    properties,
                    layer,
                    rules: state.current.style.rules,
                    styleUpdateTypes
                })
                    .then(newRules => handleUpdateStyle(newRules))
                    .catch(() => handleUpdateStyle());
            }}
        />
    );
}


VisualStyleEditor.propTypes = {

    code: PropTypes.string,
    format: PropTypes.string,
    layer: PropTypes.object,
    zoom: PropTypes.number,
    scales: PropTypes.array,
    geometryType: PropTypes.string,
    fonts: PropTypes.array,
    bands: PropTypes.array,
    attributes: PropTypes.array,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    defaultStyleJSON: PropTypes.object,
    config: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.object,

    methods: PropTypes.array,
    getColors: PropTypes.func,
    styleUpdateTypes: PropTypes.object,
    debounceTime: PropTypes.number
};

VisualStyleEditor.defaultProps = {
    onChange: () => {},
    onError: () => {},
    config: {},
    getColors: () => {},
    styleUpdateTypes: {},
    debounceTime: 300,
    defaultStyleJSON: null
};

export default VisualStyleEditor;
