const PropTypes = require('prop-types');
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

class Template extends React.Component {
    static propTypes = {
        template: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        model: PropTypes.object,
        renderContent: PropTypes.func,
        onError: PropTypes.func
    };

    static defaultProps = {
        template: "",
        model: {},
        onError: () => {}
    };

    componentWillMount() {
        this.parseTemplate(this.props.template);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.template !== this.props.template) {
            this.parseTemplate(nextProps.template);
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    }

    /*eslint-disable */
    renderContent = () => {
        let model = this.props.model;
        let props = this.props;
        return eval(this.comp);
    };

    /*eslint-enable */
    render() {
        let content = this.props.renderContent ? this.props.renderContent(this.comp, this.props) : this.renderContent();
        return React.isValidElement(content) ? content : null;
    }

    parseTemplate = (temp) => {
        let template = typeof temp === 'function' ? temp() : temp;
        try {
            this.comp = Babel.transform(template, { presets: ['es2015', 'react', 'stage-0'] }).code;
        } catch (e) {
            this.props.onError(e.message);
        }
    };
}

module.exports = Template;
