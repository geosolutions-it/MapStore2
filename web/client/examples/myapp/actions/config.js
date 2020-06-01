const axios = require('../../../libs/ajax');
const {configureMap, configureError} = require('../../../actions/config');

/**
 * Map configuration loader action.
 * ReduxJS thunk.
 */
function loadMapConfig(configName, legacy) {
    return (dispatch) => {
        // loads the configuration file and dispatches configureMap or configureError
        return axios.get(configName).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(configureMap(response.data, legacy));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(configureError('Configuration file broken (' + configName + '): ' + e.message));
                }

            }

        }).catch((e) => {
            dispatch(configureError(e));
        });
    };
}

module.exports = {
    loadMapConfig
};
