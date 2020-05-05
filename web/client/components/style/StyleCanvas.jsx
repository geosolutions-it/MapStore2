/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {isString} = require('lodash');

const defaultIcon = require('../map/openlayers/img/marker-icon.png');

const {createSvgUrl, isSymbolStyle} = require('../../utils/VectorStyleUtils');

class StyleCanvas extends React.Component {
    static propTypes = {
        originalStyle: PropTypes.object,
        style: PropTypes.object,
        shapeStyle: PropTypes.object,
        geomType: PropTypes.oneOf(['Polygon', 'Polyline', 'Point', 'Marker', 'Text', 'Symbol', 'Circle', undefined]),
        width: PropTypes.number,
        height: PropTypes.number
    };

    static defaultProps = {
        originalStyle: {},
        style: {},
        shapeStyle: {},
        geomType: 'Polygon',
        width: 100,
        height: 80
    };

    componentDidMount() {
        let context = this.refs.styleCanvas.getContext('2d');
        context.clearRect(0, 0, this.props.width || 500, this.props.height || 500);
        this.paint(context);
    }

    componentDidUpdate() {
        let context = this.refs.styleCanvas.getContext('2d');
        context.clearRect(0, 0, this.props.width || 500, this.props.height || 500);
        this.paint(context);
    }

    render() {
        return <canvas ref="styleCanvas" style={this.props.style} width={this.props.width} height={this.props.height} />;
    }

    paint = (ctx) => {
        ctx.save();
        ctx.beginPath();
        const {color, fill} = this.props.shapeStyle;

        ctx.fillStyle = fill
            ? isString(fill)
                ? fill
                : `rgba(${ fill.r }, ${ fill.g }, ${ fill.b }, ${ fill.a })`
            : null;
        ctx.strokeStyle = color
            ? isString(color)
                ? color
                : `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`
            : null;
        ctx.lineWidth = this.props.shapeStyle.width || this.props.shapeStyle.weight;
        if (this.props.shapeStyle.dashArray && this.props.shapeStyle.dashArray.length) {
            ctx.setLineDash(this.props.shapeStyle.dashArray);
        }
        switch (this.props.geomType) {
        case 'Polygon': {
            this.paintPolygon(ctx);
            break;
        }
        case 'Polyline': {
            this.paintPolyline(ctx);
            break;
        }
        case 'Point': {
            this.paintPoint(ctx, this.props.shapeStyle.markName);
            break;
        }
        case 'Circle': {
            this.paintPoint(ctx, "circle");
            break;
        }
        case 'Marker': {
            this.paintMarker(ctx);
            break;
        }
        case 'Text': {
            this.paintText(ctx);
            break;
        }
        case 'Symbol': {
            this.paintSymbol(ctx);
            break;
        }
        default: {
            return;
        }
        }
        ctx.restore();
    };

    drawSymbol = (url, ctx) => {
        ctx.clearRect(0, 0, 600, 600);
        let icon = new Image();
        let iconNotFound = new Image();
        iconNotFound.src = require('./vector/iconNotFound.png');

        icon.src = url || this.props.shapeStyle.symbolUrl;
        icon.onload = () => {
            try {
                // only when loaded draw the customized svg
                ctx.drawImage(icon, (this.props.width / 2) - (icon.width / 2), (this.props.height / 2) - (icon.height / 2));
            } catch (e) {
                return;
            }
        };
        icon.onerror = () => {
            iconNotFound.onload = () => {
                try {
                    ctx.drawImage(iconNotFound, (this.props.width / 2) - (iconNotFound.width / 2), (this.props.height / 2) - (iconNotFound.height / 2));
                } catch (e) {
                    return;
                }
            };
        };
    }
    paintSymbol = (ctx) => {
        if (isSymbolStyle(this.props.originalStyle)) {
            if (!this.props.originalStyle.symbolUrlCustomized || !this.props.originalStyle.symbolUrl) {
                createSvgUrl(this.props.originalStyle, this.props.originalStyle.symbolUrlCustomized || this.props.originalStyle.symbolUrl)
                    .then((url) => this.drawSymbol(url, ctx));
            } else {
                this.drawSymbol(this.props.originalStyle.symbolUrlCustomized, ctx);
            }
        } else {
            this.drawSymbol(null, ctx);
        }

    }
    paintText = (ctx) => {
        const {width, height} = this.props;
        const {textAlign = 'center', label, font = '14px Arial'} = this.props.shapeStyle;
        ctx.textAlign = textAlign;
        ctx.font = font;
        if (textAlign === 'start') {
            ctx.strokeText(label || "New", width / 2.5, height / 2);
            ctx.fillText(label || "New", width / 2.5, height / 2);
            return;
        }
        if (textAlign === 'end') {
            ctx.strokeText(label || "New", width / 1.5, height / 2);
            ctx.fillText(label || "New", width / 1.5, height / 2);
            return;
        }
        ctx.strokeText(label || "New", width / 2, height / 2);
        ctx.fillText(label || "New", width / 2, height / 2);
    };
    paintPolygon = (ctx) => {
        ctx.transform(1, 0, 0, 1, -27.5, 0);
        ctx.moveTo(55, 8);
        ctx.lineTo(100, 8);
        ctx.lineTo(117.5, 40);
        ctx.lineTo(100, 72);
        ctx.lineTo(55, 72);
        ctx.lineTo(37.5, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    paintPolyline = (ctx) => {
        ctx.transform(1, 0, 0, 1, 0, 0);
        ctx.moveTo(10, 20);
        ctx.bezierCurveTo(40, 40, 70, 0, 90, 20);
        ctx.stroke();
    };

    paintPoint = (ctx, markName) => {
        let r = this.props.shapeStyle.radius;
        let rm = r / 2;
        switch (markName) {
        case 'square': {
            ctx.rect(50 - rm, 48.5 - rm, r, r);
            break;
        }
        case 'circle': {
            ctx.arc(50, 48.5, rm, 0, 2 * Math.PI);
            break;
        }
        case 'triangle': {
            let h = Math.sqrt(3) * r / 2;
            let bc = h / 3;
            ctx.moveTo(50, 48.5 - 2 * bc);
            ctx.lineTo(50 + rm, 48.5 + bc);
            ctx.lineTo(50 - rm, 48.5 + bc);
            ctx.closePath();
            break;
        }
        case 'star': {
            this.paintStar(ctx, 50, 48.5, 5, rm, rm / 2);
            break;
        }
        case 'cross': {
            this.paintCross(ctx, 50, 48.5, r, 0.23);
            break;
        }
        case 'x': {
            ctx.translate(50, 48.5);
            ctx.rotate(45 * Math.PI / 180);
            ctx.translate(-50, -48.5);
            this.paintCross(ctx, 50, 48.5, r, 0.23);
            break;
        }
        default:
            ctx.arc(50, 48.5, r, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
    };

    paintMarker = (ctx) => {
        let icon = new Image();
        icon.src = defaultIcon;
        try {
            ctx.drawImage(icon, 42.5, 24);
        } catch (e) {
            return;
        }
    };

    // http://jsfiddle.net/m1erickson/8j6kdf4o/
    paintStar = (ctx, cx, cy, spikes = 5, outerRadius, innerRadius) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    };

    paintCross = (ctx, cx, cy, r, p) => {
        const w = r * p;
        const wm = w / 2;
        const rm = r / 2;
        ctx.moveTo(cx - wm, cy - rm);
        ctx.lineTo(cx + wm, cy - rm);
        ctx.lineTo(cx + wm, cy - wm);
        ctx.lineTo(cx + rm, cy - wm);
        ctx.lineTo(cx + rm, cy + wm);
        ctx.lineTo(cx + wm, cy + wm);
        ctx.lineTo(cx + wm, cy + rm);
        ctx.lineTo(cx - wm, cy + rm);
        ctx.lineTo(cx - wm, cy + wm);
        ctx.lineTo(cx - rm, cy + wm);
        ctx.lineTo(cx - rm, cy - wm);
        ctx.lineTo(cx - wm, cy - wm);
        ctx.closePath();
    };
}

module.exports = StyleCanvas;
