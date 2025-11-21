/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    getDashboardId,
    isDashboardAvailable,
    isDashboardEditing,
    showConnectionsSelector,
    isShowSaveOpen,
    isShowSaveAsOpen,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors,
    buttonCanEdit,
    dashboardServicesSelector,
    selectedDashboardServiceSelector,
    dashboardCatalogModeSelector,
    dashboardIsNewServiceSelector,
    dashboardSaveServiceSelector,
    dashboardResourceInfoSelector,
    dashboardInfoDetailsUriFromIdSelector,
    dashboardInfoDetailsSettingsFromIdSelector,
    canEditServiceSelector,
    dashboardTitleSelector,
    isSidebarFullHeightOnDashboard
} from '../dashboard';

describe('dashboard selectors', () => {
    it('test isDashboardAvailable selector', () => {
        const state = {dashboard: {editor: {available: true}}};
        expect(isDashboardAvailable(state)).toBe(true);
    });
    it('test isDashboardEditing selector', () => {
        const state = { dashboard: { editing: true } };
        expect(isDashboardEditing(state)).toBe(true);
    });
    it('test showConnectionsSelector', () => {
        expect(showConnectionsSelector({
            dashboard: {
                showConnections: true
            }
        })).toBe(true);
    });
    it('isShowOpen', () => {
        expect(isShowSaveOpen({
            dashboard: {
                showSaveModal: true
            }
        })).toBe(true);
    });
    it('isShowSaveAsOpen', () => {
        expect(isShowSaveAsOpen({
            dashboard: {
                showSaveAsModal: true
            }
        })).toBe(true);
    });
    it('dashboardResource', () => {
        expect(dashboardResource({
            dashboard: {
                resource: {}
            }
        })).toExist();
    });
    it('isDashboardLoading', () => {
        expect(isDashboardLoading({
            dashboard: {
                loading: true
            }
        })).toBe(true);
    });
    it('getDashboardSaveErrors', () => {
        expect(getDashboardSaveErrors({
            dashboard: {
                saveErrors: [{}]
            }
        }).length).toBe(1);
    });
    it('test buttonCanEdit with a new dashboared', () => {
        expect(buttonCanEdit({
            router: {
                location: {
                    pathname: '/dashboard/'
                }
            }
        })).toBe(true);
    });
    it('test buttonCanEdit when load a dashboared', () => {
        expect(buttonCanEdit({
            router: {
                location: {
                    pathname: '/dashboard/0000'
                }
            }
        })).toBe(false);
        expect(buttonCanEdit({
            router: {
                location: {
                    pathname: '/dashboard/1'
                }
            }
        })).toBe(false);
    });

    it("test dashboardServicesSelector", () => {
        const services = {test: {name: 'test'}};
        expect(dashboardServicesSelector({dashboard: {services}})).toBe(services);
    });

    it("test selectedDashboardServiceSelector", () => {
        const selectedService = {name: 'test'};
        expect(selectedDashboardServiceSelector({dashboard: {selectedService}})).toBe(selectedService);
    });

    it("test dashboardCatalogModeSelector", () => {
        expect(dashboardCatalogModeSelector({dashboard: {mode: "edit"}})).toBe("edit");
    });

    it("test dashboardIsNewServiceSelector", () => {
        expect(dashboardIsNewServiceSelector({dashboard: {isNew: true}})).toBe(true);
    });

    it("test dashboardSaveServiceSelector", () => {
        expect(dashboardSaveServiceSelector({dashboard: {saveServiceLoading: true}})).toBe(true);
    });
    it("getDashboardId should return dashboard id in case it exists", () => {
        expect(getDashboardId({dashboard: {resource: {id: '1234'}}})).toBe('1234');
    });
    it("getDashboardId should return undefined in case resource does not exists", () => {
        expect(getDashboardId({dashboard: {resource: {}}})).toBe(undefined);
    });
    it("test dashboardResourceInfoSelector", () => {
        const resource = {};
        expect(dashboardResourceInfoSelector({dashboard: {
            resource: resource
        }})).toBe(resource);
    });
    it("test dashboardInfoDetailsUriFromIdSelector", () => {
        expect(dashboardInfoDetailsUriFromIdSelector({dashboard: {
            resource: {
                attributes: {
                    details: "Details"
                }
            }
        }})).toBe("Details");
    });
    it("test dashboardInfoDetailsSettingsFromIdSelector", () => {
        expect(dashboardInfoDetailsSettingsFromIdSelector({dashboard: {
            resource: {
                attributes: {
                    detailsSettings: "detailsSettings"
                }
            }
        }})).toBe("detailsSettings");
    });
    it("test dashboardTitleSelector", () => {
        expect(dashboardTitleSelector({dashboard: {
            resource: {
                name: "dashbaord title1"
            }
        }})).toBe("dashbaord title1");
    });
    describe("canEditServiceSelector", () => {
        it('test ADMIN role ', () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: ['ADMIN'],
                        editingAllowedGroups: []
                    }
                },
                security: {
                    user: {
                        role: "ADMIN"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test ALL user role", () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: ['ALL'],
                        editingAllowedGroups: []
                    }
                },
                security: {
                    user: {
                        role: "ADMIN"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test custom user role", () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: ['ROLE1'],
                        editingAllowedGroups: []
                    }
                },
                security: {
                    user: {
                        role: "ROLE1"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test user role not matching", () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: ['ADMIN'],
                        editingAllowedGroups: []
                    }
                },
                security: {
                    user: {
                        role: "ROLE1"
                    }
                }
            });
            expect(canEdit).toBe(false);
        });
        it("test group matching", () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: [],
                        editingAllowedGroups: ['group1']
                    }
                },
                security: {
                    user: {
                        role: "ROLE1",
                        groups: {
                            group: {
                                enabled: true,
                                groupName: "group1"
                            }
                        }
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test group not matching", () => {
            const canEdit = canEditServiceSelector({
                dashboard: {
                    servicesPermission: {
                        editingAllowedRoles: [],
                        editingAllowedGroups: ['group1']
                    }
                },
                security: {
                    user: {
                        role: "ROLE1",
                        groups: {
                            group: {
                                enabled: true,
                                groupName: "geo"
                            }
                        }
                    }
                }
            });
            expect(canEdit).toBe(false);
        });
    });
    describe('isSidebarFullHeightOnDashboard', () => {
        it('should return true when dashboard is available and map editor is not open', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(true);
        });
        it('should return false when dashboard is available but map editor is open with widgetInlineEditor owner', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "widgetInlineEditor"
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return true when dashboard is available and map editor is open with inlineEditor owner (geostory)', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "inlineEditor"
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(true);
        });
        it('should return false when dashboard is not available and map editor is not open', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: false
                    }
                },
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return false when dashboard is not available and map editor is open with widgetInlineEditor owner', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: false
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "widgetInlineEditor"
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return false when dashboard state is missing', () => {
            const state = {
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return true when mapEditor state is missing (defaults to closed)', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(true);
        });
        it('should return false when state is empty', () => {
            const state = {};
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return false when dashboard editor state is missing', () => {
            const state = {
                dashboard: {},
                mapEditor: {
                    open: false,
                    owner: null
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(false);
        });
        it('should return true when map editor is open but owner is not widgetInlineEditor', () => {
            const state = {
                dashboard: {
                    editor: {
                        available: true
                    }
                },
                mapEditor: {
                    open: true,
                    owner: "someOtherOwner"
                }
            };
            expect(isSidebarFullHeightOnDashboard(state)).toBe(true);
        });
    });
});
