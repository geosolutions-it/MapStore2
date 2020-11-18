/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import axios from 'axios';
import { castArray, filter, find, findIndex, isNil } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Grid } from 'react-bootstrap';
import tinycolor from 'tinycolor2';
import uuidv1 from 'uuid/v1';

import { DEFAULT_PATH, DEFAULT_SHAPE, checkSymbolsError } from '../../../utils/AnnotationsUtils';
import { arrayUpdate } from '../../../utils/ImmutableUtils';
import {
    addOpacityToColor,
    createSvgUrl,
    fetchStyle,
    getStylerTitle,
    hashAndStringify,
    isFillStyle,
    isMarkerStyle,
    isStrokeStyle,
    isSymbolStyle,
    isTextStyle,
    registerStyle
} from '../../../utils/VectorStyleUtils';
import SwitchPanel from '../../misc/switch/SwitchPanel';
import StyleCanvas from '../StyleCanvas';
import Fill from './Fill';
import MarkerGlyph from './marker/MarkerGlyph';
import MarkerType from './marker/MarkerType';
import SymbolLayout from './marker/SymbolLayout';
import Stroke from './Stroke';
import Text from './Text';

class Manager extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        switchPanelOptions: PropTypes.array,
        lineDashOptions: PropTypes.array,
        onChangeStyle: PropTypes.func,
        pointType: PropTypes.string,
        onUpdateSymbols: PropTypes.func,
        onSetErrorSymbol: PropTypes.func,
        width: PropTypes.number,
        symbolsPath: PropTypes.string,
        defaultShape: PropTypes.string,
        defaultShapeSize: PropTypes.number,
        defaultShapeFillColor: PropTypes.string,
        defaultShapeStrokeColor: PropTypes.string,
        defaultStyles: PropTypes.object,
        symbolList: PropTypes.array,
        symbolErrors: PropTypes.array,
        defaultSymbol: PropTypes.object,
        defaultMarker: PropTypes.object,
        markersOptions: PropTypes.object,
        textRotationStep: PropTypes.number
    };

    static defaultProps = {
        style: {},
        defaultShape: DEFAULT_SHAPE,
        symbolsPath: DEFAULT_PATH,
        defaultShapeSize: 64,
        defaultShapeFillColor: '#000000',
        defaultShapeStrokeColor: '#000000',
        symbolErrors: [],
        onChangeStyle: () => {},
        onUpdateSymbols: () => {},
        defaultStyles: {},
        switchPanelOptions: []
    };

    state = {}


    UNSAFE_componentWillMount() {
        // we assume that the default symbols shape is correctly configured

        const styles = castArray(this.props.style);
        const expanded = styles.map((s, i) => i === 0 || s.filtering );
        const locked = styles.map((s, i) => i === 0 );
        this.setState({expanded, locked});
        styles.forEach(style => {
            this.checkSymbolUrl({...this.props, style});
        });
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

        /* getting pieces to render in the styler
        // only for marker there is no preview
        // TODO move into separate functions the checks for showing the various pieces of styler
        */
        const isTextOrSymbol = isTextStyle(style) || isSymbolStyle(style);
        const preview = !(isMarkerStyle(style) || isSymbolStyle(style) && (checkSymbolsError(this.props.symbolErrors) ||
         checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape))) && (<div className="ms-marker-preview" style={{display: 'flex', width: '100%', height: 90}}>
            <StyleCanvas style={{ padding: 0, margin: "auto", display: "block",
                width: isTextOrSymbol ? "100%" : "auto", ...(isTextOrSymbol && {transform: "scaleX(2.2) scaleY(2.5)"})}}
            originalStyle={style}
            shapeStyle={assign({}, style, {
                color: addOpacityToColor(tinycolor(style.color).toRgb(), isNil(style.opacity) ? 1 : style.opacity),
                fill: addOpacityToColor(tinycolor(style.fillColor || "#FFCC33").toRgb(), isNil(style.fillOpacity) ? 1 : style.fillOpacity),
                radius: 75
            })}
            geomType={getStylerTitle(style)}
            width={isTextOrSymbol ? 600 : 90}
            height={120}
            />
        </div>);
        // TODO  improve conditions to show the stroke and fill
        const stroke = isStrokeStyle(style) && isSymbolStyle(style) &&
            (checkSymbolsError(this.props.symbolErrors) ||
             checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape))
            ? null : isStrokeStyle(style) ? <Stroke {...stylerProps} defaultColor={this.props.defaultShapeStrokeColor} lineDashOptions={this.props.lineDashOptions} constraints={{maxWidth: isSymbolStyle(style) ? 5 : 15}} key={"stroke" + i}/> : null;
        const fill = isFillStyle(style) && isSymbolStyle(style) &&
        (checkSymbolsError(this.props.symbolErrors) ||
        checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape))
            ? null : isFillStyle(style) && <Fill {...stylerProps} defaultColor={this.props.defaultShapeFillColor} key={"fill" + i}/> || null;
        const text = isTextStyle(style) && <Text {...stylerProps} rotationStep={this.props.textRotationStep}/> || null;
        const markerType = (isMarkerStyle(style) || isSymbolStyle(style)) && <MarkerType {...stylerProps} pointType={isSymbolStyle(style) ? "symbol" : "marker"} onChangeType={this.changeSymbolType}/> || null;
        const markerGlyph = isMarkerStyle(style) && <MarkerGlyph {...stylerProps} markersOptions={this.props.markersOptions}/> || null;
        const symbolLayout = isSymbolStyle(style) && (
            <SymbolLayout
                {...stylerProps}
                style={{...style}}
                symbolsPath={this.props.symbolsPath}
                defaultShape={this.props.defaultShape}
                defaultShapeSize={this.props.defaultShapeSize}
                onUpdateOptions={(symbols) => {
                    this.props.onUpdateSymbols(symbols);
                }}
                options={this.props.symbolList}
                symbolErrors={this.props.symbolErrors}
                onLoadingError={this.props.onSetErrorSymbol}/>) || null;
        const separator = <hr/>;

        const sections = [markerType, preview, symbolLayout, markerGlyph, text, fill, stroke];

        return (<Grid fluid style={{ width: '100%' }} className="ms-style" key={"grid" + i}>
            <SwitchPanel {...switchPanelOptions} key={"switchPanel" + i}>
                {
                    /* adding the separator between sections */
                    sections.reduce((prev, curr, k) => [prev, prev && curr && <span key={"separator" + k}>{separator}</span>, curr])
                }
            </SwitchPanel>
        </Grid>);
    }

    render() {
        const styles = castArray(this.props.style);
        return (<div className="ms-style-manager">{styles.map((style, i) => this.renderPanelStyle(
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
            i))}</div>);
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
    }
    updateStyles = (id, style, styles, register = true) => {
        if (register) {
            registerStyle(hashAndStringify(style), style);
        }
        let newStyles = arrayUpdate(false, style, { 'id': id }, styles );
        this.props.onChangeStyle(newStyles);
    }
    changeSymbolType = (id, pointType) => {
        this.updateStylesAndType(id, pointType, this.props.defaultStyles.POINT?.[pointType]);
    }

    updateStylesAndType = (id, pointType, pointStyle) => {
        const styles = castArray(this.props.style);
        const styleChangedIndex = findIndex(styles, { 'id': id});
        if (styleChangedIndex !== -1) {
            let newStyles = styles.map((s, k) => k === styleChangedIndex ? {...pointStyle, id: s.id, title: s.title, geometry: s.geometry, filtering: s.filtering} : s);
            this.props.onChangeStyle(newStyles);
        }
    }
    checkSymbolUrl = ({style, symbolErrors, onLoadingError = this.props.onSetErrorSymbol}) => {
        axios.get(style.symbolUrl)
            .then(() => {
                if (!checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape )) {
                    const errors = filter(symbolErrors, s => s !== "loading_symbol" + style.shape);
                    onLoadingError(errors);
                }
            })
            .catch(() => {
                if (!checkSymbolsError(this.props.symbolErrors, "loading_symbol" + style.shape )) {
                    onLoadingError(symbolErrors.concat(["loading_symbol" + style.shape]));
                }
            });
    }
}

export default Manager;
