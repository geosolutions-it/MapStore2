/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { trim } from 'lodash';
import less from "less";

import { validateVersion } from '../../selectors/version';
import themeVars from "!!raw-loader!../../themes/default/ms-variables.less";

/**
 * Theme component provider for the context pages
 * @memberof components.theme
 * @name ContextTheme
 * @prop {object[]} theme a list of theme configurations to apply in a specific context
 * @prop {string} version version string to use for the css href
 * @example
 * // add a css link tag in the context page
 * <ContextTheme
 *  theme={[{
 *      id: 'dark',
 *      type: 'link',
 *      href: 'dist/themes/dark.css'
 *  }]}/>
 */

function ContextTheme({
    theme,
    version
}) {
    const validatedVersion = validateVersion(version) ? trim(version) : '';
    let newVars = "";
    try {
        less.render(themeVars + ".get-root-css-variables(@ms-theme-vars);", {
            modifyVars: theme?.[0]?.colors || {}
        }, (error, output) => {
            if (output.css) {
                newVars = output.css;
            }
        });
    } catch (error) {
        console.error("error during parsing", error);
    }
    return <>
        {[createPortal(
            <>
                {theme.map(({ type, ...options }) => {
                    if (type === 'link') {
                        const href = `${options.href}${validatedVersion ? '?' + validatedVersion : ''}`;
                        return (
                            <link
                                rel="stylesheet"
                                data-ms-context-theme={options.id}
                                href={href}
                            />
                        );
                    }
                    return null;
                })}
            </>,
            document.head
        ),
        createPortal(<style dangerouslySetInnerHTML={{ __html: newVars }} />, document.head)
        ]}

    </>;
}

ContextTheme.propTypes = {
    theme: PropTypes.array,
    version: PropTypes.string
};

ContextTheme.defaultProps = {
    theme: []
};

export default ContextTheme;
