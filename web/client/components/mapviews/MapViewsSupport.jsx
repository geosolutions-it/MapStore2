/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, Suspense, lazy, useState, useCallback, useEffect, useReducer } from 'react';
import {
    ButtonGroup,
    Glyphicon,
    Checkbox,
    ButtonToolbar
} from 'react-bootstrap';
import uuid from 'uuid';
import max from 'lodash/max';
import undoable from 'redux-undo';
import identity from 'lodash/identity';

import MapViewsList from './MapViewsList';
import MapViewsProgressBar from './MapViewsProgressBar';
import FormControl from '../misc/DebouncedFormControl';
import { DefaultViewValues } from '../../utils/MapViewsUtils';
import Message from '../I18N/Message';
import Loader from '../misc/Loader';
import ButtonMS from '../misc/Button';
import tooltip from '../misc/enhancers/tooltip';
import { MapLibraries } from '../../utils/MapTypeUtils';
const Button = tooltip(ButtonMS);

const mapViewSupports = {
    [MapLibraries.LEAFLET]: lazy(() => import(/* webpackChunkName: 'supports/leafletMapViews' */ '../map/leaflet/MapViewsSupport')),
    [MapLibraries.OPENLAYERS]: lazy(() => import(/* webpackChunkName: 'supports/olMapViews' */ '../map/openlayers/MapViewsSupport')),
    [MapLibraries.CESIUM]: lazy(() => import(/* webpackChunkName: 'supports/cesiumMapViews' */ '../map/cesium/MapViewsSupport'))
};

const MapViewSettings = lazy(() => import('./MapViewSettings'));

const UPDATE_VIEWS_STATE = 'UPDATE_VIEWS_STATE';
const UNDO_VIEWS_STATE = 'UNDO_VIEWS_STATE';
const REDO_VIEWS_STATE = 'REDO_VIEWS_STATE';

const handlers = {
    [UPDATE_VIEWS_STATE]: (state, newState) => ({
        ...state,
        ...newState
    })
};

const reducer = (state, action) => {
    return (handlers[action.type] || identity)(state, action.payload);
};

const historyMapViewsStateReducer = undoable(reducer, {
    limit: 20,
    undoType: UNDO_VIEWS_STATE,
    redoType: REDO_VIEWS_STATE,
    jumpType: '',
    jumpToPastType: '',
    jumpToFutureType: '',
    clearHistoryType: ''
});

const computeDurationSum = (views) => views?.reduce((sum, view) => sum + (view?.duration ?? DefaultViewValues.DURATION) * 1000, 0) ?? 0;

const useMapViewsNavigation = ({
    currentIndex,
    views,
    onInit,
    onChangeView
}) => {

    const [play, setPlay] = useState(false);
    const [navigationProgress, setNavigationProgress] = useState(0);
    const viewsTimeTotalLength = computeDurationSum(views);
    const viewsTimeSegments = views.map((view, idx) => ({ view, duration: computeDurationSum(views.filter((vw, jdx) => jdx < idx)) }));

    useEffect(() => {
        if (!play) {
            setNavigationProgress(Math.round((viewsTimeSegments?.[currentIndex]?.duration ?? 0) / viewsTimeTotalLength * 100));
        }
    }, [currentIndex, play]);

    useEffect(() => {
        function detectVisibilityChange() {
            if (document.visibilityState !== 'visible') {
                setPlay(false);
            }
        }

        let animationFrame;
        let stop = false;

        if (play) {
            let startTime = Date.now();
            let index = currentIndex === -1 ? 0 : currentIndex;
            let initialDelta = viewsTimeSegments?.[index]?.duration;
            let mainStartTime = startTime;
            let currentView = views[index >= views.length ? 0 : index];
            onInit(currentView);
            const animate = () => {
                if (!stop) {
                    animationFrame = requestAnimationFrame(animate);
                    const currentTime = Date.now();
                    const delta = currentTime - startTime;
                    const duration = (currentView?.duration ?? DefaultViewValues.DURATION) * 1000;
                    // check single view duration time
                    if (delta >= duration) {
                        startTime = Date.now();
                        const previousIndex = index >= views.length ? 0 : index;
                        const nextIndex = (previousIndex + 1) >= views.length ? 0 : previousIndex + 1;
                        const nextView = views[nextIndex];
                        onChangeView(nextView);
                        currentView = nextView;
                        index = nextIndex;
                    }
                    // check global navigation duration time
                    const mainDelta = (currentTime + initialDelta) - mainStartTime;
                    const percentage = Math.round((mainDelta / viewsTimeTotalLength) * 100);
                    const currentViewPercentage = Math.round((delta / duration) * 100);
                    if ((currentViewPercentage % 5) === 0) {
                        setNavigationProgress(percentage);
                    }
                    if (mainDelta >= viewsTimeTotalLength) {
                        mainStartTime = Date.now();
                        initialDelta = 0;
                    }
                }
            };
            animate(index);
            document.addEventListener('visibilitychange', detectVisibilityChange);
        }
        return () => {
            stop = true;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            if (play) {
                document.removeEventListener('visibilitychange', detectVisibilityChange);
            }
        };
    }, [play]);

    return {
        play,
        setPlay,
        navigationProgress,
        viewsTimeSegments,
        viewsTimeTotalLength
    };
};

function MapViewsSupport({
    mapType,
    onSelectView = () => { },
    onUpdateViews = () => { },
    onUpdateResources = () => { },
    onUpdateServices = () => { },
    views: viewsProp = [],
    selectedId,
    defaultTitle = 'Map View',
    layers,
    groups,
    locale,
    resources: resourcesProp = [],
    services,
    selectedService,
    defaultServices,
    defaultSelectedService,
    edit,
    hide,
    ...props
}) {

    const [mapViewsStateHistory, dispatch] = useReducer(historyMapViewsStateReducer, {});
    const setViews = (views) => dispatch({ type: UPDATE_VIEWS_STATE, payload: { views } });
    const setResources = (resources) => dispatch({ type: UPDATE_VIEWS_STATE, payload: { resources } });
    const setMapViewsState = ({ views, resources }) => dispatch({ type: UPDATE_VIEWS_STATE, payload: { views, resources } });

    useEffect(() => {
        setMapViewsState({ views: viewsProp, resources: resourcesProp });
    }, []);

    const [triggerUpdate, setTriggerUpdate] = useState(0);
    const [expandedSections, setExpandedSections] = useState({});
    function handleHistory(historyActionType) {
        let nextState;
        if (historyActionType === UNDO_VIEWS_STATE) {
            nextState = mapViewsStateHistory?.past[mapViewsStateHistory?.past.length - 1];
        }
        if (historyActionType === REDO_VIEWS_STATE) {
            nextState = mapViewsStateHistory?.future[mapViewsStateHistory?.future.length - 1];
        }
        dispatch({ type: historyActionType });
        onUpdateViews(nextState.views);
        onUpdateResources(nextState.resources);
        setTriggerUpdate(triggerUpdate + 1);
    }

    const {
        views = [],
        resources = []
    } = mapViewsStateHistory?.present || {};

    const [expanded, setExpanded] = useState('');
    const [showDescription, setShowDescription] = useState(true);
    const [showViewsGeometries, setShowViewsGeometries] = useState(false);
    const [showClipGeometries, setShowClipGeometries] = useState(false);

    const selected = views.find(view => view.id === selectedId);
    const currentIndex = views.indexOf(selected);

    const [initApi, setInitApi] = useState(false);
    const api = useRef();
    function apiRef(newApi) {
        api.current = newApi;
        if (!initApi) {
            setInitApi(true);
        }
    }

    function handleCreateView(copyView) {
        const currentMaxCountInTitles = views.length > 0 && max(
            views
                .map(view => {
                    const titleRegex = new RegExp(`${defaultTitle} \\(([0-9]+)\\)`);
                    const match = (view.title || '').match(titleRegex)?.[1];
                    return match ? parseFloat(match) : undefined;
                })
                .filter(value => value !== undefined)
        );
        const maxCount = currentMaxCountInTitles && !isNaN(currentMaxCountInTitles)
            ? currentMaxCountInTitles
            : 0;
        const newView = {
            duration: DefaultViewValues.DURATION,
            flyTo: true,
            ...(copyView ? copyView : api.current.getView()),
            title: `${defaultTitle} (${maxCount + 1})`,
            id: uuid()
        };
        const newViews = currentIndex === -1
            ? [...views, newView]
            : views.reduce((acc, view, idx) => idx === currentIndex ? [...acc, view, newView] : [...acc, view], []);
        setViews(newViews);
        onSelectView(newView.id);
        onUpdateViews(newViews);
        if (!services && views.length === 0) {
            onUpdateServices(defaultSelectedService);
        }
    }

    function handleRemoveView(view) {
        const newViews = views.filter((vw) => vw.id !== view.id);
        setViews(newViews);
        onUpdateViews(newViews);
    }

    function handleSelectView(view, allowFlyTo) {
        if (view && api?.current?.setView) {
            api.current.setView(allowFlyTo ? view : { ...view, flyTo: false });
        }
        onSelectView(view.id);
    }

    function handleUpdateView(newView) {
        const newViews = views.map((view) => view.id === newView.id ? newView : view);
        setViews(newViews);
        onUpdateViews(newViews);
    }
    function handleCaptureView(newView) {
        const newViews = views.map((view) => view.id === newView.id ? ({
            ...newView,
            ...api.current.getView()
        }) : view);
        setViews(newViews);
        onUpdateViews(newViews);
    }

    const prevViews = useRef();
    prevViews.current = views;

    const handleMove = useCallback((dragIndex, hoverIndex) => {
        let newViews = [...prevViews.current];
        newViews.splice(dragIndex, 1);
        newViews.splice(hoverIndex, 0, prevViews.current[dragIndex]);
        setViews(newViews);
    }, []);

    function handleMoveEnd() {
        onUpdateViews(views);
    }

    function handleStepMove(delta) {
        if (views[currentIndex + delta]) {
            handleSelectView(views[currentIndex + delta]);
        }
    }

    function handleChangeOnSelected(properties) {
        const newViews = views.map((view) => view.id === selected.id ? ({
            ...view,
            ...properties
        }) : view);
        setViews(newViews);
        onUpdateViews(newViews);
    }

    function handleUpdateResource(id, data) {
        const hasResource = !!resources.find(res => res.id === id);
        const newResources = hasResource
            ? resources.map((res) => res.id === id ? { id, data } : res)
            : [...resources, { id, data }];
        setResources(newResources);
        onUpdateResources(newResources);
    }

    const {
        play,
        setPlay,
        navigationProgress,
        viewsTimeSegments,
        viewsTimeTotalLength
    } = useMapViewsNavigation({
        currentIndex,
        views,
        onInit: (currentView) => {
            handleSelectView(currentView);
            setExpanded('');
        },
        onChangeView: (nextView) => {
            handleSelectView(nextView, true);
        }
    });

    // set the initial view
    // only once on mount
    const init = useRef(false);
    useEffect(() => {
        if (initApi && !init.current) {
            init.current = true;
            if (selected) {
                // delay the initial set view
                // waiting that the zoom from map has been completed
                setTimeout(() => {
                    api.current.setView({
                        ...selected,
                        // remove fly animation to the initial view
                        flyTo: false
                    });
                }, 500);
            }
        }
    }, [initApi]);

    const Support = mapViewSupports[mapType];

    if (!Support || !edit && views?.length === 0 || hide) {
        return null;
    }
    return (
        <>
            <Suspense fallback={<div />}>
                <Support
                    {...props}
                    selectedId={selectedId}
                    views={views}
                    apiRef={apiRef}
                    showViewsGeometries={showViewsGeometries}
                    resources={resources}
                    showClipGeometries={showClipGeometries}
                />
            </Suspense>
            {(edit && views?.length === 0)
                ? (
                    <div className="ms-map-views">
                        <div className="ms-map-views-wrapper">
                            <div className="ms-map-views-header">
                                <div className="ms-map-views-title">
                                    <Message msgId="mapViews.addInitialView" />
                                </div>
                                <ButtonToolbar>
                                    <ButtonGroup>
                                        {(mapViewsStateHistory?.past?.length || 0) > 0 && <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            disabled={(mapViewsStateHistory?.past?.length || 0) === 0}
                                            onClick={() => handleHistory(UNDO_VIEWS_STATE)}
                                            tooltipId="mapViews.undoChanges"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="undo" />
                                        </Button>}
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            onClick={handleCreateView.bind(null, undefined)}
                                            tooltipId="mapViews.addNewView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="plus" />
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="ms-map-views" onClick={(event) => event.stopPropagation()}>
                        <div className="ms-map-views-wrapper">
                            <MapViewsProgressBar
                                play={play}
                                currentIndex={currentIndex}
                                progress={navigationProgress}
                                segments={viewsTimeSegments}
                                totalLength={viewsTimeTotalLength}
                                onSelect={view => {
                                    if (play) {
                                        setPlay(false);
                                    }
                                    handleSelectView(view);
                                }}
                            />
                            <div className="ms-map-views-header">
                                {(selected?.description && !expanded) ?
                                    <Button
                                        className="square-button-md no-border"
                                        style={{ borderRadius: '50%', marginRight: 4 }}
                                        onClick={() => setShowDescription(!showDescription)}
                                        tooltipId={showDescription ? 'mapViews.hideDescription' : 'mapViews.showDescription'}
                                        tooltipPosition="bottom"
                                    >
                                        <Glyphicon glyph={showDescription ? "chevron-down" : "chevron-right"} />
                                    </Button>
                                    : null}
                                <div className="ms-map-views-title">
                                    {expanded === 'settings'
                                        ? (
                                            <FormControl
                                                key={`${selected?.id}-${triggerUpdate}`}
                                                value={selected?.title}
                                                onChange={val => handleChangeOnSelected({ title: val })}
                                            />
                                        )
                                        : selected?.title}
                                </div>
                                <ButtonToolbar>
                                    {!play && <ButtonGroup>
                                        <Button
                                            bsStyle={expanded === 'list' ? 'success' : 'primary'}
                                            className="square-button-md"
                                            active={expanded === 'list'}
                                            onClick={() => setExpanded(expanded !== 'list' ? 'list' : '')}
                                            tooltipId={expanded === 'list' ? 'mapViews.hideViewsList' : 'mapViews.showViewsList'}
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="list" />
                                        </Button>
                                    </ButtonGroup>}
                                    {(!play && edit) && <ButtonGroup>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            disabled={expanded === 'settings'}
                                            onClick={handleCreateView.bind(null, undefined)}
                                            tooltipId={selected ? 'mapViews.addNewViewBelowSelected' : 'mapViews.addNewView'}
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="plus" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            disabled={!selected || expanded === 'settings'}
                                            onClick={handleCreateView.bind(null, selected)}
                                            tooltipId="mapViews.copyCurrentView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="duplicate" />
                                        </Button>
                                        <Button
                                            bsStyle={expanded === 'settings' ? 'success' : 'primary'}
                                            className="square-button-md"
                                            active={expanded === 'settings'}
                                            disabled={!selected}
                                            onClick={() => setExpanded(expanded !== 'settings' ? 'settings' : '')}
                                            tooltipId={expanded === 'settings' ? 'mapViews.stopEdit' : 'mapViews.edit'}
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="pencil" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            disabled={(mapViewsStateHistory?.past?.length || 0) === 0}
                                            onClick={() => handleHistory(UNDO_VIEWS_STATE)}
                                            tooltipId="mapViews.undoChanges"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="undo" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            disabled={(mapViewsStateHistory?.future?.length || 0) === 0}
                                            onClick={() => handleHistory(REDO_VIEWS_STATE)}
                                            tooltipId="mapViews.redoChanges"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="redo" />
                                        </Button>
                                    </ButtonGroup>}
                                    <ButtonGroup>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            onClick={() => handleSelectView(views[0])}
                                            disabled={currentIndex === 0 || play}
                                            tooltipId="mapViews.gotToFirstView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="fast-backward" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            onClick={() => handleStepMove(-1)}
                                            disabled={!views[currentIndex - 1] || play}
                                            tooltipId="mapViews.gotToPreviousView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="step-backward" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            active={!!play}
                                            disabled={views?.length === 1}
                                            onClick={() => setPlay(!play)}
                                            tooltipId={play ? 'mapViews.pause' : 'mapViews.play'}
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph={play ? 'pause' : 'play'} />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            onClick={() => handleStepMove(1)}
                                            disabled={!views[currentIndex + 1] || play}
                                            tooltipId="mapViews.gotToNextView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="step-forward" />
                                        </Button>
                                        <Button
                                            bsStyle="primary"
                                            className="square-button-md"
                                            onClick={() => handleSelectView(views[views?.length - 1])}
                                            disabled={currentIndex === views?.length - 1 || play}
                                            tooltipId="mapViews.gotToLastView"
                                            tooltipPosition="bottom"
                                        >
                                            <Glyphicon glyph="fast-forward" />
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                            </div>
                            <div className="ms-map-views-body">
                                {expanded === 'list' &&
                                    <MapViewsList
                                        views={views}
                                        edit={edit}
                                        selectedId={selected?.id}
                                        onSelect={handleSelectView}
                                        onMove={handleMove}
                                        onMoveEnd={handleMoveEnd}
                                        onRemove={handleRemoveView}
                                        options={
                                            <>
                                                {api.current?.options?.showClipGeometriesEnabled && <Checkbox checked={showViewsGeometries} onChange={() => setShowViewsGeometries(!showViewsGeometries)}>
                                                    <Message msgId="mapViews.showViewsGeometries" />
                                                </Checkbox>}
                                            </>
                                        }
                                    />
                                }
                                {(expanded === 'settings' && selected) &&
                                    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 8, width: '100%' }}><Loader size={30}/></div>}>
                                        <MapViewSettings
                                            key={`${selected.id}-${triggerUpdate}`}
                                            expandedSections={expandedSections}
                                            onExpandSection={(value) =>
                                                setExpandedSections((prevSections) => ({ ...prevSections, ...value }))
                                            }
                                            view={selected}
                                            api={api.current}
                                            onChange={handleUpdateView}
                                            onCaptureView={handleCaptureView}
                                            layers={layers}
                                            groups={groups}
                                            locale={locale}
                                            services={services}
                                            selectedService={selectedService}
                                            resources={resources}
                                            onUpdateResource={handleUpdateResource}
                                            showClipGeometries={showClipGeometries}
                                            onShowClipGeometries={setShowClipGeometries}
                                        />
                                    </Suspense>
                                }
                            </div>
                        </div>
                        {(!expanded && showDescription && selected?.description) && <div
                            className="ms-map-views-description">
                            <div dangerouslySetInnerHTML={{ __html: selected.description }} />
                        </div>
                        }
                    </div>
                )}

        </>
    );
}

export default MapViewsSupport;
