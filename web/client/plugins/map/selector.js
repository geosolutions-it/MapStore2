import { mapSelector, projectionDefsSelector, isMouseMoveCoordinatesActiveSelector } from '../../selectors/map';
import { mapTypeSelector, isOpenlayers } from '../../selectors/maptype';
import { layerSelectorWithMarkers } from '../../selectors/layers';
import { highlighedFeatures } from '../../selectors/highlight';
import { securityTokenSelector } from '../../selectors/security';
import { currentLocaleLanguageSelector } from '../../selectors/locale';
import { isLocalizedLayerStylesEnabledSelector, localizedLayerStylesNameSelector } from '../../selectors/localizedLayerStyles';
import { createShallowSelectorCreator } from '../../utils/ReselectUtils';
import isEqual from 'lodash/isEqual';

/**
 * Map state to props selector for Map plugin
 */

export default createShallowSelectorCreator(isEqual)(
    projectionDefsSelector,
    mapSelector,
    mapTypeSelector,
    layerSelectorWithMarkers,
    highlighedFeatures,
    state => state.mapInitialConfig && state.mapInitialConfig.loadingError && state.mapInitialConfig.loadingError.data,
    securityTokenSelector,
    isMouseMoveCoordinatesActiveSelector,
    isOpenlayers,
    isLocalizedLayerStylesEnabledSelector,
    localizedLayerStylesNameSelector,
    currentLocaleLanguageSelector,
    (projectionDefs, map, mapType, layers, features, loadingError, securityToken, elevationEnabled, shouldLoadFont, isLocalizedLayerStylesEnabled, localizedLayerStylesName, currentLocaleLanguage) => ({
        projectionDefs,
        map,
        mapType,
        layers,
        features,
        loadingError,
        securityToken,
        elevationEnabled,
        shouldLoadFont,
        isLocalizedLayerStylesEnabled,
        localizedLayerStylesName,
        currentLocaleLanguage
    })
);
