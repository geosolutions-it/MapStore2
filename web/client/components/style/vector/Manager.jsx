/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {castArray, findIndex, find, isNil} = require('lodash');
const {Grid} = require('react-bootstrap');
const assign = require('object-assign');
const uuidv1 = require('uuid/v1');
const tinycolor = require("tinycolor2");

const SwitchPanel = require('../../misc/switch/SwitchPanel');
const {arrayUpdate} = require('../../../utils/ImmutableUtils');
const StyleCanvas = require('../StyleCanvas');
const Stroke = require('./Stroke');
const Fill = require('./Fill');
const MarkerGlyph = require('./marker/MarkerGlyph');
const MarkerType = require('./marker/MarkerType');
const SymbolLayout = require('./marker/SymbolLayout');
const Text = require('./Text');

const {
    createSvgUrl, registerStyle, hashAndStringify, fetchStyle, getStylerTitle, isSymbolStyle, isMarkerStyle, isStrokeStyle, isFillStyle, addOpacityToColor, isTextStyle
} = require('../../../utils/VectorStyleUtils');

/***/
class Manager extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        switchPanelOptions: PropTypes.array,
        lineDashOptions: PropTypes.array,
        onChangeStyle: PropTypes.func,
        pointType: PropTypes.string,
        onChangePointType: PropTypes.func,
        onUpdateSymbols: PropTypes.func,
        width: PropTypes.number,
        symbolsPath: PropTypes.string,
        symbolList: PropTypes.array,
        defaultSymbol: PropTypes.object,
        defaultMarker: PropTypes.object,
        markersOptions: PropTypes.object
    };

    static defaultProps = {
        style: {},
        defaultSymbol: {
            symbolUrl: "product/assets/symbols/stop-hexagonal-signal.svg",
            iconAnchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            color: "#000000",
            fillColor: "#000000",
            opacity: 1,
            size: 64,
            shape: "stop-hexagonal-signal",
            fillOpacity: 1
        },
        defaultMarker: {
            iconGlyph: 'comment',
            iconShape: 'square',
            iconColor: 'blue'
        },
        onChangeStyle: () => {},
        onChangePointType: () => {},
        onUpdateSymbols: () => {},
        switchPanelOptions: []
    };

    state = {}


    componentWillMount() {
        const styles = castArray(this.props.style);
        const expanded = styles.map((s, i) => i === 0 || s.filtering );
        const locked = styles.map((s, i) => i === 0 );
        this.setState({expanded, locked});
    }
    /**
     * it renders a switch panel styler
     * @prop {object} style
     * @prop {object} switchPanelOptions
    */
    renderPanelStyle = (style = {}, switchPanelOptions = {}, i) => {
        const stylerProps = {
            style,
            onChange: this.change,
            width: this.props.width
        };

        /*getting pieces to render in the styler*/
        // only for marker there is no preview
        const preview = !isMarkerStyle(style) && (<div className="ms-marker-preview" style={{display: 'flex', width: '100%', height: 90}}>
            <StyleCanvas style={{ padding: 0, margin: "auto", display: "block"}}
                originalStyle={style}
                shapeStyle={assign({}, style, {
                    color: addOpacityToColor(tinycolor(style.color).toRgb(), isNil(style.opacity) ? 1 : style.opacity),
                    fill: addOpacityToColor(tinycolor(style.fillColor || "#FFCC33").toRgb(), isNil(style.fillOpacity) ? 1 : style.fillOpacity),
                    radius: 75
                })}
                geomType={getStylerTitle(style)}
                width={isTextStyle(style) ? 600 : 90}
                height={90}
            />
        </div>);
        const stroke = isStrokeStyle(style) ? <Stroke {...stylerProps} lineDashOptions={this.props.lineDashOptions} key={"stroke" + i}/> : null;
        const fill = isFillStyle(style) && <Fill {...stylerProps} key={"fill" + i}/> || null;
        const text = isTextStyle(style) && <Text {...stylerProps} /> || null;
        const markerType = (isMarkerStyle(style) || isSymbolStyle(style)) && <MarkerType {...stylerProps} pointType={isSymbolStyle(style) ? "symbol" : "marker"} onChangeType={this.changeSymbolType}/> || null;
        const markerGlyph = isMarkerStyle(style) && <MarkerGlyph {...stylerProps} markersOptions={this.props.markersOptions}/> || null;
        const symbolLayout = isSymbolStyle(style) && <SymbolLayout {...stylerProps} symbolsPath={this.props.symbolsPath} onUpdateOptions={this.props.onUpdateSymbols} options={this.props.symbolList}/> || null;
        const separator = <hr/>;

        const sections = [markerType, preview, symbolLayout, markerGlyph, text, fill, stroke];

        return (<Grid fluid style={{ width: '100%' }} className="ms-style" key={"grid" + i}>
            <SwitchPanel {...switchPanelOptions} key={"switchPanel" + i}>
                {
                    /*adding the separator between sections*/
                    sections.reduce((prev, curr, k) => [prev, prev && curr && <span key={"separator" + k}>{separator}</span>, curr])
                }
            </SwitchPanel>
        </Grid>);
    }

    render() {
        const styles = castArray(this.props.style);
        return (<span>{styles.map((style, i) => this.renderPanelStyle(
            {...style, id: style.id || uuidv1()},
            {
                expanded: this.state.expanded[i],
                locked: this.state.locked[i],
                onSwitch: () => {
                    this.setState(() => {
                        const expanded = this.state.expanded.map((e, k) => i === k ? !this.state.expanded[i] : this.state.expanded[k]);
                        return {expanded};
                    });
                    let newStyles = styles.map((s, k) => k === i ? {...s, "filtering": !this.state.expanded[i]} : s);
                    this.props.onChangeStyle(newStyles);
                },
                title: style.title || getStylerTitle(style) + " Style"},
             i))}</span>);
    }
    change = (id, values) => {
        const styles = castArray(this.props.style);
        let styleChanged = {...find(styles, { 'id': id }), ...values};

        if (isSymbolStyle(styleChanged)) {
            if (!fetchStyle(hashAndStringify(styleChanged))) {
                createSvgUrl(styleChanged, styleChanged.symbolUrl)
                    .then(symbolUrlCustomized => {
                        this.updateStyles(id, {...styleChanged, symbolUrlCustomized}, styles, true);
                    });
            } else {
                this.updateStyles(id, fetchStyle(hashAndStringify(styleChanged)), styles, true);
            }
        } else {
            this.updateStyles(id, styleChanged, styles, true);
        }

        // TODO handle if id is missing
    }
    updateStyles = (id, style, styles, register = true) => {
        if (register) {
            registerStyle(hashAndStringify(style), style);
        }
        let newStyles = arrayUpdate(false, style, { 'id': id }, styles );
        this.props.onChangeStyle(newStyles);
    }
    changeSymbolType = (id, pointType) => {
        const pointStyle = pointType === "symbol" ? this.props.defaultSymbol : this.props.defaultMarker;
        const styles = castArray(this.props.style);
        const styleChangedIndex = findIndex(styles, { 'id': id});
        if (styleChangedIndex !== -1) {
            let newStyles = styles.map((s, k) => k === styleChangedIndex ? {...pointStyle, id: s.id, title: s.title, geometry: s.geometry, filtering: s.filtering} : s);
            this.props.onChangeStyle(newStyles);
            this.props.onChangePointType(pointType);
        }
    }
}

module.exports = Manager;
