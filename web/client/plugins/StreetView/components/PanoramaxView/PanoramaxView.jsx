import React, { useEffect, useRef } from 'react';
import '@panoramax/web-viewer';
// Import of viewer's styles
import '@panoramax/web-viewer/build/index.css';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import Message from "../../../locale/Message";
import {PANORAMAX_DEFAULT_API_URL} from "../../constants";

const PanoramaxView = (
    {
        style,
        location,
        providerSettings = {},
        setLocation,
        setPov
    }) => {
    const viewerRef = useRef(null);
    const endpoint = providerSettings.PanoramaxApiURL || PANORAMAX_DEFAULT_API_URL;

    // The photo ID is required
    const pictureId = location?.properties?.id;
    // The sequence ID is optional but recommended if available
    // GeoVisio often returns "sequence_id" or it can be found in the links
    const sequenceId = location?.properties.sequence_id || location?.properties?.sequence || undefined;

    useEffect(() => {
        const element = viewerRef.current;
        if (!element) return () => null;

        const handleReady = () => {
            const psv = element.psv;
            if (!psv) return;

            // Update of Point Of View (Angle/POV)
            const onRotate = (e) => {
                if (setPov && e.detail) {
                    // e.detail.x correspond to heading (0-360°)
                    // e.detail.y correspond to roll, the cursor used in mapstore does not show the roll
                    // e.detail.y correspond to pitch, the cursor used in mapstore does not show the pitch
                    setPov({ heading: e.detail.x, pitch: e.detail.y, zoom: e.detail.z });
                }
            };

            // Update cursor position on Map when moving on the pictures
            const onPictureLoading = (e) => {
                if (setLocation && e.detail) {
                    const { picId, lon, lat } = e.detail;
                    // Check the picture to change only the cursor position on picture change
                    if (location?.properties?.id !== picId) {
                        setLocation({
                            latLng: { lat, lng: lon, h: 0 },
                            properties: { id: picId }
                        });
                    }
                }
            };

            // Binding of the listeners to the panoramax viewer
            psv.addEventListener('view-rotated', onRotate);
            psv.addEventListener('picture-loading', onPictureLoading);

            // Cleaning of the listerners on completed actions
            element._cleanupListeners = () => {
                psv.removeEventListener('view-rotated', onRotate);
                psv.removeEventListener('picture-loading', onPictureLoading);
            };
        };

        // The component emits 'ready' when its loading is complete
        element.addEventListener('ready', handleReady);

        // Handling case whn the component is already ready
        if (element.psv) {
            handleReady();
        }

        return () => {
            element.removeEventListener('ready', handleReady);
            if (element._cleanupListeners) {
                element._cleanupListeners();
            }
        };
    }, [setLocation, setPov, location?.properties?.id]);

    if (!pictureId) {
        return <div style={style}><Message msgId="streetView.panoramax.emptySelection"/></div>;
    }

    return (
        <div style={{ ...style, position: 'relative', display: 'block' }}>
            <pnx-photo-viewer
                ref={viewerRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
                endpoint={endpoint}
                picture={pictureId}
                sequence={sequenceId}
                widgets="false"
            >
                <pnx-widget-legend light slot="bottom-right"></pnx-widget-legend>
            </pnx-photo-viewer>
        </div>
    );
};

export default PanoramaxView;
