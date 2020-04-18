/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import join from 'lodash/join';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import { withResizeDetector } from 'react-resize-detector';

import BorderLayout from '../../components/layout/BorderLayout';
import Loader from '../../components/misc/Loader';
import usePlugins from '../../hooks/usePlugins';
import SmallLayout from './types/SmallLayout';
import MediumLayout from './types/MediumLayout';
import LargeLayout from './types/LargeLayout';

const defaultLayoutComponents = {
    sm: SmallLayout,
    md: MediumLayout,
    lg: LargeLayout
};

function LoaderPanel() {
    return (
        <BorderLayout
            className="ms-flexible-layout">
            <div
                className="ms-flexible-layout-loader-panel">
                <Loader
                    style={{ margin: 'auto' }}
                    size={150}/>
            </div>
        </BorderLayout>
    );
}

const defaultGetType = ({
    width,
    breakpoints
}) => {
    if (width === undefined) { return ''; }
    return Object.keys(breakpoints)
        .find((sizeKey) => {
            const lowerValue = breakpoints[sizeKey][0] === null
                ? -Infinity
                : breakpoints[sizeKey][0];
            const upperValue = breakpoints[sizeKey][1] === null
                ? Infinity
                : breakpoints[sizeKey][1];
            return width >= lowerValue
            && width < upperValue;
        });
};

export const useFlexibleLayoutResize = (props) => {
    const layoutRef = useRef(null);
    const resize = useRef(null);

    useEffect(() => {
        resize.current = debounce((newProps) => {
            const type = newProps.getType({
                width: newProps.width,
                height: newProps.height,
                breakpoints: newProps.breakpoints
            });
            newProps.onResize(type);
            const mapContainer = get(newProps.layoutRef, 'current.backgroundNode.current');
            const bodyLayout = get(newProps.layoutRef, 'current.bodyNode.current');

            if (mapContainer && mapContainer.getBoundingClientRect
            && bodyLayout && bodyLayout.getBoundingClientRect) {

                const mapBBOX = mapContainer.getBoundingClientRect();
                const bodyLayoutBBOX = bodyLayout.getBoundingClientRect();

                const left = bodyLayoutBBOX.left - mapBBOX.left;
                const right = mapBBOX.right - bodyLayoutBBOX.right;
                const top = bodyLayoutBBOX.top - mapBBOX.top;
                const bottom = mapBBOX.bottom - bodyLayoutBBOX.bottom;

                newProps.onUpdateMapSize({
                    boundingMapRect: bodyLayoutBBOX.width >= newProps.minMapViewSize[0]
                    && bodyLayoutBBOX.height >= newProps.minMapViewSize[1]
                        ? { left, right, top, bottom }
                        : { left: 0, right: 0, top: 0, bottom: 0 }
                });
            }
        }, props.resizeDebounceTime);
    }, []);

    const selectedKeys = props.activePlugins && join(props.activePlugins.map((name) => name), ',');
    const panelSizesStr = JSON.stringify(props.panelSizes);

    useEffect(() => {
        if (resize.current) {
            resize.current.cancel();
            resize.current({
                ...props,
                layoutRef: layoutRef
            });
        }
    }, [ selectedKeys, props.width, props.height, panelSizesStr ]);

    return layoutRef;
};

export const usePluginsComponents = (props, context) => {
    const loadedPluginsKeys = join(Object.keys(context.loadedPlugins || {}), ',');
    const plugins = usePlugins(props, context, [ loadedPluginsKeys ], props.loaderComponent);
    const pluginsLoaded = join(plugins.map(({ plugin }) => isFunction(plugin)), ',');
    const [ components, setComponents ] = useState({});
    useEffect(() => {
        setComponents(
            props.itemsMapping.reduce((itemsObject, { key, containerName }) => {
                return {
                    ...itemsObject,
                    [key]: plugins.filter(({ container }) => container === containerName)
                };
            }, {})
        );
    }, [ loadedPluginsKeys, pluginsLoaded ]);

    return components;
};

export const FlexibleLayout = forwardRef(({
    error,
    loading,
    type,
    options,
    layoutComponents,
    loaderComponent,
    iconComponent,
    activePlugins,
    panelSizes,
    width,
    height,
    onResizePanel,
    onSelect,
    onUpdateStructure,
    components
}, ref) => {

    if (error) {
        const errorMessage = isString(error)
            ? error
            : error && error.message || '';
        return (
            <div className="ms-flexible-layout-config-error">
                <div>{errorMessage}</div>
            </div>
        );
    }

    const LoaderComponent = loaderComponent;

    if (loading) {
        return LoaderComponent ? <LoaderComponent /> : <div />;
    }

    if (type) {
        const Body = layoutComponents[type];
        const layoutOptions = options && options[type] || {};

        return Body ? <Body
            { ...layoutOptions }
            { ...components }
            ref={ref}
            iconComponent={iconComponent}
            onUpdateStructure={onUpdateStructure}
            activePlugins={activePlugins}
            width={width}
            height={height}
            panelSizes={panelSizes}
            onSelect={onSelect}
            onResizePanel={onResizePanel}/> : <div />;
    }
    return LoaderComponent ? <LoaderComponent /> : <div />;
});

FlexibleLayout.propTypes = {
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    loading: PropTypes.bool,
    type: PropTypes.string,
    options: PropTypes.object,
    layoutComponents: PropTypes.object,
    loaderComponent: PropTypes.func,
    iconComponent: PropTypes.func,
    activePlugins: PropTypes.array,
    panelSizes: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    onResizePanel: PropTypes.func,
    onSelect: PropTypes.func,
    onUpdateStructure: PropTypes.func,
    components: PropTypes.object
};

FlexibleLayout.defaultProps = {
    error: false,
    loading: false,
    type: '',
    options: {
        sm: {
            dragMargin: [0, 0],
            minLayoutBodySize: [256, 256],
            resizeDisabled: false,
            steps: [0, 0.5, 1],
            maxDragThreshold: 0.1,
            initialStepIndex: 1
        },
        md: {
            dragMargin: [8, 8],
            minLayoutBodySize: [256, 256],
            resizeDisabled: true
        },
        lg: {
            dragMargin: [256, 256],
            minLayoutBodySize: [256, 256],
            resizeDisabled: true
        }
    },
    layoutComponents: defaultLayoutComponents,
    loaderComponent: LoaderPanel,
    activePlugins: [],
    panelSizes: {},
    onResizePanel: () => {},
    onSelect: () => {},
    onUpdateStructure: () => {},
    components: {}
};

const FlexibleLayoutPlugin = (props, context) => {

    const components = usePluginsComponents(props, context);
    const layoutRef = useFlexibleLayoutResize(props);

    return (
        <FlexibleLayout
            { ...props }
            ref={layoutRef}
            components={components}
        />
    );
};

FlexibleLayoutPlugin.contextTypes = {
    loadedPlugins: PropTypes.object
};

FlexibleLayoutPlugin.propTypes = {
    items: PropTypes.array,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    loading: PropTypes.bool,
    type: PropTypes.string,
    user: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    minMapViewSize: PropTypes.array,
    breakpoints: PropTypes.object,
    options: PropTypes.object,
    layoutComponents: PropTypes.object,
    loaderComponent: PropTypes.func,
    iconComponent: PropTypes.func,
    activePlugins: PropTypes.array,
    panelSizes: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    onResize: PropTypes.func,
    onResizePanel: PropTypes.func,
    onSelect: PropTypes.func,
    onUpdateStructure: PropTypes.func,
    onUpdateMapSize: PropTypes.func,
    resizeDebounceTime: PropTypes.number,
    itemsMapping: PropTypes.array,
    getType: PropTypes.func,
    resizeDebounceFunction: PropTypes.func
};

FlexibleLayoutPlugin.defaultProps = {
    items: [],
    error: false,
    loading: false,
    type: '',
    user: false,
    minMapViewSize: [200, 200],
    breakpoints: {
        sm: [null, 768],
        md: [768, 1200],
        lg: [1200, null]
    },
    options: {
        sm: {
            dragMargin: [0, 0],
            minLayoutBodySize: [256, 256],
            resizeDisabled: false,
            steps: [0, 0.5, 1],
            maxDragThreshold: 0.1,
            initialStepIndex: 1
        },
        md: {
            dragMargin: [8, 8],
            minLayoutBodySize: [256, 256],
            resizeDisabled: true
        },
        lg: {
            dragMargin: [256, 256],
            minLayoutBodySize: [256, 256],
            resizeDisabled: true
        }
    },
    layoutComponents: defaultLayoutComponents,
    loaderComponent: LoaderPanel,
    activePlugins: [],
    panelSizes: {},
    onResize: () => {},
    onResizePanel: () => {},
    onSelect: () => {},
    onUpdateStructure: () => {},
    onUpdateMapSize: () => {},
    resizeDebounceTime: 500,
    itemsMapping: [
        {
            key: 'bodyItems',
            containerName: 'body'
        },
        {
            key: 'backgroundItems',
            containerName: 'background'
        },
        {
            key: 'centerItems',
            containerName: 'center'
        },
        {
            key: 'leftMenuItems',
            containerName: 'left-menu'
        },
        {
            key: 'rightMenuItems',
            containerName: 'right-menu'
        },
        {
            key: 'columnItems',
            containerName: 'column'
        },
        {
            key: 'bottomItems',
            containerName: 'bottom'
        },
        {
            key: 'headerItems',
            containerName: 'header'
        },
        {
            key: 'footerItems',
            containerName: 'footer'
        }
    ],
    getType: defaultGetType
};

export default withResizeDetector(FlexibleLayoutPlugin);
