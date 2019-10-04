

// Implemented from css mode

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

const {startsWith, trim} = require('lodash');

module.exports = (CodeMirror) => {

    CodeMirror.defineMode('geocss', function(config, parserConfig = {}) {

        const { indentUnit } = config;
        const {
            propertyKeywords = {},
            colorKeywords = {},
            valueKeywords = {},
            logicKeywords = {},
            allowNested
        } = parserConfig.propertyKeywords && parserConfig || CodeMirror.resolveMode('text/geocss');

        let type;
        let override;
        let states = {};

        const ret = (style, tp) => {
            type = tp;
            return style;
        };

        const tokenString = quote => {
            return (stream, state) => {
                let escaped = false;
                let ch = stream.next();
                while (ch) {
                    if (ch === quote && !escaped) {
                        if (quote === ')') stream.backUp(1);
                        break;
                    }
                    escaped = !escaped && ch === '\\';
                    ch = stream.next();
                }
                if (ch === quote || !escaped && quote !== ')') {
                    state.tokenize = null;
                }
                return ret('string', 'string');
            };
        };

        const tokenComment = (stream, state) => {
            let maybeEnd = false;
            let ch = stream.next();
            while (ch) {
                if (maybeEnd && ch === '/') {
                    state.tokenize = null;
                    break;
                }
                maybeEnd = (ch === '*');
                ch = stream.next();
            }
            return ['comment', 'comment'];
        };

        const tokenBase = (stream, state) => {
            let ch = stream.next();
            if (ch === '@') {
                if (stream.eat('{')) return [null, 'interpolation'];
                if (stream.match(/^(sd|scale)\b/)) return ['filter', null];
                stream.eatWhile(/[\w\\\-]/);
                if (stream.match(/^\s*:/, false)) {
                    return ['variable-2', 'variable-definition'];
                }
                return ['variable-2', 'variable'];
            } else if (ch === '/') {
                if (stream.eat('*')) {
                    state.tokenize = tokenComment;
                    return tokenComment(stream, state);
                }
                return ['operator', 'operator'];
            } else if (ch === "\"" || ch === "'") {
                state.tokenize = tokenString(ch);
                return state.tokenize(stream, state);
            } else if (ch === "#") {
                stream.eatWhile(/[\w\\\-]/);
                return ret("atom", "hash");
            } else if (/\d/.test(ch) || ch === "." && stream.eat(/\d/)) {
                stream.eatWhile(/[\w.%]/);
                return ret("number", "unit");
            } else if (ch === "-") {
                if (/[\d.]/.test(stream.peek())) {
                    stream.eatWhile(/[\w.%]/);
                    return ret("number", "unit");
                } else if (stream.match(/^-[\w\\\-]+/)) {
                    stream.eatWhile(/[\w\\\-]/);
                    if (stream.match(/^\s*:/, false)) {
                        return ret("variable-2", "variable-definition");
                    }
                    return ret("variable-2", "variable");
                } else if (stream.match(/^\w+-/)) {
                    return ret("meta", "meta");
                }
            } else if (/[,+>*\/]/.test(ch)) {
                return ret(null, "select-op");
            } else if (ch === "." && stream.match(/^-?[_a-z][_a-z0-9-]*/i)) {
                return ret("qualifier", "qualifier");
            } else if (/[:;{}\[\]\(\)]/.test(ch)) {
                return ret(null, ch);
            } else if (/[\w\\\-]/.test(ch)) {
                stream.eatWhile(/[\w\\\-]/);
                return ret("property", "word");
            }
            return ret(null, null);
        };

        function Context(currentType, indent, prev) {
            this.type = currentType;
            this.indent = indent;
            this.prev = prev;
        }

        const pushContext = (state, stream, currentType, indent) => {
            state.context = new Context(currentType, stream.indentation() + (indent === false ? 0 : indentUnit), state.context);
            return currentType;
        };

        const popContext = (state) => {
            if (state.context.prev) {
                state.context = state.context.prev;
            }
            return state.context.type;
        };

        const pass = (currentType, stream, state) => {
            return states[state.context.type](currentType, stream, state);
        };

        const popAndPass = (currentType, stream, state, n) => {
            for (let i = n || 1; i > 0; i--) {
                state.context = state.context.prev;
            }
            return pass(currentType, stream, state);
        };

        const wordAsValue = function(stream) {
            let word = stream.current().toLowerCase();
            if (valueKeywords.hasOwnProperty(word)) {
                override = "atom";
            } else if (colorKeywords.hasOwnProperty(word)) {
                override = "keyword";
            } else {
                override = 'variable';
            }
        };

        states.top = (currentType, stream, state) => {
            if (currentType === "{") {
                return pushContext(state, stream, "block");
            } else if (currentType === "}" && state.context.prev) {
                return popContext(state);
            } else if (currentType === "hash") {
                override = "builtin";
            } else if (currentType === "word") {
                override = "tag";
            } else if (currentType === "variable-definition") {
                return "maybeprop";
            } else if (currentType === "interpolation") {
                return pushContext(state, stream, "interpolation");
            } else if (currentType === ":") {
                return "pseudo";
            } else if (allowNested && currentType === "(") {
                return pushContext(state, stream, "parens");
            }
            return state.context.type;
        };

        states.block = (currentType, stream, state) => {

            if (currentType === 'word') {
                let word = stream.current().toLowerCase();
                if (propertyKeywords.hasOwnProperty(word)) {
                    override = 'property';
                    return 'maybeprop';
                } else if (logicKeywords.hasOwnProperty(trim(word))) {
                    override = "logic";
                    return 'maybeprop';
                } else if (startsWith(trim(stream.string), '[')) {
                    override = "filter";
                    return 'maybeprop';
                }
                override += ' error';
                return 'maybeprop';
            } else if (currentType === 'meta') {
                return 'block';
            } else if (!allowNested && (currentType === 'hash' || currentType === 'qualifier')) {
                override = 'error';
                return 'block';
            }
            return states.top(currentType, stream, state);
        };

        states.maybeprop = (currentType, stream, state) => {
            if (currentType === ':') {
                return pushContext(state, stream, "prop");
            }
            return pass(currentType, stream, state);
        };

        states.prop = (currentType, stream, state) => {
            if (currentType === ";") return popContext(state);
            if (currentType === "{" && allowNested) return pushContext(state, stream, "propBlock");
            if (currentType === "}" || currentType === "{") return popAndPass(currentType, stream, state);
            if (currentType === "(") return pushContext(state, stream, "parens");

            if (currentType === "hash" && !/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
                override += " error";
            } else if (currentType === "word") {
                wordAsValue(stream);
            } else if (currentType === "interpolation") {
                return pushContext(state, stream, "interpolation");
            }
            return "prop";
        };

        states.propBlock = (currentType, _stream, state) => {
            if (currentType === "}") return popContext(state);
            if (currentType === "word") { override = "property"; return "maybeprop"; }
            return state.context.type;
        };

        states.parens = (currentType, stream, state) => {
            if (currentType === "{" || currentType === "}") return popAndPass(currentType, stream, state);
            if (currentType === ")") return popContext(state);
            if (currentType === "(") return pushContext(state, stream, "parens");
            if (currentType === "interpolation") return pushContext(state, stream, "interpolation");
            if (currentType === "word") wordAsValue(stream);
            return "parens";
        };

        states.pseudo = (currentType, stream, state) => {
            if (currentType === 'word') {
                override = 'variable-3';
                return state.context.type;
            }
            return pass(type, stream, state);
        };

        states.at = (currentType, stream, state) => {
            if (currentType === ";") return popContext(state);
            if (currentType === "{" || currentType === "}") return popAndPass(currentType, stream, state);
            if (currentType === "word") override = "tag";
            else if (currentType === "hash") override = "builtin";
            return "at";
        };

        states.interpolation = (currentType, stream, state) => {
            if (currentType === "}") return popContext(state);
            if (currentType === "{" || currentType === ";") return popAndPass(currentType, stream, state);
            if (currentType === "word") {
                override = "variable";
            } else if (currentType !== "variable" && currentType !== "(" && currentType !== ")") {
                override = "error";
            }
            return "interpolation";
        };

        return {
            startState: base => {
                return {
                    tokenize: null,
                    state: 'top',
                    stateArg: null,
                    context: new Context('block', base || 0, null)
                };
            },

            token: (stream, state) => {
                if (!state.tokenize && stream.eatSpace()) return null;
                let style = (state.tokenize || tokenBase)(stream, state);
                if (style && typeof style === 'object') {
                    type = style[1];
                    style = style[0];
                }
                override = style;
                state.state = states[state.state](type, stream, state);
                return override;
            },

            indent: (state, textAfter) => {
                let cx = state.context;
                let ch = textAfter && textAfter.charAt(0);
                let indent = cx.indent;
                if (cx.type === "prop" && (ch === "}" || ch === ")")) cx = cx.prev;
                if (cx.prev) {
                    if (ch === "}" && (cx.type === "block" || cx.type === "top" ||
                        cx.type === "interpolation")) {
                        // Resume indentation from parent context.
                        cx = cx.prev;
                        indent = cx.indent;
                    } else if (ch === ")" && (cx.type === "parens") ||
                        ch === "{" && (cx.type === "at" || cx.type === "atBlock")) {
                        // Dedent relative to current context.
                        indent = Math.max(0, cx.indent - indentUnit);
                        cx = cx.prev;
                    }
                }
                return indent;
            },
            electricChars: "}",
            blockCommentStart: "/*",
            blockCommentEnd: "*/",
            fold: "brace"
        };
    });

    const keywords = {
        colorKeywords: [
            "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
            "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
            "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
            "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
            "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen",
            "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
            "darkslateblue", "darkslategray", "darkturquoise", "darkviolet",
            "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick",
            "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite",
            "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew",
            "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
            "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
            "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink",
            "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
            "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
            "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
            "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
            "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
            "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered",
            "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
            "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
            "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown",
            "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
            "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan",
            "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
            "whitesmoke", "yellow", "yellowgreen"
        ],
        valueKeywords: [
            'round'
        ],
        pseudoProperties: [
            'mark',
            'shield',
            'stroke',
            'fill',
            'symbol',
            'nth-mark',
            'nth-shield',
            'nth-stroke',
            'nth-fill',
            'nth-symbol'
        ],
        logicKeywords: [
            'and',
            'or'
        ]
    };

    CodeMirror.defineMIME('text/geocss', {
        ...Object.keys(keywords).reduce((allKeywords, name) => ({
            ...allKeywords,
            [name]: keywords[name].reduce((keywordObj, key) => ({
                ...keywordObj,
                [key]: true
            }), {})
        }), {}),
        propertyKeywords: {
            "mark": {
                values: {
                    // missing updaload resources
                    // 'url(circle)': true,
                    'symbol(circle)': true
                }
            },
            "mark-composite": true,
            "mark-mime": true,
            "mark-geometry": true,
            "mark-size": true,
            "mark-rotation": true,
            "mark-label-obstacle": true,
            "mark-anchor": true,
            "mark-offset": true,
            "z-index": true,
            "stroke": true,
            "stroke-composite": true,
            "stroke-geometry": true,
            "stroke-offset": true,
            "stroke-mime": true,
            "stroke-opacity": true,
            "stroke-width": true,
            "stroke-size": true,
            "stroke-rotation": true,
            "stroke-linecap": true,
            "stroke-linejoin": true,
            "stroke-dasharray": true,
            "stroke-dashoffset": true,
            "stroke-repeat": true,
            "stroke-label-obstacle": true,
            "fill": true,
            "fill-composite": true,
            "fill-geometry": true,
            "fill-mime": true,
            "fill-opacity": true,
            "fill-size": true,
            "fill-rotation": true,
            "fill-label-obstacle": true,
            "graphic-margin": true,
            "random": true,
            "random-seed": true,
            "random-rotation": true,
            "random-symbol-count": true,
            "random-tile-size": true,
            "fill-random": true,
            "fill-random-seed": true,
            "fill-random-rotation": true,
            "fill-random-symbol-count": true,
            "fill-random-tile-size": true,
            "label": true,
            "label-geometry": true,
            "label-anchor": true,
            "label-offset": true,
            "label-rotation": true,
            "label-z-index": true,
            "shield": true,
            "shield-mime": true,
            "font-family": true,
            "font-fill": true,
            "font-style": true,
            "font-weight": true,
            "font-size": true,
            "halo-radius": true,
            "halo-color": true,
            "halo-opacity": true,
            "label-padding": true,
            "label-group": true,
            "label-max-displacement": true,
            "label-min-group-distance": true,
            "label-repeat": true,
            "label-all-group": true,
            "label-remove-overlaps": true,
            "label-allow-overruns": true,
            "label-follow-line": true,
            "label-max-angle-delta": true,
            "label-auto-wrap": true,
            "label-force-ltr": true,
            "label-conflict-resolution": true,
            "label-fit-goodness": true,
            "label-priority": true,
            "shield-resize": true,
            "shield-margin": true,
            "label-underline-text": true,
            "label-strikethrough-text": true,
            "label-char-spacing": true,
            "label-word-spacing": true,
            "raster-channels": true,
            "raster-composite": true,
            "raster-geometry": true,
            "raster-opacity": true,
            "raster-contrast-enhancement": true,
            "raster-contrast-enhancement-algorithm": true,
            "raster-contrast-enhancement-min": true,
            "raster-contrast-enhancement-max": true,
            "raster-gamma": true,
            "raster-z-index": true,
            "raster-color-map": true,
            "raster-color-map-type": true,
            "composite": true,
            "composite-base": true,
            "geometry": true,
            "sort-by": true,
            "sort-by-group": true,
            "transform": true,
            "size": true,
            "rotation": true
        },
        envKeywords: {
            sd: {
                localPart: 'env'
            },
            scale: {
                localPart: 'env'
            }
        },
        allowNested: true,
        name: 'geocss'
    });
};
