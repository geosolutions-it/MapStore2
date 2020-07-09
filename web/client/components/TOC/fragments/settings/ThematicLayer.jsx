/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');
const { ControlLabel, FormGroup, Row, Col, Grid, Alert, Checkbox} = require('react-bootstrap');
const { isObject, isEqual} = require('lodash');
const Combobox = require('react-widgets').Combobox;
const assign = require('object-assign');
const Message = require('../../../I18N/Message');
const SwitchPanel = require('../../../misc/switch/SwitchPanel');
const ColorRamp = require('../../../styleeditor/ColorRamp').default;

const {Controlled: Codemirror} = require('react-codemirror2');
const {NumberPicker} = require('react-widgets');
require('codemirror/lib/codemirror.css');

require('codemirror/mode/javascript/javascript');

const { getMessageById } = require('../../../../utils/LocaleUtils');
const tinycolor = require('tinycolor2');
const ColorPicker = require('../../../style/ColorPicker').default;
const LoadingView = require('../../../misc/LoadingView');
const ThemaClassesEditor = require('../../../style/ThemaClassesEditor');

const internalProperties = { current: undefined, unconfigured: undefined, applied: undefined };

/**
 * Component for rendering a UI to dinamically style layers through attribute classification.
 * It can be used on layers that have a **thematic** property in their configuration.
 * A JSON editor is available to create the property on new layers (only if canEditThematic = true).
 *
 * Some parameters are fixed:
 *  - thema attribute
 *  - classification method
 *  - number of classes
 *  - border style
 *  - colors palette
 *
 * Some are configurable on a layer by layer basis:
 *  - additional parameters / filters
 *
 * An external service (a collection of functions / actions) is used to get metadata and build classification.
 *
 * The syntax for the configuration JSON depends on the service used.
 * @memberof components.TOC
 * @name ThematicLayer
 * @class
 * @prop {boolean} enableRemoveStyle, enables the remove style button (disabled by default)
 * @prop {object} layer, current selected layer the UI acts upon
 * @prop {boolean} canEditThematic the user can change the thematic base configuration (admins functionality) for the layer
 * @prop {boolean} applyEnabled enables the apply button
 * @prop {array} colors list of base color palettes the user can choose to create the style (they can be extended via
 *    layer configuration)
 * @prop {array} methods list of classification methods the user can choose to create the style
 * @prop {array} fields list of fields the user can choose to create a classification style on
 * @prop {object} fieldsLoading fields list can be externally loaded, this object tracks the loading status (loading / loaded and errors)
 * @prop {array} classification list of classes (range and color) for the current classification style
 * @prop {object} classificationLoading classes list can be externally loaded, this object tracks the loading status (loading / loaded and errors)
 * @prop {number} colorSamples number of samples to show in the color palette list
 * @prop {number} maxClasses number of classes (range + color) the user can choose for the style
 * @prop {object} initialParams object with initial/default values for the style parameters in the UI
 * @prop {object} invalidInputs current validation errors on user input, key is input and value is {error_message, params}
 * @prop {object} adminCfg current thema configuration object, contains:
 *  - open: true / false, status of the admin configuration panel
 *  - current: string version of the current configuration, as edited by the admin user
 *  - error: validation error(s), if any
 * @prop {function} onChange action called for every style parameter change
 * @prop {function} onChangeConfiguration action called for every thematic configuration change
 * @prop {function} onSwitchLayer action called when the selected layer changes
 * @prop {function} onClassify action called to update classify criterias and recalculate classification
 * @prop {function} onApplyStyle action called to apply the style to the selected layer
 * @prop {function} onDirtyStyle action called when the user changes style parameters (before applying them)
 * @prop {function} onInvalidInput action called when the user enters an invalid input
 * @prop {function} onValidInput action called when the user enters a valid input
 * @prop {function} getStyleParameters external service that returns layer additional parameters to build the thema, receiving
 *     the layer node and the current style parameters fetched from the UI
 * @prop {function} getThematicParameters returns a list of by layer parameters that are added to the UI (filters, etc.)
 * @prop {function} getMetadataParameters returns the actual values for by layer parameters to be used for styling
 * @prop {function} getColors external service that returns the actual list of color palettes (base palettes and/or by layer palettes)
 * @prop {function} hasThematicStyle external service that checks if the current layer has a thematic style applied on it
 * @prop {function} removeThematicStyle external service that removes thematic style on the current layer
 */
class ThematicLayer extends React.Component {
    static propTypes = {
        layer: PropTypes.object,
        onChange: PropTypes.func,
        onChangeConfiguration: PropTypes.func,
        onSwitchLayer: PropTypes.func,
        onApplyStyle: PropTypes.func,
        onClassify: PropTypes.func,
        onDirtyStyle: PropTypes.func,
        onInvalidInput: PropTypes.func,
        onValidInput: PropTypes.func,
        getStyleParameters: PropTypes.func,
        getThematicParameters: PropTypes.func,
        getMetadataParameters: PropTypes.func,
        getColors: PropTypes.func,
        hasThematicStyle: PropTypes.func,
        removeThematicStyle: PropTypes.func,
        colors: PropTypes.array,
        fields: PropTypes.array,
        fieldsLoading: PropTypes.object,
        classification: PropTypes.array,
        classificationLoading: PropTypes.object,
        initialParams: PropTypes.object,
        methods: PropTypes.array,
        canEditThematic: PropTypes.bool,
        colorSamples: PropTypes.number,
        maxClasses: PropTypes.number,
        loaderSize: PropTypes.number,
        adminCfg: PropTypes.object,
        enableRemoveStyle: PropTypes.bool,
        applyEnabled: PropTypes.bool,
        invalidInputs: PropTypes.object,
        geometryType: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onChange: () => { },
        onChangeConfiguration: () => { },
        onInvalidInput: () => { },
        onValidInput: () => { },
        getStyleParameters: () => { },
        getThematicParameters: (params) => params,
        getMetadataParameters: () => { },
        hasThematicStyle: () => { },
        removeThematicStyle: () => { },
        getColors: (colors) => colors,
        onSwitchLayer: () => { },
        onClassify: () => { },
        onApplyStyle: () => { },
        onDirtyStyle: () => { },
        canEditThematic: false,
        fieldsLoading: {
            status: false,
            error: null
        },
        classificationLoading: {
            status: false,
            error: null
        },
        initialParams: {},
        colorSamples: 5,
        maxClasses: 15,
        loaderSize: 100,
        adminCfg: {
            open: false,
            current: null,
            error: null
        },
        enableRemoveStyle: false,
        applyEnabled: false,
        invalidInputs: {},
        geometryType: 'Polygon'
    };

    UNSAFE_componentWillMount() {
        if (this.props.layer) {
            // configure cfg editor
            this.props.onChangeConfiguration(
                this.props.layer,
                false,
                JSON.stringify(assign({}, this.props.layer.thematic, internalProperties), null, 4)
            );
            if (this.hasConfiguration()) {
                this.switchLayer(this.props.layer);
            } else {
                this.applyCfg('{}');
            }
            this.checkInitialStyle(this.props);
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.layer && (!this.props.layer || (newProps.layer.id !== this.props.layer.id))) {
            this.switchLayer(newProps.layer);
        }
        if (newProps.fields && newProps.fields.length && !isEqual(newProps.fields, this.props.fields)) {
            // set actual field value or first field in combobox on fields loading
            const fieldValue = newProps.layer.thematic.applied && newProps.layer.thematic.applied.field ||
                newProps.fields[0].name;
            this.updateStyle('field', fieldValue, true);
        }
        this.checkInitialStyle(newProps);
    }

    getCurrentThema = (thematic) => {
        // get current thematic style when configuration changes
        // add an attribute for every layer param
        const newParams = this.props.getThematicParameters(thematic.params || []).reduce((previous, param) => {
            return assign(previous, {
                [param.field]: param.defaultValue
            });
        }, {});
        // apply base initial parameters, layer params and current style (if any)
        return assign({}, this.props.initialParams, {
            attribute: thematic.attribute || ''
        }, newParams, thematic.applied);
    };

    getClassification = () => {
        return this.props.layer.thematic.current.classification || this.props.classification || [];
    };

    getValue = (v) => {
        return !isObject(v) && v || v.value || v.name;
    };

    getColors = () => {
        const colors = this.props.getColors(this.props.colors, this.props.layer, this.props.colorSamples);
        if (colors) {
            return colors.map(({name, ...c}) => ({
                label: `global.colors.${name}`,
                name,
                ...c
            }));
        }
        return [];
    };

    renderError = (error, type) => {
        return (<Alert bsStyle="danger">
            <Message msgId={'toc.thematic.' + type} msgParams={{
                message: this.localizedItem(error.message, '')
            }}/>
        </Alert>);
    };

    renderInputError = (input) => {
        const error = this.props.invalidInputs[input];
        return error ? (<Alert bsStyle="danger">
            <Message msgId={error.message} msgParams={error.params || {}} />
        </Alert>) : null;
    };

    renderThemaPanel = (thema) => {
        return (
            <Row>
                <Col xs={12}>
                    <SwitchPanel
                        expanded
                        locked
                        title={this.localizedItem('toc.thematic.data_panel', '')}
                        buttons={[{
                            glyph: 'cog',
                            tooltip: this.localizedItem('toc.thematic.go_to_cfg', ''),
                            visible: this.props.canEditThematic,
                            onClick: this.toggleCfg
                        }]}
                    >
                        <Grid fluid>
                            <Row>
                                {this.props.layer.thematic.params && this.props.layer.thematic.params.length ? this.renderParams(thema) : null}

                                <Col xs={12}>
                                    <FormGroup>
                                        <Col xs={6}><ControlLabel><Message msgId="toc.thematic.classification_field" /></ControlLabel></Col>
                                        <Col xs={6}><Combobox
                                            disabled={this.hasCustomClassification()}
                                            busy={this.props.fieldsLoading.status}
                                            data={this.props.fields}
                                            textField="name"
                                            valueField="name"
                                            value={thema.field}
                                            onChange={(v) => this.updateStyle("field", this.getValue(v))}/></Col>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row><Col xs={12}>
                                {this.props.fieldsLoading.error ? this.renderError(this.props.fieldsLoading.error, 'fields_error') : null}
                            </Col></Row>
                        </Grid>
                    </SwitchPanel>
                </Col>,
                <Col xs={12}>
                    <SwitchPanel
                        expanded
                        locked
                        title={<Message msgId="toc.thematic.classify" />}
                        buttons={[{
                            glyph: 'trash',
                            tooltip: this.localizedItem("toc.thematic.remove", ""),
                            onClick: this.removeStyle,
                            visible: this.props.enableRemoveStyle && this.props.hasThematicStyle(this.props.layer)
                        }, {
                            glyph: 'undo',
                            tooltip: this.localizedItem("toc.thematic.restore", ""),
                            onClick: this.restoreStyle,
                            visible: this.hasCustomClassification()
                        }, {
                            glyph: 'ok',
                            disabled: !this.props.applyEnabled || Object.keys(this.props.invalidInputs).length > 0,
                            tooltip: this.localizedItem("toc.thematic.apply", ""),
                            onClick: () => this.applyStyle(this.props.layer)
                        }]}
                    >
                        <Grid fluid><Row>
                            <Col xs={12}>
                                <FormGroup>
                                    <Col xs={6}><ControlLabel><Message msgId="toc.thematic.classification_method" /></ControlLabel></Col>
                                    <Col xs={6}><Combobox
                                        disabled={this.hasCustomClassification()}
                                        data={this.props.methods}
                                        textField={this.localizedItem}
                                        defaultValue={thema.method}
                                        onSelect={(v) => this.updateStyle("method", this.getValue(v))}
                                    /></Col>
                                </FormGroup>
                            </Col>
                            <Col xs={12}>
                                <FormGroup>
                                    <Col xs={6}><ControlLabel><Message msgId="toc.thematic.classification_intervals" /></ControlLabel></Col>
                                    <Col xs={6}><NumberPicker
                                        disabled={this.hasCustomClassification()}
                                        value={thema.intervals}
                                        onChange={(value) => { this.updateStyle("intervals", this.constrainIntervals(this.getValue(value))); }}
                                    /></Col>
                                </FormGroup>
                                {this.renderInputError('intervals')}
                            </Col>
                            <Col xs={12}>
                                <FormGroup>
                                    <Col xs={6}><ControlLabel><Message msgId="toc.thematic.classification_colors" /></ControlLabel></Col>
                                    <Col xs={6}>
                                        <ColorRamp items={this.getColors()} rampFunction={this.createRamp} value={{
                                            name: thema.ramp
                                        }}
                                        disabled={this.hasCustomClassification()}
                                        samples={5}
                                        onChange={(ramp) => {
                                            this.updateStyle("ramp", this.getValue(ramp));
                                        }} />
                                    </Col>
                                </FormGroup>
                            </Col>
                            {this.props.geometryType !== 'LineString' ? <Col xs={12}>
                                <FormGroup>
                                    <Col xs={6}><ControlLabel><Message msgId="toc.thematic.classification_stroke" /></ControlLabel></Col>
                                    <Col xs={1}>
                                        <Checkbox checked={thema.strokeOn}
                                            onChange={(evt) => this.updateStyle('strokeOn', evt.target.checked)} />
                                    </Col>
                                    <Col xs={2}><ColorPicker key="strokeColor"
                                        pickerProps={{ disableAlpha: true }}
                                        disabled={!thema.strokeOn}
                                        text={thema.strokeColor} value={{ ...tinycolor(thema.strokeColor).toRgb(), a: 100 }}
                                        onChangeColor={this.updateStrokeColor}
                                    /></Col>
                                    <Col xs={3}><NumberPicker key="strokeWeight"
                                        disabled={!thema.strokeOn}
                                        format="- ###.###"
                                        value={thema.strokeWeight}
                                        onChange={this.updateStrokeWeight}
                                    /></Col>
                                </FormGroup>
                            </Col> : null}
                        </Row>
                        <Row><Col xs={12}>
                            {this.props.classificationLoading.status ? <LoadingView width={this.props.loaderSize} height={this.props.loaderSize}/> : null}
                            {this.renderInputError('classification')}
                            <ThemaClassesEditor className={this.props.classificationLoading.status ? "loading" : ""} classification={this.getClassification()} onUpdateClasses={this.updateClassification}/>
                            {this.props.classificationLoading.error ? this.renderError(this.props.classificationLoading.error, 'classification_error') : null}
                        </Col></Row>
                        </Grid>
                    </SwitchPanel>
                </Col>
            </Row>);
    };

    renderConfigurationEditor = () => {
        const isValid = this.isConfigurationValid();
        return (
            <Row>
                <Col xs={12}>
                    <SwitchPanel
                        expanded
                        locked
                        title={<Message msgId="toc.thematic.configuration" />}
                        buttons={[{
                            glyph: 'arrow-right',
                            tooltip: this.localizedItem("toc.thematic.go_to_thema", ""),
                            onClick: () => this.applyCfg(this.props.adminCfg.current),
                            visible: isValid
                        }, {
                            glyph: 'exclamation-mark',
                            tooltip: this.localizedItem("toc.thematic.cfgError", ""),
                            glyphClassName: "text-danger",
                            visible: !isValid
                        }]}
                    >
                        <Codemirror ref={(cmp) => {this.cfgEditor = cmp; }} style={{ width: '500px' }} key="code-mirror" value={this.props.adminCfg.current} onBeforeChange={this.updateCfg} options={{
                            theme: "midnight",
                            mode: { name: "javascript" },
                            lineNumbers: true
                        }} />
                    </SwitchPanel>
                </Col>
            </Row>
        );
    };

    renderParams = (thema) => {
        return this.props.getThematicParameters(this.props.layer.thematic.params).map((param) => {
            return (
                <Col xs={12}>
                    <FormGroup>
                        <Col xs={6}><ControlLabel>{this.localizedItem(param.title, "")}</ControlLabel></Col>
                        <Col xs={6}><Combobox
                            data={param.values}
                            textField={(item) => this.localizedItem(item.name, "")}
                            valueField="value"
                            value={thema[param.field]}
                            onSelect={(v) => this.updateStyle(param.field, this.getValue(v))}
                        /></Col>
                    </FormGroup>
                </Col>
            );
        });
    };

    render() {
        const thema = this.props.layer && this.props.layer.thematic && this.props.layer.thematic.current;
        return (<Grid fluid className="thematic_layer">
            {this.props.canEditThematic && this.props.adminCfg.open ? this.renderConfigurationEditor() : null}
            {this.hasConfiguration() && !this.props.adminCfg.open && thema ? this.renderThemaPanel(thema) : null}
        </Grid>);
    }

    constrainIntervals = (intervals) => {
        if (isNaN(intervals) || intervals < 2 || intervals > this.props.maxClasses) {
            this.props.onInvalidInput('intervals', 'toc.thematic.interval_limit', {min: 2, max: this.props.maxClasses});
        } else {
            this.props.onValidInput('intervals');
        }
        return intervals;
    };

    checkInitialStyle = (props) => {
        const thematic = props.layer.thematic;
        if (!props.hasThematicStyle(props.layer) && thematic &&
                !thematic.unconfigured && thematic.current && thematic.current.field && props.classification
                && props.classification.length) {
            this.applyStyle(props.layer);
        }
    };

    hasConfiguration = () => {
        return this.props.layer.thematic && !this.props.layer.thematic.unconfigured;
    };

    updateStrokeColor = (color) => {
        if (color) {
            this.updateStyle('strokeColor', tinycolor(color).toHexString());
        }
    };

    updateStrokeWeight = (weight) => {
        this.updateStyle('strokeWeight', weight);
    };

    hasCustomClassification = () => {
        return !!this.props.layer.thematic.current.classification;
    };

    removeStyle = () => {
        const layer = this.props.layer;
        const newParams = this.props.removeThematicStyle(layer.params);
        this.props.onChange({
            params: newParams,
            thematic: assign({}, layer.thematic, {
                applied: assign({}, layer.thematic.current)
            })
        });
    };

    updateClassification = (classification) => {
        this.props.onChange('thematic', assign({}, this.props.layer.thematic, {
            current: assign({}, this.props.layer.thematic.current, {
                classification
            })
        }));
        if (!this.validClassification(classification)) {
            this.props.onInvalidInput('classification', 'toc.thematic.invalid_classes');
        } else {
            this.props.onValidInput('classification');
        }
        this.props.onDirtyStyle();
    };

    validClassification = (classification = []) => {
        return !classification.reduce((previous, current) => {
            return previous || (current.max < current.min);
        }, false);
    };

    createRamp = (item) => item.colors;

    isConfigurationValid = () => {
        try {
            JSON.parse(this.props.adminCfg.current);
            return true;
        } catch (e) {
            return false;
        }
    };

    applyCfg = (cfg) => {
        try {
            const thematic = JSON.parse(cfg);
            const newThema = assign({}, thematic, {
                current: this.getCurrentThema(thematic),
                unconfigured: false
            });
            this.props.onChange('thematic', newThema);
            this.props.onSwitchLayer(assign({}, this.props.layer, {
                thematic: newThema
            }));
            this.props.onChangeConfiguration(this.props.layer, false, cfg);
        } catch (e) {
            this.props.onChangeConfiguration(this.props.layer, true, cfg, e.message);
        }
    };

    updateCfg = (editor, data, newCfg) => {
        this.props.onChangeConfiguration(this.props.layer, true, newCfg);
    };

    toggleCfg = () => {
        this.props.onChangeConfiguration(this.props.layer, !this.props.adminCfg.open, this.props.adminCfg.current);
    };

    localizedItem = (item, prefix = "toc.thematic.values.") => {
        return getMessageById(this.context.messages, prefix + item);
    }

    switchLayer = (layer) => {
        if (layer.thematic) {
            const newCurrent = this.getCurrentThema(layer.thematic);
            this.props.onChange('thematic', assign({}, layer.thematic, {
                current: newCurrent
            }));
        }
        this.props.onSwitchLayer(layer);
    };

    restoreStyle = () => {
        const layer = assign({}, this.props.layer, {
            thematic: assign({}, this.props.layer.thematic, {
                current: assign({}, this.props.layer.thematic.current, {
                    classification: null
                })
            })
        });
        this.updateStyle('classification', null, true);
        this.applyStyle(layer);
    };

    applyStyle = (layer) => {
        const newParams = assign({}, layer.params, this.props.getStyleParameters(layer, layer.thematic.current));
        this.props.onChange({
            params: newParams,
            thematic: assign({}, layer.thematic, {
                applied: assign({}, layer.thematic.current)
            })
        });
        this.props.onApplyStyle();
    };
    needsToUpdateClassification = (key) => {
        return (!this.hasCustomClassification() && ['strokeOn', 'strokeColor', 'strokeWeight'].indexOf(key) === -1) ||
        (key === 'classification');
    };
    updateStyle = (key, value, quiet) => {
        const layer = this.props.layer;
        const currentStyle = assign({}, layer.thematic.current, {
            [key]: value
        });
        const newThema = assign({}, layer.thematic, {
            current: currentStyle
        });
        this.props.onChange('thematic', newThema);
        if (this.needsToUpdateClassification(key)) {
            const newParams = assign({}, this.props.getMetadataParameters(layer, currentStyle));
            this.props.onClassify(assign({}, layer, {
                thematic: newThema
            }), newParams);
        }
        if (!quiet) {
            this.props.onDirtyStyle();
        }
    };
}

module.exports = ThematicLayer;
