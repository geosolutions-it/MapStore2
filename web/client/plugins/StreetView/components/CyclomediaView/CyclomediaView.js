import React, {useState, useEffect, useRef} from 'react';
import Message from '../../../../components/I18N/Message';

import { getCredentials as getStoredCredentials, setCredentials as setStoredCredentials } from '../../../../utils/SecurityUtils';
import { CYCLOMEDIA_CREDENTIALS_REFERENCE } from '../../constants';
import { getResolutions } from '../../../../utils/MapUtils';

import CyclomediaCredentials from './Credentials';
import EmptyStreetView from '../EmptyStreetView';
const getErrorMessage = (error) => {
    if (error?.indexOf?.("init::Loading user info failed with status code 401") >= 0) {
        return <Message msgId="streetView.cyclomedia.invalidCredentials" />;
    }
    return error?.message ?? "Unknown error";
};
const EmptyView = ({style = {}, initializing, initialized, StreetSmartApi, mapPointVisible}) => {
    if (initialized && !mapPointVisible) {
        return (<div style={{...style, textAlign: 'center', alignContent: 'center'}} >
            <Message msgId="streetView.cyclomedia.zoomIn" />
        </div>);
    }
    if (initialized) {
        return (<div style={{...style, textAlign: 'center', alignContent: 'center'}} >
            <EmptyStreetView />
        </div>);
    }
    if (initializing) {
        return (<div style={{...style, textAlign: 'center', alignContent: 'center'}} >
            <Message msgId="streetView.cyclomedia.initializing" />
        </div>);
    }
    if (!StreetSmartApi) {
        return (<div style={{...style, textAlign: 'center', alignContent: 'center'}} >
            <Message msgId="streetView.cyclomedia.loadingAPI" />
        </div>);
    }
    return null;
};

// write a component that loads the library and then renders the viewer
// https://streetsmart.cyclomedia.com/api/v23.14/documentation/
const CyclomediaView = ({ apiKey, api: StreetSmartApi, style, location = {}, setPov = () => {}, setLocation = () => {}, mapPointVisible}) => {
    // location contains the latLng and the properties of the feature
    // properties contains the `imageId` that can be used as query
    const {properties} = location;
    const {imageId} = properties ?? {};
    const initialCredentials = getStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE);
    const [credentials, setCredentials] = useState(initialCredentials);
    const {username, password} = credentials ?? {};

    const viewer = useRef(null); // reference for the div that will contain the viewer
    const [initialized, setInitialized] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState(null);

    // openImage(`${coordinates[0]},${coordinates[1]}`, 'EPSG:3857')
    const openImage = (query, srs) => {
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
            }
        };
        return StreetSmartApi.open(query, options);
    };
    // initialize API
    useEffect(() => {
        if (!StreetSmartApi || !username || !password || !apiKey) return () => {};
        setInitializing(true);
        StreetSmartApi.init({
            targetElement: viewer.current,
            username,
            password,
            apiKey,
            loginOauth: false,
            // srs: 'EPSG:25832',
            srs: 'EPSG:4326',
            locale: 'en-us'
        // configurationUrl: 'https://atlas.cyclomedia.com/configuration',
        // addressSettings: {
        //     locale: "us",
        //     database: "Nokia"
        // }
        }).then(function() {
            setInitializing(false);
            setInitialized(true);
        }).catch(function(err) {
            setInitializing(false);
            setError(err);
            console.error('Cyclomedia API: init: error: ' + err);
        });
        return () => {
            try {
                StreetSmartApi?.destroy?.({targetElement: viewer.current});
            } catch (e) {
                console.error(e);
            }

        };
    }, [StreetSmartApi, username, password, apiKey]);

    const changeView = (_, {detail} = {}) => {
        const {yaw: heading, pitch} = detail ?? {};
        setPov({heading, pitch});
    };
    const changeRecording = (_, {detail} = {}) => {
        const {recording} = detail ?? {};
        // extract coordinates lat long from `xyz` of `recording` and `imageId` from recording `id` property
        if (recording?.xyz && recording?.id) {
            setLocation({
                latLng: {
                    lat: recording?.xyz?.[1],
                    lng: recording?.xyz?.[0]
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
        openImage(imageId, 'EPSG:4326')
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
    const hasCredentials = username && password;
    const showCredentialsForm = !hasCredentials;
    // show the viewer only when lib is ready, imageId is available and no error is present
    const show = StreetSmartApi && initialized && imageId && !showCredentialsForm && !error;
    const empty = !showCredentialsForm && !show && !error;
    return (<>
        {<CyclomediaCredentials
            key="credentials"
            credentials={credentials}
            setCredentials={(newCredentials) => {
                setCredentials(newCredentials);
                setStoredCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, newCredentials);
            }}/>}
        {empty ? <EmptyView key="empty-view" StreetSmartApi={StreetSmartApi} style={style} initializing={initializing} initialized={initialized}  mapPointVisible={mapPointVisible}/> : null}
        <div style={{...style, display: show ? 'block' : 'none'}} ref={viewer} key="main" id="ms-street-smart-viewer-container" />
        <div style={{...style, textAlign: 'center', alignContent: 'center', display: error ? 'block' : 'none'}} key="error"><Message msgId="streetView.cyclomedia.errorOccurred" /> {getErrorMessage(error)}</div>
    </>);
};

export default CyclomediaView;
