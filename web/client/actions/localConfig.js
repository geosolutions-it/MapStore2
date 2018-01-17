const LOCAL_CONFIG_LOADED = 'LOCAL_CONFIG_LOADED';
const SUPPORTED_LOCALES_REGISTERED = 'LOCAL_CONFIG:SUPPORTED_LOCALES_REGISTERED';

function localConfigLoaded(config) {
    return {
        type: LOCAL_CONFIG_LOADED,
        config
    };
}
function supportedLanguagesRegistered(locales) {
    return {
        type: SUPPORTED_LOCALES_REGISTERED,
        locales
    };
}
module.exports = {
    LOCAL_CONFIG_LOADED, localConfigLoaded,
    SUPPORTED_LOCALES_REGISTERED, supportedLanguagesRegistered

};
