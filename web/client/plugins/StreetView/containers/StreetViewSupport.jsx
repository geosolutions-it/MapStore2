import OLSVServiceSupport from '../components/OLSVServiceSupport';
import {connect} from 'react-redux';
import { enabledSelector } from '../selectors';
import { setLocation } from '../actions';

const StreetViewSupport = connect(
    state => ({
        enabled: enabledSelector(state)
    }),
    {
        setLocation
    }
)(OLSVServiceSupport);

export default StreetViewSupport;
