
/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import GeoFence from '../../api/geoserver/GeoFence';
import Message from '../../components/I18N/Message';

/**
 * A dropdown menu to select GeoServer instances for cleaning their cache.
 *
 * @param {Object[]} gsInstances - List of available GeoServer instances (name, url, etc.).
 * @param {boolean} show - Controls whether the menu is visible or not.
 * @param {Function} storeGSInstancesDDList - Redux action to save the fetched instances to the store.
 * @param {Function} onClose - Function to close the menu, used if an error occurs.
 * @param {Function} onError - Function to show an error notification.
 * @param {Function} onSelectAll - Function called when 'Clear For All Instances' is clicked.
 * @param {Function} onSelectInstance - Function called when a specific instance is clicked.
 */
const GSCleanCacheMenu = ({
    gsInstances = [],
    show,
    storeGSInstancesDDList,
    onClose,
    onError,
    onSelectAll,
    onSelectInstance
}) => {
    const [loading, setLoading] = useState(gsInstances.length ? false : true);
    const menuRef = useRef(null);
    const handleGetGSInstances = () => {
        GeoFence.getGSInstancesForDD().then(response => {
            storeGSInstancesDDList(response.data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            onClose();
            onError({
                title: "rulesmanager.errorTitle",
                message: "rulesmanager.errorLoadingGSInstances"
            });
        }
        );

    };
    useEffect(() => {
        if (gsInstances.length) return;
        handleGetGSInstances();
    }, []);
    useEffect(() => {
        // Function to check if the click was outside the menu
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose(); // Call the close handler passed from props
            }
        };

        // Only add the listener if the menu is showing
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup the listener when the menu closes or unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onClose]);
    // Handler to wrap selection and close the menu
    const handleSelectInstance = (instance) => {
        onSelectInstance(instance);
    };

    const handleSelectAll = (e) => {
        e.stopPropagation();
        onSelectAll();
    };

    // If not showing, render null to keep DOM clean
    if (!show) return null;

    return (
        <div ref={menuRef}
            className="gs-cache-menu-container"
            style={{
                marginTop: '5px'
            }}
        >
            {loading ? <div className={`toolbar-loader ${loading ? 'ms-circle-loader-md' : ''}`}/> : (
                <Dropdown open id="gs-cache-dropdown">
                    <Dropdown.Toggle style={{ display: 'none' }} /> {/** hide arrow icon of DD */}
                    <Dropdown.Menu>
                        {/* Instance List */}
                        {gsInstances.length === 0 ? (
                            <MenuItem disabled>
                                <Message msgId="rulesmanager.noAvailGsInstances" />
                            </MenuItem>
                        ) : (
                            gsInstances.map((instance, idx) => {
                                const name = instance.name;
                                return (
                                    <MenuItem
                                        key={idx}
                                        onClick={(e) => {
                                            if (e && e.stopPropagation) e.stopPropagation();
                                            handleSelectInstance(instance);
                                        }}
                                        title={name}
                                    >
                                        {name}
                                    </MenuItem>
                                );
                            })
                        )}
                        <MenuItem divider />
                        {/* Clear All Item */}
                        <MenuItem
                            disabled={gsInstances.length === 0}
                            onClick={handleSelectAll}
                            className="gs-clear-all-item"
                        >
                            <strong><Message msgId="rulesmanager.clearAllgsInstances" /></strong>
                        </MenuItem>

                    </Dropdown.Menu>
                </Dropdown>)
            }
        </div>
    );
};
GSCleanCacheMenu.propTypes = {
    gsInstances: PropTypes.array,
    show: PropTypes.bool,
    storeGSInstancesDDList: PropTypes.func,
    onClose: PropTypes.func,
    onError: PropTypes.func,
    onSelectAll: PropTypes.func,
    onSelectInstance: PropTypes.func
};

export default GSCleanCacheMenu;
