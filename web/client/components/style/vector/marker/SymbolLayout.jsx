/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const Select = require('react-select').default;
const {Row, Col, InputGroup, Glyphicon, Alert } = require('react-bootstrap');
const {isArray, find, filter, isEqual} = require('lodash');
const axios = require('axios');

const Slider = require('../../../misc/Slider');
const Message = require('../../../I18N/Message');
const {DEFAULT_SHAPE, DEFAULT_PATH, checkSymbolsError} = require('../../../../utils/AnnotationsUtils');

/**
 * Styler for the layout of the symbol
*/
class SymbolLayout extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        options: PropTypes.array,
        defaultShape: PropTypes.string,
        defaultShapeSize: PropTypes.number,
        onChange: PropTypes.func,
        onUpdateOptions: PropTypes.func,
        onLoadingError: PropTypes.func,
        symbolErrors: PropTypes.array,
        width: PropTypes.number,
        symbolsPath: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        symbolsPath: DEFAULT_PATH,
        style: {},
        defaultShape: DEFAULT_SHAPE,
        defaultShapeSize: 64,
        options: [],
        symbolErrors: [],
        onChange: () => {},
        onUpdateOptions: () => {}
    };

    UNSAFE_componentWillMount() {
        if (isArray(this.props.options) && this.props.options.length === 0) {
            const shapeDefault = this.props.options && this.props.options.length ? find(this.props.options, (s) => s.value === this.props.defaultShape) && this.props.defaultShape : DEFAULT_SHAPE;
            this.loadSymbolsList(shapeDefault);
        }
        // this.checkSymbolUrl(this.props);
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.style, this.props.style)) {
            this.checkSymbolUrl(newProps);
        }
        if (!isEqual(newProps.symbolErrors, this.props.symbolErrors)) {
            const shapeDefault = this.props.options && this.props.options.length ? find(this.props.options, (s) => s.value === this.props.defaultShape) && this.props.defaultShape : DEFAULT_SHAPE;
            this.loadSymbolsList(shapeDefault);
        }
    }
    render() {
        // maybe we can use the original svg as the preview in the <Select> list
        const iconRenderer = (option) => {
            return (<div style={{ display: "flex", alignItems: "center" }}>
                <img src={option.symbolUrl || option.iconUrl} width={15} height={15} />
                <span style={{ flex: 1, paddingLeft: 4 }}> {option.label}</span></div>);
        };
        // checking if default shape exists
        const shapeDefault = this.props.options && this.props.options.length ? find(this.props.options, (s) => s.value === this.props.defaultShape) && this.props.defaultShape : DEFAULT_SHAPE;
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <Message msgId="draw.marker.layout"/>
                    </Col>
                </Row>
                {   // managing misconfigruation of symbols.json (symbolsPath)
                    checkSymbolsError(this.props.symbolErrors) ? (
                        <Row>
                            <Col xs={6}>
                                <Message msgId="draw.marker.shape"/>
                            </Col>
                            <Col xs={6} style={{ position: "static" }}>
                                <Alert bsStyle="warning">
                                    <Message msgId="annotations.errorLoadingSymbols"/>
                                </Alert>
                            </Col>
                        </Row>
                    ) : (
                        <div>
                            <Row>
                                <Col xs={6}>
                                    <Message msgId="draw.marker.shape"/>
                                </Col>
                                <Col xs={6} style={{ position: "static" }}>
                                    <InputGroup>
                                        <Select
                                            clearable={false}
                                            options={this.props.options}
                                            value={this.props.style.shape}
                                            onChange={(option) => {
                                                const shape = option && option.value;
                                                this.props.onChange(this.props.style.id, {symbolUrl: this.props.symbolsPath + shape + ".svg", shape});
                                            }}
                                            optionRenderer={iconRenderer}
                                            valueRenderer={iconRenderer}
                                        />
                                        <InputGroup.Addon className="btn"
                                            onClick={() => this.loadSymbolsList(shapeDefault)}
                                        >
                                            <Glyphicon glyph="refresh"/>
                                        </InputGroup.Addon>
                                    </InputGroup>
                                </Col>
                            </Row>
                            {
                                !(checkSymbolsError(this.props.symbolErrors, "loading_symbol" + this.props.style.shape) ||
                        checkSymbolsError(this.props.symbolErrors, "loading_symbol" + this.props.defaultShape)) && <Row>
                                    <Col xs={6}>
                                        <Message msgId="draw.marker.size"/>
                                    </Col>
                                    <Col xs={6} style={{ position: "static" }}>
                                        <div className="mapstore-slider with-tooltip">
                                            <Slider tooltips step={1}
                                                start={[this.props.style.size || this.props.defaultShapeSize]}
                                                format={{
                                                    from: value => Math.round(value),
                                                    to: value => Math.round(value) + " px"
                                                }}
                                                range={{ min: 1, max: 64 }}
                                                onChange={(values) => {
                                                    const size = parseInt(values[0].replace(" px", ""), 10);
                                                    this.props.onChange(this.props.style.id, {size});
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>}</div>
                    )}
            </div>
        );
    }

    loadSymbolsList = (shapeDefault) => {
        const symbolsIndex = this.props.symbolsPath + "symbols.json";
        axios.get(symbolsIndex, {"Content-type": "application/json"})
            .then(({data: symbols}) => {
                if (isArray(symbols)) {
                    this.props.onUpdateOptions(
                        symbols.map(s => ({
                            label: s.label || s.name,
                            value: s.name,
                            symbolUrl: this.props.symbolsPath + s.name + ".svg?_t=" + Math.random()
                        })), true
                    );
                } else {
                    this.props.onUpdateOptions(
                        [{
                            label: shapeDefault,
                            value: shapeDefault,
                            symbolUrl: this.props.symbolsPath + shapeDefault + ".svg"
                        }]);
                }
                this.checkSymbolUrl(this.props);
                this.props.onChange(this.props.style.id);
                const errors = this.props.symbolErrors.length ? filter(this.props.symbolErrors, s => s !== "loading_symbols_path") : [];
                this.props.onLoadingError(errors);
            }).catch(() => {
            // manage misconfiguration of symbolsPath
                if (!checkSymbolsError(this.props.symbolErrors)) {
                    this.props.onLoadingError(this.props.symbolErrors.concat(["loading_symbols_path"]));
                }
            });
        this.forceUpdate();
    }

    checkSymbolUrl = ({style, symbolErrors, onLoadingError}) => {
        axios.get(style.symbolUrl)
            .then(() => {
                let errors = symbolErrors.length ? filter(symbolErrors, s => s !== "loading_symbol" + style.shape) : [];
                errors = errors.length ? filter(errors, s => s !== "loading_symbols_path") : [];
                onLoadingError(errors);
            })
            .catch(() => {
                if (!checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape )) {
                    onLoadingError(symbolErrors.concat(["loading_symbol" + style.shape]));
                }
            });
    }
}

module.exports = SymbolLayout;
