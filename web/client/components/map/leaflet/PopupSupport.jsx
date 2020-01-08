import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

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

    getPopup = ({ id }) => {
        const element = this.popupWrapperRefs[id];
        return { popup: L.popup({ keepInView: true, className: 'test' }).setContent(element), id };
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
        console.log('close', id);
        const popup = this.state.popups.find(p => p.id === id);
        if (popup) {
            console.log(popup);

        }
    }


    popupWrapperRefs = {};

    preparePopups = () => {
        const { popups, map } = this.props;
        this.setState({
            popups: [...popups.map(this.getPopup)]
        },
        () => {
            map.on('click', (e) => {
                const coordinate = e.latlng;
                this.state.popups.map(p => {
                    p.popup.setLatLng(coordinate)
                        .openOn(map);
                });
            });
        });
    }
}
