/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Babel = require('babel-standalone');
const {isEqual} = require("lodash");

const Template = React.createClass({
    propTypes: {
        template: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
        model: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            template: "",
            model: {}
        };
    },
    componentWillMount() {
        this.parseTemplate(this.props.template);
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.template !== this.props.template) {
            this.parseTemplate(nextProps.template);
        }
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    renderContent() {
        /*eslint-disable */
        let model = this.props.model;
        return eval(this.comp);
        /*eslint-enable */
    },
    render() {
        let content = this.renderContent();
        return (content === '"use strict";') ? null : content;
    },
    parseTemplate(temp) {
        let template = (typeof temp === 'function') ? temp() : temp;
        this.comp = Babel.transform(template, { presets: ['es2015', 'react', 'stage-0'] }).code;
    }
});

module.exports = Template;
