import React, {useState, useEffect, useRef} from 'react';
import {isEmpty} from 'lodash';
import Message from '../../../../components/I18N/Message';
import HTML from '../../../../components/I18N/HTML';

import { isProjectionAvailable } from '../../../../utils/ProjectionUtils';
import { reproject } from '../../../../utils/CoordinatesUtils';


import { getCredentials as getStoredCredentials, setCredentials as setStoredCredentials } from '../../../../utils/SecurityUtils';
import { CYCLOMEDIA_CREDENTIALS_REFERENCE } from '../../constants';
import { Alert, Button, Glyphicon } from 'react-bootstrap';
import withConfirm from '../../../../components/misc/withConfirm';
import withTooltip from '../../../../components/misc/enhancers/tooltip';
const CTButton = withConfirm(withTooltip(Button));
import CyclomediaCredentials from './Credentials';
import EmptyStreetView from '../EmptyStreetView';
const PROJECTION_NOT_AVAILABLE = "Projection not available";
const isInvalidCredentials = (error) => {
    return error?.message?.indexOf?.("code 401");
};
/**
 * Parses the error message to show to the user in the alert an user friendly message
 * @private
 * @param {object|string} error the error to parse
 * @returns {string|JSX.Element} the error message
 */
const getErrorMessage = (error, msgParams = {}) => {
    if (!error) {
        return null;
    }
    if (isInvalidCredentials(error) >= 0) {
        return <Message msgId="streetView.cyclomedia.errors.invalidCredentials" msgParams={msgParams} />;
    }
    if (error?.message?.indexOf?.(PROJECTION_NOT_AVAILABLE) >= 0) {
        return <Message msgId="streetView.cyclomedia.errors.projectionNotAvailable" msgParams={msgParams} />;
    }
    if (error?.message?.indexOf?.("not logged in") >= 0) {
        return <HTML msgId="streetView.cyclomedia.errors.notLoggedIn" />;
    }
    return error?.message ?? "Unknown error";
};

/**
 * EmptyView component. It shows a message when the API is not initialized or the map point are not visible.
 * @private
 * @param {object} props the component props
 * @param {object} props.style the style of the component
 * @param {boolean} props.initializing true if the API is initializing
 * @param {boolean} props.initialized true if the API is initialized
 * @param {object} props.StreetSmartApi the StreetSmartApi object
 * @param {boolean} props.mapPointVisible true if the map point are visible at the current level of zoom.
 * @param {boolean} props.loggingOut true if the user is logging out
 * @param {function} props.onClose the function to call when the user closes the component
 * @returns {JSX.Element} the component rendering
 */
const EmptyView = ({initializing, initialized, StreetSmartApi, mapPointVisible, loggingOut, onClose}) => {
    if (initialized && !mapPointVisible) {
        return (
            <EmptyStreetView description={<Message msgId="streetView.cyclomedia.zoomIn" />} />
        );
    }
    if (initialized) {
        return (
            <EmptyStreetView />
        );
    }
    if (initializing) {
        return (
            <EmptyStreetView loading description={<Message msgId="streetView.cyclomedia.initializing" />} />

        );
    }
    if (!StreetSmartApi) {
        return (
            <EmptyStreetView loading description={<Message msgId="streetView.cyclomedia.loadingAPI" />} />
        );
    }
    if (loggingOut) {
        return (<EmptyStreetView description={<>
            <div><Message msgId="streetView.cyclomedia.loggingOut" /></div>
            <Button onClick={() => {
                onClose();
            }}>Close</Button>
        </>} />);
    }
    return null;
};

/**
 * CyclomediaView component. It uses the Cyclomedia API to show the street view.
 * API Documentation at https://streetsmart.cyclomedia.com/api/v23.14/documentation/
 * This component is a wrapper of the Cyclomedia API. It uses an iframe to load the API, because actually the API uses and initializes react-dnd,
 * that must be unique in the application and it is already created and initialized by MapStore.
 * @param {object} props the component props
 * @param {string} props.apiKey the Cyclomedia API key
 * @param {object} props.style the style of the component
 * @param {object} props.location the location of the street view. It contains the latLng and the properties of the feature
 * @param {object} props.location.latLng the latLng of the street view. It contains the lat and lng properties
 * @param {object} props.location.properties the properties of the feature. It contains the `imageId` that can be used as query
 * @param {function} props.setPov the function to call when the point of view changes. It receives the new point of view as parameter (an object with `heading` and `pitch` properties)
 * @param {function} props.setLocation the function to call when the location changes. It receives the new location as parameter (an object with `latLng` and `properties` properties)
 * @param {boolean} props.mapPointVisible true if the map point are visible at the current level of zoom. It is used to show a message to zoom in when the map point are not visible.
 * @param {object} props.providerSettings the settings of the provider. It contains the `StreetSmartApiURL` property that is the URL of the Cyclomedia API
 * @param {function} props.refreshLayer the function to call to refresh the layer. It is used to refresh the layer when the credentials are changed.
 * @returns {JSX.Element} the component rendering
 */

const CyclomediaView = ({ apiKey, style, location = {}, setPov = () => {}, setLocation = () => {}, mapPointVisible, providerSettings = {}, refreshLayer = () => {}, onClose = () => {}}) => {
    const StreetSmartApiURL = providerSettings?.StreetSmartApiURL ?? "https://streetsmart.cyclomedia.com/api/v23.7/StreetSmartApi.js";
    const scripts = providerSettings?.scripts ?? `
    <script type="text/javascript" src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script type="text/javascript" src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
    `;
    const initOptions = providerSettings?.initOptions ?? {};
    const srs = providerSettings?.srs ?? 'EPSG:4326'; // for measurement tool and oblique tool 'EPSG:7791' is one of the supported SRS
    // location contains the latLng and the properties of the feature
    // properties contains the `imageId` that can be used as query
    const {properties} = location;
    const {imageId} = properties ?? {};

    // variables to store the API and the target element for the API
    const [StreetSmartApi, setStreetSmartApi] = useState();
    const [targetElement, setTargetElement] = useState();
    const viewer = useRef(null); // reference for the iframe that will contain the viewer

    // variables to store the state of the API
    const [initializing, setInitializing] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [reload, setReload] = useState(1);
    const [error, setError] = useState(null);
    const [reloadAllowed, setReloadAllowed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    // gets the credentials from the storage or from configuration.
    const hasConfiguredCredentials = providerSettings?.credentials;
    const isConfiguredOauth = initOptions?.loginOauth;
    const showLogout = providerSettings?.showLogout ?? true;
    const initialCredentials =
        isEmpty(getStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE)) ?
            providerSettings?.credentials ?? {} : getStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE);
    const [credentials, setCredentials] = useState(initialCredentials);
    const [showCredentialsForm, setShowCredentialsForm] = useState(!credentials?.username || !credentials?.password); // determines to show the credentials form
    const {username, password} = credentials ?? {};
    const resetCredentials = () => {
        if (getStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE)) {
            setStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, undefined);
        }
    };
    // setting a custom srs enables the measurement tool (where present) and other tools, but coordinates of the click
    // will be managed in the SRS used, so we need to convert them to EPSG:4326.
    // So we need to make sure that the SRS is available for coordinates conversion
    useEffect(() => {
        if (!isProjectionAvailable(srs)) {
            console.error(`Cyclomedia API: init: error: projection ${srs} is not available`);
            setError(new Error(PROJECTION_NOT_AVAILABLE));
        }
    }, [srs]);


    /**
     * Utility function to open an image in street smart viewer (it must be called after the API is initialized)
     * @param {string} query query for StreetSmartApi.open
     * @param {string} srs SRS for StreetSmartApi.open
     * @returns {Promise} a promise that resolves with the panoramaViewer
     */
    const openImage = (query) => {
        const viewerType = StreetSmartApi.ViewerType.PANORAMA;
        const options = {
            viewerType: viewerType,
            srs,
            panoramaViewer: {
                closable: false,
                maximizable: true,
                replace: true,
                recordingsVisible: true,
                navbarVisible: true,
                timeTravelVisible: true,
                measureTypeButtonVisible: true,
                measureTypeButtonStart: true,
                measureTypeButtonToggle: true
            },
            obliqueViewer: {
                closable: true,
                maximizable: true,
                navbarVisible: false
            }
        };
        return StreetSmartApi.open(query, options);
    };

    // initialize API
    useEffect(() => {
        if (!StreetSmartApi || !username || !password || !apiKey || !isProjectionAvailable(srs)) return () => {};
        setInitializing(true);
        StreetSmartApi.init({
            targetElement,

            apiKey,
            loginOauth: false,
            srs: srs,
            locale: 'en-us',
            ...initOptions,
            ...(isConfiguredOauth
                ? { }
                : {
                    username,
                    password
                } )
        }).then(function() {
            setInitializing(false);
            setInitialized(true);
            setError(null);
        }).catch(function(err) {
            setInitializing(false);
            setError(err);
            setReloadAllowed(true);
            if (isInvalidCredentials(err) >= 0) {
                setShowCredentialsForm(true);
            }
            if (err) {
                console.error('Cyclomedia API: init: error: ' + err);
            }


        });
        return () => {
            try {
                setInitialized(false);
                StreetSmartApi?.destroy?.({targetElement});
            } catch (e) {
                console.error(e);
            }

        };
    }, [StreetSmartApi, username, password, apiKey, reload]);
    // update credentials in the storage (for layer and memorization)
    useEffect(() => {
        const invalid = isInvalidCredentials(error);
        if (initialized && username && password && !invalid && initialized) {
            setStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, credentials);
            refreshLayer();
        } else {
            resetCredentials();
            refreshLayer();
        }
    }, [initialized, username, password, username, password, error, initialized]);
    const changeView = (_, {detail} = {}) => {
        const {yaw: heading, pitch} = detail ?? {};
        setPov({heading, pitch});
    };
    const changeRecording = (_, {detail} = {}) => {
        const {recording} = detail ?? {};
        // extract coordinates lat long from `xyz` of `recording` and `imageId` from recording `id` property
        if (recording?.xyz && recording?.id) {
            const {x: lng, y: lat} = reproject([recording?.xyz?.[0], recording?.xyz?.[1]], srs, 'EPSG:4326');
            setLocation({
                latLng: {
                    lat,
                    lng,
                    h: recording?.xyz?.[2] || 0
                },
                properties: {
                    ...recording,
                    imageId: recording?.id
                }
            });
        }
    };
    // open image when the imageId changes
    useEffect(() => {
        if (!StreetSmartApi || !imageId || !initialized) return () => {};
        let panoramaViewer;
        let viewChangeHandler;
        let recordingClickHandler;
        openImage(imageId)
            .then((result) => {
                if (result && result[0]) {
                    panoramaViewer = result[0];
                    viewChangeHandler = (...args) => changeView(panoramaViewer, ...args);
                    recordingClickHandler = (...args) => changeRecording(panoramaViewer, ...args);
                    panoramaViewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, viewChangeHandler);
                    panoramaViewer.on(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, recordingClickHandler);
                }

            })
            .catch((err) => {
                setError(err);
                console.error('Cyclomedia API: open: error: ' + err);
            });
        return () => {
            if (panoramaViewer && viewChangeHandler) {
                panoramaViewer.off(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, viewChangeHandler);
                panoramaViewer.off(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, recordingClickHandler);
            }
        };
    }, [StreetSmartApi, initialized, imageId]);

    // flag to show the panorama viewer
    const showPanoramaViewer = StreetSmartApi && initialized && imageId && !showCredentialsForm && !error;
    // flag to show the empty view
    const showEmptyView = initializing || !showCredentialsForm && !showPanoramaViewer && !error;
    const showError = error && !showCredentialsForm && !showPanoramaViewer && !initializing;

    // create the iframe content
    const srcDoc = `<html>
        <head>
            <style>
                html, body, #ms-street-smart-viewer-container {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            </style>
            ${scripts}
            <script type="text/javascript" src="${StreetSmartApiURL}" ></script>
            <script>
                    window.StreetSmartApi = StreetSmartApi
            </script>
            </head>
            <body>
                <div key="main" id="ms-street-smart-viewer-container" />

            </body>
        </html>`;
    return (<>
        {!hasConfiguredCredentials && <CyclomediaCredentials
            key="credentials"
            showCredentialsForm={showCredentialsForm}
            setShowCredentialsForm={setShowCredentialsForm}
            credentials={credentials}
            isCredentialsInvalid={isInvalidCredentials(error) >= 0}
            setCredentials={(newCredentials) => {
                setCredentials(newCredentials);
                setError(null);
                setReload(prev => prev + 1);
            }}/>}
        {showLogout
            && initialized
            && isConfiguredOauth
            && !error
            && (<div style={{textAlign: "right"}}>
                <CTButton
                    key="logout"
                    confirmContent={<Message msgId="streetView.cyclomedia.confirmLogout" />}
                    tooltipId="streetView.cyclomedia.logout"
                    onClick={() => {
                        StreetSmartApi?.destroy?.({targetElement, loginOauth: true});
                        setInitialized(false);
                        setLoggingOut(true);
                    }}>
                    <Glyphicon glyph="log-out" />&nbsp;
                </CTButton></div>)}
        {showEmptyView
            ? <EmptyView key="empty-view"
                StreetSmartApi={StreetSmartApi}
                style={style}
                initializing={initializing}
                initialized={initialized}
                loggingOut={loggingOut}
                onClose={onClose}
                mapPointVisible={mapPointVisible}/>
            : null}
        <iframe key="iframe" ref={viewer} onLoad={() => {
            setTargetElement(viewer.current?.contentDocument.querySelector('#ms-street-smart-viewer-container'));
            setStreetSmartApi(viewer.current?.contentWindow.StreetSmartApi);
        }} style={{ ...style, display: showPanoramaViewer ? 'block' : 'none'}}  srcDoc={srcDoc}>

        </iframe>
        <Alert bsStyle="danger"
            style={{...style, textAlign: 'center', alignContent: 'center', display: showError ? 'block' : 'none', overflow: 'auto'}} key="error">
            <Message msgId="streetView.cyclomedia.errorOccurred" />
            {getErrorMessage(error, {srs})}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                {(initialized || reloadAllowed) && isInvalidCredentials(error) < 0 ? <div><Button
                    style={{margin: 10}}
                    onClick={() => {
                        setError(null);
                        setReloadAllowed(false);
                        try {
                            setReload(reload + 1);
                        } catch (e) {
                            console.error(e);
                        }
                    }}>
                    <Message msgId="streetView.cyclomedia.reloadAPI"/>
                </Button></div> : null}
                {
                    isConfiguredOauth
                && showLogout
                && !showCredentialsForm
                && !initialized
                && error?.message?.indexOf?.("not logged in") >= 0
                && (<CTButton
                    style={{margin: 10}}
                    key="logout"
                    confirmContent={<Message msgId="streetView.cyclomedia.confirmLogout" />}
                    tooltipId="streetView.cyclomedia.tryForceLogout"
                    onClick={() => {
                        StreetSmartApi?.destroy?.({targetElement, loginOauth: true});
                    }}>
                    <Glyphicon glyph="log-out" />&nbsp;<Message msgId="streetView.cyclomedia.logout" />
                </CTButton>)
                }
            </div>
        </Alert>
    </>);
};

export default CyclomediaView;
