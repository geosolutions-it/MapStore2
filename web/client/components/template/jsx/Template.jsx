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
        let template = (typeof this.props.template === 'function') ? this.props.template() : this.props.template;
        this.comp = Babel.transform(template, { presets: ['es2015', 'react', 'stage-0'] }).code;
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    renderCard() {
        /*eslint-disable */
        let model = this.props.model;
        return eval(this.comp);
        /*eslint-enable */
    },
    render() {
        return (<div>{this.renderCard()}</div>);
    }
});

module.exports = Template;
