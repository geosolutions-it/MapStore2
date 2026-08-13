import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon } from 'react-bootstrap';
import LoadingSpinner from '../../../../misc/LoadingSpinner';

const containerStyle = { position: 'relative', width: '100%', height: 320, backgroundColor: '#1b1b1b', overflow: 'hidden' };
const MIN_FOV = Math.PI / 6;
const MAX_FOV = Math.PI * 100 / 180;

export const getZoomedFov = (fov, delta, Cesium) => {
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    return Cesium.Math.clamp(fov * zoomFactor, MIN_FOV, MAX_FOV);
};

const PanoramaViewer = ({ value, alt = 'Panorama Image' }) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        let viewer;
        let handler;
        let removeError;
        Promise.all([import('cesium'), import('cesium/Build/Cesium/Widgets/widgets.css')])
            .then(([Cesium]) => {
                if (!mounted) return;
                try {
                    const creditContainer = document.createElement('div');
                    viewer = new Cesium.Viewer(containerRef.current, {
                        animation: false, baseLayer: false, baseLayerPicker: false, creditContainer,
                        fullscreenButton: false, geocoder: false, homeButton: false, infoBox: false,
                        navigationHelpButton: false, sceneModePicker: false, selectionIndicator: false, timeline: false
                    });
                    const position = Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 100);
                    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                    viewer.scene.globe.show = false;
                    viewer.scene.skyBox.show = false;
                    viewer.scene.skyAtmosphere.show = false;
                    viewer.scene.sun.show = false;
                    viewer.scene.moon.show = false;
                    viewer.scene.primitives.add(new Cesium.EquirectangularPanorama({ image: value, transform }));
                    viewer.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(0, 0, 10));
                    viewer.camera.frustum.fov = Cesium.Math.toRadians(100);
                    const controller = viewer.scene.screenSpaceCameraController;
                    controller.enableRotate = false;
                    controller.enableTilt = false;
                    controller.enableLook = false;
                    controller.enableTranslate = false;
                    controller.enableZoom = false;
                    const canvas = viewer.scene.canvas;
                    let dragging = false;
                    canvas.style.cursor = 'grab';
                    handler = new Cesium.ScreenSpaceEventHandler(canvas);
                    handler.setInputAction(() => { dragging = true; canvas.style.cursor = 'grabbing'; }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                    handler.setInputAction(() => { dragging = false; canvas.style.cursor = 'grab'; }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    handler.setInputAction((movement) => {
                        if (!dragging) return;
                        const scale = viewer.camera.frustum.fov / canvas.clientWidth;
                        viewer.camera.lookLeft((movement.endPosition.x - movement.startPosition.x) * scale);
                        viewer.camera.lookUp((movement.endPosition.y - movement.startPosition.y) * scale);
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handler.setInputAction((delta) => {
                        viewer.camera.frustum.fov = getZoomedFov(viewer.camera.frustum.fov, delta, Cesium);
                    }, Cesium.ScreenSpaceEventType.WHEEL);
                    removeError = viewer.scene.renderError.addEventListener((scene, reason) => mounted && setError(reason.message || 'WebGL render error'));
                    setLoading(false);
                } catch (reason) {
                    if (mounted) { setError(reason.message || 'WebGL initialization error'); setLoading(false); }
                }
            })
            .catch((reason) => mounted && (setError(reason.message || 'Failed to load Cesium libraries'), setLoading(false)));
        return () => {
            mounted = false;
            if (removeError) removeError();
            if (handler && !handler.isDestroyed()) handler.destroy();
            if (viewer && !viewer.isDestroyed()) viewer.destroy();
        };
    }, [value]);

    return (
        <div className="ms-feature-info-attribute-panorama" style={containerStyle}>
            {error ? <><img src={value} alt={alt}/><div className="ms-feature-info-attribute-panorama-error"><Alert bsStyle="danger"><Glyphicon glyph="exclamation-sign"/> {error}</Alert></div></> : null}
            {loading && !error ? <div className="ms-feature-info-attribute-panorama-loading"><LoadingSpinner /></div> : null}
            <div ref={containerRef} aria-label="Cesium panorama viewer" style={{ width: '100%', height: '100%' }}/>
        </div>
    );
};

PanoramaViewer.propTypes = { value: PropTypes.string.isRequired, alt: PropTypes.string };
export default PanoramaViewer;
