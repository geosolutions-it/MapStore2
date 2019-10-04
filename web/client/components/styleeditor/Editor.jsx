/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { Controlled: Codemirror } = require('react-codemirror2');
const { debounce, isEqual, endsWith, isFunction } = require('lodash');
const CM = require('codemirror/lib/codemirror');
const BorderLayout = require('../layout/BorderLayout');
const Loader = require('../misc/Loader');
const InfoPopover = require('../widgets/widget/InfoPopover');
const Message = require('../I18N/Message');
const assign = require('object-assign');

require('codemirror/lib/codemirror.css');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/selection/mark-selection');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/hint/show-hint');

/* SLD styling highlight */
require('codemirror/mode/xml/xml');

require('./mode/geocss')(CM);
require('./hint/geocss')(CM);

/**
 * Component for rendering a grid of style templates.
 * @memberof components.styleeditor
 * @name Editor
 * @class
 * @prop {string} mode code mode, 'geocss' or 'xml'
 * @prop {string} code initial code text
 * @prop {function} onChange triggered after change value in textarea, arg. code
 * @prop {number} waitTime dobunce time for trigger onChange, default 1000
 * @prop {object} hintProperties properties added to hint list
 * @prop {object} error error object, eg: {line: 2, message: 'Error'}
 * @prop {array} inlineWidgets array of inline widget, see example
 * @prop {bool} loading loading state
 * @example
 * ```
 * // inline widgets example
 * const inlineWidgets = [
 *  {
 *   type: 'color', // must be unique type
 *   active: token => token.type === 'atom', // function must return true or false
 *   style: token => ({backgroundColor: token.string}), // style to apply to inline widget button, function or object
 *   Widget: ({token, value, onChange = () => {}}) => (<div onClick={() => onChange('valueToApply')}>{value || token.string}</div>) // Component displayed after clicking on widget button
 *  }
 * ];
 *
 * <Editor mode="geocss" code="* { stroke: #ff0000; }" inlineWidgets={inlineWidgets}/>
 * ```
 */

class Editor extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        theme: PropTypes.string,
        style: PropTypes.object,
        code: PropTypes.string,
        onChange: PropTypes.func,
        waitTime: PropTypes.number,
        hintProperties: PropTypes.object,
        error: PropTypes.object,
        inlineWidgets: PropTypes.array,
        loading: PropTypes.bool
    };

    static defaultProps = {
        mode: 'geocss',
        theme: 'lesser-dark',
        style: {},
        code: '',
        onChange: () => { },
        waitTime: 1000,
        hintProperties: {},
        inlineWidgets: []
    };

    state = {}

    UNSAFE_componentWillMount() {
        this.setState({ code: this.props.code });
    }

    UNSAFE_componentWillUpdate(newProps) {
        if (!isEqual(this.props.error, newProps.error)) {
            if (this.marker) {
                this.marker.clear();
                this.marker = null;
            }
            if (newProps.error) {
                const lineCount = this.editor.lineCount();
                const startPos = {
                    line: newProps.error.line - 1 || 0,
                    ch: 0
                };
                const endPos = newProps.error.line ? {
                    line: lineCount,
                    ch: 0
                } : this.editor.getCursor();
                this.marker = this.editor.markText(
                    startPos,
                    endPos,
                    {className: 'ms-style-editor-error'});
            }
        }
    }

    onRenderToken = editor => {

        const lineCount = editor.lineCount();

        if (this.inlineWidgets) {
            this.inlineWidgets.forEach(widget => {
                if (widget && widget.parentNode && widget.parentNode.removeChild) {
                    widget.parentNode.removeChild(widget);
                }
            });
        }

        this.inlineWidgets = [];

        editor.doc.iter(0, lineCount, line => {
            const lineNo = line.lineNo();
            const lineTokens = editor.getLineTokens(lineNo);
            lineTokens.forEach(token => {

                this.inlineWidgets = this.props.inlineWidgets.reduce((widgets, {type, style = {}, active = () => false, className = ''}) => {

                    if (active(token)) {
                        const inlineWidget = this.getInlineWidget({
                            className,
                            token,
                            onClick: () => this.setState({ inlineWidgetType: type, token, lineNo }),
                            style: isFunction(style) && style(token) || style
                        });
                        editor.addWidget({ line: lineNo, ch: token.start - 1 }, inlineWidget, false);
                        return [...widgets, inlineWidget];
                    }

                    return [...widgets];

                }, [...this.inlineWidgets]);
            });
        });
    };

    onAutocomplete = instance => {
        if (instance && instance.state && instance.state.completionActive) return;
        const cur = instance.getCursor();
        const token = instance.getTokenAt(cur);
        if (token.string && (endsWith(token.string, '-') || token.string.match(/^[.`\w@]\w*$/)) && token.string.length > 0) {
            const wrapperElement = this.editor && this.editor.getWrapperElement && this.editor.getWrapperElement() || null;
            CM.commands.autocomplete(instance, null, { completeSingle: false, container: wrapperElement });
        }
    };

    onUpdate = () => {
        this.update.cancel();
        this.update();
    }

    getInlineWidget = ({ onClick = () => {}, token = {}, className = '', style = {} }) => {
        const inlineWidget = document.createElement('div');
        inlineWidget.setAttribute('class', `${className} ms-style-editor-inline-widget`);
        assign(inlineWidget.style, style);
        inlineWidget.onclick = () => onClick({ ...token });
        return inlineWidget;
    };

    render() {
        return (
            <BorderLayout
                className="ms-style-editor"
                style={this.props.style}
                header={
                    <div className="ms-style-editor-head">
                        {this.props.loading && <Loader className="ms-style-editor-loader" size={20}/>}
                        {this.props.error && <InfoPopover
                            glyph="exclamation-mark"
                            bsStyle="danger"
                            placement="right"
                            title={<Message msgId="styleeditor.validationErrorTitle"/>}
                            text={this.props.error.line
                                ? this.props.error.message
                                : <Message msgId="styleeditor.genericValidationError"/>}/>
                        }
                    </div>
                }>
                <Codemirror
                    key="style-editor"
                    value={this.state.code}
                    editorDidMount={editor => {
                        this.onRenderToken(editor);
                        this.editor = editor;
                        editor.on('inputRead', this.onAutocomplete);
                        this.update = debounce(() => {
                            this.props.onChange(this.state.code);
                        }, this.props.waitTime);
                        CM.extendMode(this.props.mode, { hintProperties: this.props.hintProperties });
                    }}
                    editorWillUnmount={editor => editor.off('inputRead', this.onAutocomplete)}
                    onBeforeChange={(editor, data, code) => this.setState({ code })}
                    onChange={editor => {
                        this.onRenderToken(editor);
                        this.onUpdate();
                    }}
                    options={{
                        theme: this.props.theme,
                        mode: this.props.mode,
                        lineNumbers: true,
                        styleSelectedText: true,
                        indentUnit: 2,
                        tabSize: 2
                    }} />
                {this.state.token &&
                    <div className="ms-inline-widget-container">
                        <div>
                            <button
                                className="btn close square-button"
                                onClick={() => {
                                    if (this.state.value) {
                                        this.editor.replaceRange(
                                            this.state.value,
                                            {
                                                line: this.state.lineNo,
                                                ch: this.state.token.start
                                            },
                                            {
                                                line: this.state.lineNo,
                                                ch: this.state.token.end
                                            }
                                        );
                                    }
                                    this.setState({
                                        token: null,
                                        inlineWidgetType: null,
                                        lineNo: null,
                                        value: null
                                    });
                                }} />
                        </div>
                        <div>
                            {this.props.inlineWidgets
                                .filter(({type}) => type === this.state.inlineWidgetType)
                                .map(({ Widget }) =>
                                    <Widget
                                        value={this.state.value}
                                        token={this.state.token}
                                        onChange={value => this.setState({ value })}/>
                                )}
                        </div>
                    </div>}
            </BorderLayout>
        );
    }
}

module.exports = Editor;
