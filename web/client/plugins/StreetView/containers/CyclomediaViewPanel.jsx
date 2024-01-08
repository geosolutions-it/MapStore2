import React, {useMemo} from 'react';
import {createStructuredSelector} from 'reselect';
import {apiLoadedSelectorCreator} from '../selectors/streetView';
import {connect} from 'react-redux';
import {PROVIDERS} from '../constants';
import { getAPI } from '../api/cyclomedia';
import CyclomediaView from '../components/CyclomediaView';

const CyclomediaViewPanel = connect(createStructuredSelector({
    apiLoaded: apiLoadedSelectorCreator(PROVIDERS.CYCLOMEDIA)
}))(({enabled, apiLoaded, ...props}) => {
    const api = useMemo(() => getAPI(), [apiLoaded]);
    if (enabled) {
        return <CyclomediaView api={api} {...props} />;
    }
    return null;
});

export default CyclomediaViewPanel;
