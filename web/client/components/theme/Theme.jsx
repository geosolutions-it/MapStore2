/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, Children, memo } from 'react';
import PropTypes from 'prop-types';
import ConfigUtils from '../../utils/ConfigUtils';
import { validateVersion } from '../../selectors/version';
import { trim } from 'lodash';

/**
 * Theme component provider for the MapStore application
 * @memberof components.theme
 * @name Theme
 * @prop {string} version version string to use for the css href
 * @prop {string} theme string id of the theme (eg: default)
 * @prop {string} themeElement id for link tag of the theme
 * @prop {string} prefix theme prefix the class selector that wraps all the theme
 * @prop {string} containerNodeTarget query selector for the theme container by default will target the body
 * @prop {string} prefixContainer alias for containerNodeTarget props (deprecated)
 * @prop {string} path path directory of css theme
 * @prop {function} onLoad callback triggered once the css style is loaded by the link tag
 * @prop {boolean} disabled disable the theme functionalities. This could be used while using hardcoded link in the html pages
 */


const Theme = memo(({
    version,
    theme,
    themeElement,
    prefix: prefixProp,
    containerNodeTarget,
    prefixContainer,
    path: pathProp,
    onLoad,
    children,
    disabled
}) => {

    const prefix = prefixProp || __MAPSTORE_PROJECT_CONFIG__.themePrefix || ConfigUtils.getConfigProp('themePrefix') || 'ms2';
    const path = pathProp || __MAPSTORE_PROJECT_CONFIG__.themePath || 'dist/themes';
    const link = useRef();

    function handleError(event) {
        console.error('Cannot load selected style: ' + event.target.getAttribute('href'));
    }

    function handleLoad() {
        onLoad();
    }

    const containerQuerySelector = containerNodeTarget || prefixContainer;
    useEffect(() => {
        if (!disabled) {
            // this manipulation add the theme prefix to the app container
            // this is important because all the ms style is wrapped with the prefix class
            const containerNode = containerQuerySelector && document.querySelector(containerQuerySelector) || document.body;
            if (!containerNode.className || containerNode.className.indexOf(prefix) === -1) {
                containerNode.className = containerNode.className + ' ' + prefix;
            }
            // data-ms2-container is an attribute not wrapped by the prefix
            // and allow to apply style to the container of the application
            containerNode.setAttribute('data-ms2-container', 'ms2');
        }
    }, [containerQuerySelector, prefix, disabled]);

    useEffect(() => {
        if (!disabled && version) {

            const linkNode = document.getElementById(themeElement);
            const isMounted = linkNode?.getAttribute('data-ms-state') === 'mounted';

            if (!isMounted) {
                // create a new link object
                link.current = document.createElement('link');
                link.current.setAttribute('rel', 'stylesheet');
                link.current.onload = handleLoad;
                link.current.onerror = handleError;

                // detect if there is another link with the same theme id in the page,
                // copy the href and remove from the parent node
                // we need to remove the existing node to ensure that onload is triggered at least once
                if (linkNode) {
                    const linkNodeHref = linkNode.getAttribute('href') || '';
                    link.current.setAttribute('href', linkNodeHref);
                    if (linkNode.parentNode) {
                        linkNode.parentNode.removeChild(linkNode);
                    }
                }

                // assign id and insert as first element of the head
                link.current.setAttribute('id', themeElement);
                document.head.insertBefore(link.current, document.head.firstChild);

                // we need to store the mounted state to check if the link has been created already
                // in the same app lifecycle
                // this will reduce visual glitch if the react page tries to reload all components
                link.current.setAttribute('data-ms-state', 'mounted');
            } else {
                link.current = linkNode;
            }

            // compare previous and current href to change the theme
            const validatedVersion = validateVersion(version) ? trim(version) : '';
            const prevHref = link.current.getAttribute('href') || '';
            const href = `${path}/${theme}.css${validatedVersion ? '?' + validatedVersion : ''}`;

            if (prevHref !== href) {
                // store additional information as data- attributes on the link
                // to avoid to extract value from the href string if needed
                link.current.setAttribute('data-ms-theme', theme);
                link.current.setAttribute('data-ms-path', path);
                link.current.setAttribute('data-ms-version', validatedVersion);
                link.current.setAttribute('href', href);
            }
        }
    }, [ disabled, themeElement, path, theme, version ]);

    useEffect(() => {
        // we need to trigger on load to setup the app
        // if the themeCfg has the disabled value
        // because with disable true the link is not created
        if (disabled) {
            onLoad();
        }
    }, [disabled]);

    return children ? Children.only(children) : null;
});

Theme.propTypes = {
    id: PropTypes.string,
    version: PropTypes.string,
    theme: PropTypes.string.isRequired,
    themeElement: PropTypes.string,
    prefix: PropTypes.string,
    containerNodeTarget: PropTypes.string,
    prefixContainer: PropTypes.string,
    path: PropTypes.string,
    onLoad: PropTypes.func,
    disabled: PropTypes.bool
};

Theme.defaultProps = {
    id: 'ms-css-theme',
    version: '',
    theme: 'default',
    themeElement: 'theme_stylesheet',
    containerNodeTarget: '',
    prefixContainer: '',
    onLoad: () => {}
};

export default Theme;
