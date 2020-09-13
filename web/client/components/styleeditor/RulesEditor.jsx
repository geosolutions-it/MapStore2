/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import find from 'lodash/find';
import { Glyphicon, FormControl as FormControlRB, FormGroup, Button as ButtonRB } from 'react-bootstrap';
import Fields from './Fields';
import uuidv1 from 'uuid/v1';
import Toolbar from '../misc/toolbar/Toolbar';
import { FilterBuilderPopover } from './FilterBuilder';
import { ScaleDenominatorPopover } from './ScaleDenominator';
import Symbolizer, { SymbolizerMenu } from './Symbolizer';
import ClassificationSymbolizer from './ClassificationSymbolizer';
import localizedProps from '../misc/enhancers/localizedProps';
import tooltip from '../misc/enhancers/tooltip';
import Message from '../I18N/Message';
import getBlocks from './config/blocks';
import Rule from './Rule';
import InfoPopover from '../widgets/widget/InfoPopover';

const Button = tooltip(ButtonRB);
const FormControl = localizedProps('placeholder')(FormControlRB);

function EmptyRules() {
    return (
        <div style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <div>
                <Glyphicon glyph="exclamation-mark" style={{ fontSize: 150 }}/>
                <h1><Message msgId="styleeditor.emptyRuleEditorTitle"/></h1>
                <p><Message msgId="styleeditor.emptyRuleEditor"/></p>
            </div>
        </div>);
}

/**
 * RulesEditor rule component
 * @memberof components.styleeditor
 * @name RulesEditor
 * @class
 * @prop {array} rules list of all style rules
 * @prop {bool} loading trigger loading state
 * @prop {node} toolbar left toolbar node
 * @prop {object} config general configuration for rules and symbolizers
 * @prop {sting} config.geometryType one of: polygon, line, point, vector or raster
 * @prop {array} config.attributes available attributes for vector layers
 * @prop {array} config.bands available bands for raster layers, list of numbers
 * @prop {array} config.scales available scales in map
 * @prop {array} config.zoom current map zoom
 * @prop {array} config.fonts list of fonts available for the style (eg ['monospace', 'serif'])
 * @prop {array} config.methods classification methods
 * @prop {function} config.getColors get color ramp available for ramp selector
 * @prop {object} ruleBlock describe all the properties and related configuration of special rules (eg: classification)
 * @prop {object} symbolizerBlock describe all the properties and related configuration of symbolizers
 * @prop {func} onUpdate return changes that needs an async update, argument contains property of the rule to update
 * @prop {func} onChange return all updated rules
 */
const RulesEditor = forwardRef(({
    rules = [],
    loading,
    toolbar,
    config = {},
    ruleBlock = {},
    symbolizerBlock = {},
    onUpdate = () => {},
    onChange = () => {}
}, ref) => {

    const {
        geometryType,
        attributes,
        bands,
        scales,
        zoom,
        fonts,
        methods,
        getColors
    } = config;

    // needed for slider
    // slider usea component should update so value inside onChange was never update
    // with a ref we can get the latest update value
    const state = useRef();
    state.current = {
        rules
    };

    function handleChanges({ values, ruleId, symbolizerId }, updateRule) {
        if (updateRule) {
            const newRules = state.current.rules.map((rule) => {
                if (rule.ruleId === ruleId) {
                    return {
                        ...rule,
                        ...values
                    };
                }
                return rule;
            });

            return onChange(newRules);
        }
        const newRules = state.current.rules.map((rule) => {
            if (!rule.symbolizers) {
                return rule;
            }
            return {
                ...rule,
                symbolizers: rule.symbolizers.map((symbolizer) => {
                    if (symbolizer.symbolizerId === symbolizerId
                    && rule.ruleId === ruleId) {
                        return {
                            ...symbolizer,
                            ...values
                        };
                    }
                    return symbolizer;
                })
            };
        });
        return onChange(newRules);
    }

    function handleAdd(newRule) {
        const newRules = [newRule, ...state.current.rules];
        onChange(newRules);
    }

    function handleRemove(ruleId) {
        const newRules = state.current.rules.filter((rule) => rule.ruleId !== ruleId);
        onChange(newRules);
    }

    function handleReplaceRule({ ruleId, ...options }) {
        const newRules = state.current.rules.map((rule) => {
            if (rule.ruleId === ruleId) {
                return {
                    ruleId,
                    ...options
                };
            }
            return rule;
        });
        return onChange(newRules);
    }

    function handleSortRules(dragIndex, hoverIndex) {
        const dragRule = find(state.current.rules, (rule, idx) => idx === dragIndex);
        const newRules = state.current.rules
            .reduce((acc, rule, idx) => {
                if (idx === dragIndex) {
                    return acc;
                }
                if (idx === hoverIndex) {
                    return dragIndex > hoverIndex
                        ? [ ...acc, dragRule, rule ]
                        : [ ...acc, rule, dragRule ];
                }
                return [...acc, rule];
            }, []);
        return onChange(newRules);
    }

    function checkOrderWarning(rule, index) {
        const { symbolizers = [] } = rule;
        const isTextSymbolizer = !!find(symbolizers, ({ kind }) => kind === 'Text');
        // some renderer engine draws the labels always on top of the other rules
        // so we add a warning to explain that the rule order could not match the rendering order
        return isTextSymbolizer && index > 0;
    }

    return (
        <div
            ref={ref}
            className="ms-style-rules-editor">
            <div className="ms-style-rules-editor-head">
                <div className="ms-style-rules-editor-left">{toolbar}</div>
                <div className="ms-style-rules-editor-right">
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md no-border'
                        }}
                        buttons={[
                            ...Object.keys(symbolizerBlock).map((kind) => {
                                const block = symbolizerBlock[kind];
                                return {
                                    glyph: block.glyphAdd || block.glyph,
                                    visible: block.supportedTypes.indexOf(geometryType) !== -1,
                                    tooltipId: block.tooltipAddId,
                                    onClick: () => handleAdd({
                                        name: '',
                                        ruleId: uuidv1(),
                                        symbolizers: [
                                            {
                                                ...symbolizerBlock[kind].deaultProperties,
                                                symbolizerId: uuidv1()
                                            }
                                        ]
                                    })
                                };
                            }),
                            ...Object.keys(ruleBlock)
                                .filter(kind => ruleBlock[kind].add)
                                .map((kind) => {
                                    const block = ruleBlock[kind];
                                    return {
                                        glyph: block.glyphAdd || block.glyph,
                                        visible: block.supportedTypes.indexOf(geometryType) !== -1,
                                        tooltipId: block.tooltipAddId,
                                        onClick: () => handleAdd({
                                            name: '',
                                            ruleId: uuidv1(),
                                            ...ruleBlock[kind].deaultProperties
                                        })
                                    };
                                })
                        ]}/>
                </div>
            </div>
            <ul className="ms-style-rules-editor-body">
                {rules.length === 0 && <EmptyRules />}
                {rules.map((rule, index) => {
                    const {
                        name,
                        symbolizers = [],
                        filter,
                        scaleDenominator = {},
                        ruleId,
                        kind: ruleKind,
                        errorId: ruleErrorId
                    } = rule;

                    const {
                        params: ruleParams,
                        glyph: ruleGlyph,
                        hideInputLabel,
                        hideFilter,
                        hideScaleDenominator,
                        classificationType
                    } = ruleBlock[ruleKind] || {};
                    return (
                        <Rule
                            // force render if draggable is enabled
                            key={ruleId + (rules.length > 1 ? '_draggable' : '')}
                            draggable={rules.length > 1}
                            id={ruleId}
                            index={index}
                            errorId={ruleErrorId}
                            onSort={handleSortRules}
                            title={
                                hideInputLabel
                                    ? <Message msgId={`styleeditor.rule${ruleKind}`}/>
                                    : <FormGroup
                                        // prevent drag and drop when interacting with property input
                                        onDragStart={(event) => {
                                            event.stopPropagation();
                                            event.preventDefault();
                                        }}
                                        draggable>
                                        <FormControl
                                            value={name}
                                            placeholder="styleeditor.enterLegendLabelPlaceholder"
                                            onChange={event => handleChanges({ values: {
                                                name: event.target.value
                                            }, ruleId }, true)}/>
                                    </FormGroup>
                            }
                            tools={
                                <>
                                {checkOrderWarning(rule, index) && <InfoPopover
                                    glyph="exclamation-mark"
                                    bsStyle="warning"
                                    placement="right"
                                    title={<Message msgId="styleeditor.warningTextOrderTitle"/>}
                                    text={<Message msgId="styleeditor.warningTextOrder"/>}/>}
                                <FilterBuilderPopover
                                    hide={hideFilter}
                                    value={filter}
                                    attributes={attributes}
                                    onChange={(values) => handleChanges({ values, ruleId }, true)}
                                />
                                <ScaleDenominatorPopover
                                    hide={hideScaleDenominator}
                                    value={scaleDenominator}
                                    scales={scales}
                                    zoom={zoom}
                                    onChange={(values) => handleChanges({ values, ruleId }, true)}
                                />
                                <Button
                                    className="square-button-md no-border"
                                    tooltipId="styleeditor.removeRule"
                                    onClick={() => handleRemove(ruleId)}>
                                    <Glyphicon
                                        glyph="trash"
                                    />
                                </Button>
                                </>
                            }
                        >
                            {(ruleKind === 'Classification' || ruleKind === 'Raster')
                                // currrently it uses an if statemant because we have only a custom symbolizers body component
                                // we should use a different approach if custom symbolizers body components increase in number
                                ? <ClassificationSymbolizer
                                    {...rule}
                                    ruleBlock={ruleBlock}
                                    symbolizerBlock={symbolizerBlock}
                                    glyph={ruleGlyph}
                                    classificationType={classificationType}
                                    params={ruleParams}
                                    methods={methods}
                                    getColors={getColors}
                                    bands={bands}
                                    attributes={attributes && attributes.map((attribute) => ({
                                        ...attribute,
                                        disabled: attribute.type !== 'number'
                                    }))}
                                    onUpdate={onUpdate}
                                    onChange={(values) => handleChanges({ values, ruleId }, true)}
                                    onReplace={handleReplaceRule}
                                />
                                : symbolizers.map(({ kind = '', symbolizerId, ...properties }) => {
                                    const { params, glyph } = symbolizerBlock[kind] || {};
                                    return params &&
                                        <Symbolizer
                                            key={symbolizerId}
                                            defaultExpanded
                                            draggable
                                            glyph={glyph}
                                            tools={
                                                <SymbolizerMenu
                                                    hide={kind === 'Icon'}
                                                    symbolizerKind={kind}
                                                    ruleBlock={ruleBlock}
                                                    symbolizerBlock={symbolizerBlock}
                                                    ruleId={ruleId}
                                                    onSelect={handleReplaceRule}
                                                    graphic={properties.graphicFill || properties.graphicStroke}
                                                    channelSelection={properties.channelSelection}
                                                />
                                            }>
                                            <Fields
                                                properties={properties}
                                                params={params}
                                                config={{
                                                    bands,
                                                    attributes,
                                                    fonts
                                                }}
                                                onChange={(values) => handleChanges({ values, ruleId, symbolizerId })}
                                            />
                                        </Symbolizer>;
                                })}
                        </Rule>);
                })}
                {loading && <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        zIndex: 10,
                        transition: '0.3s all'
                    }}>
                </div>}
            </ul>
        </div>
    );
});

const {
    symbolizerBlock: defaultSymbolizerBlock,
    ruleBlock: defaultRuleBlock
} = getBlocks();

RulesEditor.propTypes = {
    rules: PropTypes.array,
    loading: PropTypes.bool,
    toolbar: PropTypes.node,
    config: PropTypes.object,
    ruleBlock: PropTypes.object,
    symbolizerBlock: PropTypes.object,
    onUpdate: PropTypes.func,
    onChange: PropTypes.func
};

RulesEditor.defaultProps = {
    rules: [],
    config: {},
    ruleBlock: defaultRuleBlock,
    symbolizerBlock: defaultSymbolizerBlock,
    onUpdate: () => {},
    onChange: () => {}
};

export default RulesEditor;
