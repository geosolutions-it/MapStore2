/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const withSideEffect = require('react-side-effect');
const ConfigUtils = require('../../utils/ConfigUtils');
const {validateVersion} = require('../../selectors/version');
const {trim} = require('lodash');

const reducePropsToState = (props) => {
    const innermostProps = props[props.length - 1];
    if (innermostProps && innermostProps.version) {
        return {
            version: validateVersion(innermostProps.version) ? "?" + trim(innermostProps.version) : '',
            theme: innermostProps.theme || 'default',
            themeElement: innermostProps.themeElement || 'theme_stylesheet',
            prefix: innermostProps.prefix || ConfigUtils.getConfigProp('themePrefix') || 'ms2',
            prefixContainer: innermostProps.prefixContainer && document.querySelector(innermostProps.prefixContainer) || document.body,
            path: innermostProps.path || 'dist/themes',
            onLoad: innermostProps.onLoad || null
        };
    }
    return null;
};

const handleStateChangeOnClient = (themeCfg) => {
    if (themeCfg && themeCfg.theme) {
        let link = document.getElementById(themeCfg.themeElement);

        if (!link) {
            link = document.createElement('link');
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("id", themeCfg.themeElement);
            document.head.insertBefore(link, document.head.firstChild);
        }
        const basePath = link.href && link.href.substring(0, link.href.lastIndexOf("/")) || themeCfg.path;
        const currentPath = link.href && link.href.substring(link.href.lastIndexOf("/"), link.href.length) || '';
        const newPath = "/" + themeCfg.theme + ".css" + themeCfg.version;
        if (currentPath !== newPath) {
            link.setAttribute('href', basePath + newPath);
        } else if (currentPath === newPath && themeCfg.onLoad && !link.onload) {
            themeCfg.onLoad();
        }

        if (themeCfg.onLoad && !link.onload) {
            link.onload = () => {
                themeCfg.onLoad();
            };
        }

        const prefixContainer = themeCfg.prefixContainer;
        const prefix = themeCfg.prefix;

        if (!prefixContainer.className || prefixContainer.className.indexOf(prefix) === -1) {
            prefixContainer.className = prefixContainer.className + ' ' + prefix;
        }
        prefixContainer.setAttribute('data-ms2-container', 'ms2');
    }
};

class Theme extends React.Component {
    static propTypes = {
        theme: PropTypes.string.isRequired,
        version: PropTypes.string,
        onLoad: PropTypes.func
    };

    static defaultProps = {
        theme: 'default'
    };

    render() {
        if (this.props.children) {
            return React.Children.only(this.props.children);
        }
        return null;
    }
}

module.exports = withSideEffect(reducePropsToState, handleStateChangeOnClient)(Theme);
