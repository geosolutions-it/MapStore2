import React from 'react';
import PropTypes from 'prop-types';
import PanelHeader from '../../../components/misc/panels/PanelHeader';
import BorderLayout from '../../../components/layout/BorderLayout';

export default class FeaturePopup extends React.Component {
    static propTypes = {
        onClose: PropTypes.func
    };

    render() {
        return (
            <div className="ms-side-panel" style={{ width: 300, zIndex: 2000 }} onClick={ e => e.stopPropagation() && e.preventDefault() }>
                <BorderLayout header={
                    <PanelHeader
                        onClose={(e) => {
                            console.log(e);
                            e.preventDefault();
                            e.stopPropagation();
                            this.props.onClose();
                        }}
                        bsStyle="primary"
                        title="test"
                    />
                }>
                  test
                </BorderLayout>
            </div>
        );
    }
}
