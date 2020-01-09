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
        console.log(this.props);
        this.preparePopups();
    }

    getPopup = ({ id }) => {
        const element = this.popupWrapperRefs[id];
        return { popup: L.popup({ keepInView: true, className: 'test' }).setContent(element), id };
    }

    renderPopups() {
        const { popups } = this.props;
        return popups.map(({ id, component: PopupContent, props }) => {
            if (!PopupContent) {
                this.popupWrapperRefs[id] = document.getElementById(id);
                return null;
            }

            return (
                <div key={id} ref={(ref) => { this.popupWrapperRefs[id] = ref; return true; }}>
                    <PopupContent {...this.props} {...props}/>
                </div>
            );
        });
    }

    render() {
        return <div>{this.renderPopups()}</div>;
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
