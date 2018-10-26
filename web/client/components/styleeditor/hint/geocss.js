
// Implemented from css hint

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

const { head } = require('lodash');

const parseLocalPart = {
    'short': 'number',
    'float': 'number',
    'double': 'number',
    'long': 'number',
    'decimal': 'number',
    'int': 'number'
};

const getType = ({localPart, prefix}) => {
    return prefix === 'gml' && 'geometry'
    || parseLocalPart[localPart] || localPart || '';
};

module.exports = function(CodeMirror) {
    const {Pos: codeMirrorPos} = CodeMirror;

    CodeMirror.registerHelper('hint', 'geocss', function(cm) {
        const cur = cm.getCursor();
        const token = cm.getTokenAt(cur);

        const lineTokens = cm.getLineTokens(cur.line);
        const property = lineTokens && head(lineTokens.filter(({type, start}) => type === 'property' && start < token.start).map(({string}) => string));

        const inner = CodeMirror.innerMode(cm.getMode(), token.state);
        if (inner.mode.name !== 'geocss') return null;

        let start = token.start;
        let end = cur.ch;
        let word = token.string.slice(0, end - start);

        if (/[^\w$_-]/.test(word)) {
            word = '';
            start = end = cur.ch;
        }

        const { propertyKeywords, pseudoProperties, envKeywords } = CodeMirror.resolveMode('text/geocss') || {};
        const { hintProperties } = CodeMirror.getMode({}, 'text/geocss') || {};

        let selectedKeywords = {};
        let includeAll = false;
        const st = inner.state.state;

        if (st === 'pseudo' || token.type === 'variable-3') {
            selectedKeywords = {...pseudoProperties};
        } else if (st === 'prop') {
            includeAll = true;
            selectedKeywords = propertyKeywords && propertyKeywords[property] && propertyKeywords[property].values
            && {...propertyKeywords[property].values} || {};
        } else if (token.type === 'variable-2') {
            selectedKeywords = {...envKeywords};
        } else if (token.type === 'filter') {
            includeAll = true;
            selectedKeywords = {...hintProperties};
        } else if (st === 'block' || st === 'maybeprop') {
            selectedKeywords = {...propertyKeywords};
        }

        let list = Object.keys(selectedKeywords).reduce((results, name) => {
            const wordMatch = (!word || name.lastIndexOf(word, 0) === 0);
            return [
                ...results,
                ...(wordMatch && [name] || [])
            ];
        }, []);

        list = list.length === 0 && includeAll ?
            Object.keys(selectedKeywords).reduce((results, name) => [
                ...results,
                name
            ], [])
            : [...list];

        if (list.length > 0) {
            return {
                list: list.map(item => {
                    return {
                        text: item,
                        displayText: item,
                        render(el, editor, data) {
                            const icon = document.createElement('span');
                            const type = getType(selectedKeywords[data.displayText] || {});
                            icon.innerHTML = type && `{<span class="cm-desc">${type}</span>} ` || '';
                            const text = document.createElement('span');
                            text.innerText = data.displayText;
                            el.appendChild(icon);
                            el.appendChild(text);
                        }
                    };
                }),
                from: codeMirrorPos(cur.line, start),
                to: codeMirrorPos(cur.line, end)
            };
        }
        return null;
    });
};


