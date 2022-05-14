/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState, useEffect} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { trim } from 'lodash';
import themeVars from "!!raw-loader!../../themes/default/ms-variables.less";


import { validateVersion } from '../../selectors/version';

/**
 * Theme component provider for the context pages
 * @memberof components.theme
 * @name ContextTheme
 * @prop {object} theme a theme configuration to apply in a specific context
 * @prop {string} version version string to use for the css href
 * @example
 * // add a css link tag in the context page
 * <ContextTheme
 *  theme={{
 *      id: 'dark',
 *      type: 'link',
 *      href: 'dist/themes/dark.css',
 *      variables: {
 *          "ms-main-color": "#005500",
 *          "ms-main-bg": "#FFFFFF",
 *          "ms-primary-contrast": "#FFFFFF",
 *          "ms-primary": "#0D7185"
 *          "ms-success-contrast": "#FFFFFF",
 *          "ms-success": "#398439",
 *      }
 *  }}/>
 */

function ContextTheme({
    customVariablesEnabled,
    theme,
    version
}) {
    const validatedVersion = validateVersion(version) ? trim(version) : '';
    let [variables, setVariables] = useState("");

    useEffect( () => {
        import(/* webpackChunkName: 'less' */ "less").then(({"default": less}) => {
            if (theme.variables && customVariablesEnabled) {
                try {
                    // we add the dispatch of the mixin so that we trigger the recompilation of the variables
                    less.render(themeVars + ".get-root-css-variables(@ms-theme-vars);", {
                        modifyVars: theme?.variables || {}
                    }, (error, output) => {
                        if (output.css) {
                            setVariables(output.css);
                        }
                    });
                } catch (error) {
                    console.error("error during parsing", error);
                }
            }
        });
    }, [theme.id, JSON.stringify(theme.variables), customVariablesEnabled]); // id cannot be defined if a theme preset is not chosen
    return <>
        {[createPortal(
            <>
                {(() => {
                    if (theme.type === 'link') {
                        const href = `${theme.href}${validatedVersion ? '?' + validatedVersion : ''}`;
                        return (
                            <link
                                rel="stylesheet"
                                data-ms-context-theme={theme.id}
                                href={href}
                            />
                        );
                    }
                    return null;
                })()}
            </>,
            document.head
        ),
        variables ? createPortal(<style dangerouslySetInnerHTML={{ __html: variables }} />, document.head) : null
        ]}

    </>;
}

ContextTheme.propTypes = {
    theme: PropTypes.object,
    version: PropTypes.string
};

ContextTheme.defaultProps = {
    theme: {}
};

export default ContextTheme;
