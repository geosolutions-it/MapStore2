import React from 'react';
import PropTypes from 'prop-types';
import PanelHeader from '../../../components/misc/panels/PanelHeader';
import BorderLayout from '../../../components/layout/BorderLayout';
import {connect} from 'react-redux';
import LoadingView from '../../../components/misc/LoadingView';

class FeaturePopup extends React.Component {
    static propTypes = {
        onClose: PropTypes.func,
        responses: PropTypes.array,
        requests: PropTypes.array,
        coords: PropTypes.object
    };

    render() {
        return !!this.props.requests.length || !this.props.responses.length ? (
            <div style={{ minWidth: 300 }}>
                <div className="ms-side-panel">
                    <BorderLayout header={
                        <PanelHeader
                            onClose={this.props.onClose}
                            bsStyle="primary"
                            title={this.props.responses.length ? this.props.responses[0].layerMetadata.title : ''}
                        />
                    }>
                        {!!this.props.requests.length && !this.props.responses.length && <LoadingView />}
                        {!!this.props.responses.length && (
                            <React.Fragment>
                                <p style={{textAlign: "center"}}>
                                    Lat: {this.props.coords.lat.toFixed(3)} - Long: {this.props.coords.lng.toFixed(3)}
                                </p>
                                <pre style={{maxHeight: 400, overflowY: 'auto'}}>
                                    {this.props.responses.map(({response}) => response)}
                                </pre>
                            </React.Fragment>
                        )}
                    </BorderLayout>
                </div>
            </div>
        ) : null;
    }
}

export default connect(
    (state) => ({
        responses: state.mapInfo.responses,
        requests: state.mapInfo.requests,
        coords: state.mapInfo.clickPoint ? state.mapInfo.clickPoint.latlng : {}
    })
)(FeaturePopup);
