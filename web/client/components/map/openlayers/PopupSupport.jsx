import React from 'react';
import PropTypes from 'prop-types';
import { Overlay } from 'ol';

export default class PopupSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        popups: PropTypes.arrayOf(PropTypes.object)
    }

    static defaultProps = {
        popups: []
    }

    state = {
        overlay: null
    }

    componentDidMount() {
        this.preparePopups();
    }

    getOverlay = ({ id }) => {
        const element = this.popupWrapperRefs[id];
        return new Overlay({
            element,
            autoPan: true,
            autoPanAnimation: 200
        });
    }

    renderPopups() {
        const { popups } = this.props;
        return popups.map(({ id, component: PopupContent }) => {
            return (
                <div id={id} style={{ position: 'absolute' }} ref={(ref) => { this.popupWrapperRefs[id] = ref; return true; }}>
                    <PopupContent {...this.props} onClose={this.closePopup.bind(this, id)}/>
                </div>
            );
        });
    }

    render() {
        return <div>{this.renderPopups()}</div>;
    }

    closePopup(id) {
        const overlay = this.state.overlays.find((o) => o.getId() === id);
        if (overlay) {
            overlay.setPosition(undefined);
        }
    }


    popupWrapperRefs = {};

    preparePopups = () => {
        const { popups, map } = this.props;
        this.setState({
            overlays: [...popups.map(this.getOverlay)]
        },
        () => {
            this.state.overlays.map((overlay) => map.addOverlay(overlay));
            map.on('click', (evt) => {
                this.state.overlays.map(overlay => {
                    overlay.setPosition(evt.coordinate);
                });
            });
        });
    }
}
