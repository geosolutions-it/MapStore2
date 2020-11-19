/*
 * Copyright 2087, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {compose, withPropsOnChange} from 'recompose';

import Toolbar from '../../../misc/toolbar/Toolbar';

const isTool = t => t.target === "tools";
const hasTools = (tt = []) => tt.filter(isTool).length > 0;

/**
 * Transforms widgetTools into leftItems for the widget.
 */
export default () =>
    compose(
        withPropsOnChange(
            ['topLeftItems', 'widgetTools'],
            ({ topLeftItems = [], widgetTools}) => ({
                topLeftItems: hasTools(widgetTools)
                    ? [
                        ...topLeftItems,
                        (<Toolbar btnGroupProps={{
                            style: {
                                position: 'absolute',
                                left: 14
                            }
                        }}
                        btnDefaultProps={{
                            className: 'no-border',
                            bsSize: 'small',
                            bsStyle: 'link',
                            style: {
                                paddingLeft: 4,
                                paddingRight: 4
                            }
                        }}
                        buttons={widgetTools.filter(isTool)} />)]
                    : topLeftItems
            })
        )
    );
