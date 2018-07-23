const CONFIGPROVIDER = {
    OpenStreetMap: {
        url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
            maxZoom: 19,
            maxNativeZoom: 19,
            credits: {
                text: '© OpenStreetMap, Open Street Map and contributors, CC-BY-SA',
                link: 'http://www.openstreetmap.org/copyright'
            },
            attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        },
        variants: {
            Mapnik: {},
            BlackAndWhite: {
                url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 18,
                    maxNativeZoom: 18
                }
            },
            DE: {
                url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 18,
                    maxNativeZoom: 18
                }
            },
            France: {
                url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; Openstreetmap France | {attribution.OpenStreetMap}'
                }
            },
            HOT: {
                url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                options: {
                    attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                }
            }
        }
    },
    OpenSeaMap: {
        url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        options: {
            maxNativeZoom: 18,
            attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
            credits: {
                text: 'Map data: © OpenSeaMap contributors',
                link: 'http://www.openseamap.org'
            }
        }
    },
    OpenTopoMap: {
        url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        options: {
            noCors: true,
            maxZoom: 16,
            maxNativeZoom: 16,
            attribution: 'Map data: {attribution.OpenStreetMap}, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            credits: {
                text: 'Map data: OpenStreetMap contributors CC-BY-SA',
                link: 'https://opentopomap.org'
            }
        }
    },
    Thunderforest: {
        url: '//{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
        options: {
            maxNativeZoom: 18,
            attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
            credits: {
                text: 'Map data: OpenCycleMap contributors',
                link: 'http://www.opencyclemap.org'
            },
            variant: 'cycle'
        },
        variants: {
            OpenCycleMap: 'cycle',
            Transport: {
                options: {
                    variant: 'transport',
                    maxZoom: 19,
                    maxNativeZoom: 19
                }
            },
            TransportDark: {
                options: {
                    variant: 'transport-dark',
                    maxZoom: 19,
                    maxNativeZoom: 19
                }
            },
            Landscape: 'landscape',
            Outdoors: 'outdoors'
        }
    },
    OpenMapSurfer: {
        url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
        options: {
            maxZoom: 20,
            maxNativeZoom: 20,
            variant: 'roads',
            credits: {
                text: 'MapQuest, Open Street Map and contributors, CC-BY-SA'
            },
            attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
        },
        variants: {
            Roads: 'roads',
            AdminBounds: {
                options: {
                    variant: 'adminb',
                    maxZoom: 19,
                    maxNativeZoom: 19
                }
            },
            Grayscale: {
                options: {
                    variant: 'roadsg',
                    maxZoom: 19,
                    maxNativeZoom: 19
                }
            }
        }
    },
    Hydda: {
        url: 'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
        options: {
            maxNativeZoom: 18,
            variant: 'full',
            attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
        },
        variants: {
            Full: 'full',
            Base: 'base',
            RoadsAndLabels: 'roads_and_labels'
        }
    },
    MapQuestOpen: {
            /* Mapquest does support https, but with a different subdomain:
             * https://otile{s}-s.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}
             * which makes implementing protocol relativity impossible.
             */
        url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
        options: {
            maxNativeZoom: 18,
            type: 'map',
            ext: 'jpg',
            attribution:
                    'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                    'Map data {attribution.OpenStreetMap}',
            subdomains: ['1', '2', '3', '4']
        },
        variants: {
            OSM: {},
            Aerial: {
                options: {
                    type: 'sat',
                    attribution:
                            'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                            'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
                }
            },
            HybridOverlay: {
                options: {
                    type: 'hyb',
                    ext: 'png',
                    opacity: 0.9
                }
            }
        }
    },
    MapBox: {
        url: '//api.tiles.mapbox.com/v4/{source}/{z}/{x}/{y}.png?access_token={accessToken}',
        options: {
            maxNativeZoom: 18,
            attribution:
                    'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
                    'Map data {attribution.OpenStreetMap}',
            subdomains: ['a', 'b', 'c', 'd']
        }
    },
    MapBoxStyle: {
        url: 'https://api.mapbox.com/styles/v1/mapbox/{source}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        options: {
            attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a>',
            subdomains: ['a', 'b', 'c', 'd']
        }
    },
    Stamen: {
        url: '//stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.{ext}',
        options: {
            attribution:
                    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
                    '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
                    'Map data {attribution.OpenStreetMap}',
            credits: {
                text: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA'
            },
            subdomains: ['a', 'b', 'c', 'd'],
            minZoom: 0,
            maxZoom: 20,
            maxNativeZoom: 20,
            variant: 'toner',
            ext: 'png'
        },
        variants: {
            Toner: 'toner',
            TonerBackground: 'toner-background',
            TonerHybrid: 'toner-hybrid',
            TonerLines: 'toner-lines',
            TonerLabels: 'toner-labels',
            TonerLite: 'toner-lite',
            Watercolor: {
                options: {
                    variant: 'watercolor',
                    minZoom: 1,
                    maxZoom: 16,
                    maxNativeZoom: 16
                }
            },
            Terrain: {
                options: {
                    variant: 'terrain',
                    minZoom: 4,
                    maxZoom: 18,
                    maxNativeZoom: 18,
                    bounds: [[22, -132], [70, -56]]
                }
            },
            TerrainBackground: {
                options: {
                    variant: 'terrain-background',
                    minZoom: 4,
                    maxZoom: 18,
                    maxNativeZoom: 18,
                    bounds: [[22, -132], [70, -56]]
                }
            },
            TopOSMRelief: {
                options: {
                    variant: 'toposm-color-relief',
                    ext: 'jpg',
                    bounds: [[22, -132], [51, -56]]
                }
            },
            TopOSMFeatures: {
                options: {
                    variant: 'toposm-features',
                    bounds: [[22, -132], [51, -56]],
                    opacity: 0.9
                }
            }
        }
    },
    Esri: {
        url: '//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
        options: {
            maxNativeZoom: 18,
            variant: 'World_Street_Map',
            attribution: 'Tiles &copy; Esri'
        },
        variants: {
            WorldStreetMap: {
                options: {
                    attribution:
                            '{attribution.Esri} &mdash; ' +
                            'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                }
            },
            DeLorme: {
                options: {
                    variant: 'Specialty/DeLorme_World_Base_Map',
                    minZoom: 1,
                    maxZoom: 11,
                    maxNativeZoom: 11,
                    attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
                }
            },
            WorldTopoMap: {
                options: {
                    variant: 'World_Topo_Map',
                    attribution:
                            '{attribution.Esri} &mdash; ' +
                            'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                }
            },
            WorldImagery: {
                options: {
                    variant: 'World_Imagery',
                    attribution:
                            '{attribution.Esri} &mdash; ' +
                            'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }
            },
            WorldTerrain: {
                options: {
                    variant: 'World_Terrain_Base',
                    maxZoom: 13,
                    maxNativeZoom: 13,
                    attribution:
                            '{attribution.Esri} &mdash; ' +
                            'Source: USGS, Esri, TANA, DeLorme, and NPS'
                }
            },
            WorldShadedRelief: {
                options: {
                    variant: 'World_Shaded_Relief',
                    maxZoom: 13,
                    maxNativeZoom: 13,
                    attribution: '{attribution.Esri} &mdash; Source: Esri'
                }
            },
            WorldPhysical: {
                options: {
                    variant: 'World_Physical_Map',
                    maxZoom: 8,
                    maxNativeZoom: 8,
                    attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
                }
            },
            OceanBasemap: {
                options: {
                    variant: 'Ocean_Basemap',
                    maxZoom: 13,
                    maxNativeZoom: 13,
                    attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
                }
            },
            NatGeoWorldMap: {
                options: {
                    variant: 'NatGeo_World_Map',
                    maxZoom: 16,
                    maxNativeZoom: 16,
                    attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                }
            },
            WorldGrayCanvas: {
                options: {
                    variant: 'Canvas/World_Light_Gray_Base',
                    maxZoom: 16,
                    maxNativeZoom: 16,
                    attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
                }
            }
        }
    },
    OpenWeatherMap: {
        url: 'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
        options: {
            maxZoom: 19,
            maxNativeZoom: 19,
            attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
            opacity: 0.5
        },
        variants: {
            Clouds: 'clouds',
            CloudsClassic: 'clouds_cls',
            Precipitation: 'precipitation',
            PrecipitationClassic: 'precipitation_cls',
            Rain: 'rain',
            RainClassic: 'rain_cls',
            Pressure: 'pressure',
            PressureContour: 'pressure_cntr',
            Wind: 'wind',
            Temperature: 'temp',
            Snow: 'snow'
        }
    },
    HERE: {
            /*
             * HERE maps, formerly Nokia maps.
             * These basemaps are free, but you need an API key. Please sign up at
             * http://developer.here.com/getting-started
             *
             * Note that the base urls contain '.cit' whichs is HERE's
             * 'Customer Integration Testing' environment. Please remove for production
             * envirionments.
             */
        url:
                '//{s}.{base}.maps.cit.api.here.com/maptile/2.1/' +
                'maptile/{mapID}/{variant}/{z}/{x}/{y}/256/png8?' +
                'app_id={app_id}&app_code={app_code}',
        options: {
            attribution:
                    'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
            subdomains: ['1', '2', '3', '4'],
            mapID: 'newest',
            'app_id': '<insert your app_id here>',
            'app_code': '<insert your app_code here>',
            base: 'base',
            variant: 'normal.day',
            maxZoom: 20,
            maxNativeZoom: 20
        },
        variants: {
            normalDay: 'normal.day',
            normalDayCustom: 'normal.day.custom',
            normalDayGrey: 'normal.day.grey',
            normalDayMobile: 'normal.day.mobile',
            normalDayGreyMobile: 'normal.day.grey.mobile',
            normalDayTransit: 'normal.day.transit',
            normalDayTransitMobile: 'normal.day.transit.mobile',
            normalNight: 'normal.night',
            normalNightMobile: 'normal.night.mobile',
            normalNightGrey: 'normal.night.grey',
            normalNightGreyMobile: 'normal.night.grey.mobile',

            carnavDayGrey: 'carnav.day.grey',
            hybridDay: {
                options: {
                    base: 'aerial',
                    variant: 'hybrid.day'
                }
            },
            hybridDayMobile: {
                options: {
                    base: 'aerial',
                    variant: 'hybrid.day.mobile'
                }
            },
            pedestrianDay: 'pedestrian.day',
            pedestrianNight: 'pedestrian.night',
            satelliteDay: {
                options: {
                    base: 'aerial',
                    variant: 'satellite.day'
                }
            },
            terrainDay: {
                options: {
                    base: 'aerial',
                    variant: 'terrain.day'
                }
            },
            terrainDayMobile: {
                options: {
                    base: 'aerial',
                    variant: 'terrain.day.mobile'
                }
            }
        }
    },
    Acetate: {
        url: 'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
        options: {
            attribution:
                    '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
            subdomains: ['0', '1', '2', '3'],
            minZoom: 2,
            maxZoom: 18,
            maxNativeZoom: 18,
            variant: 'acetate-base'
        },
        variants: {
            basemap: 'acetate-base',
            terrain: 'terrain',
            all: 'acetate-hillshading',
            foreground: 'acetate-fg',
            roads: 'acetate-roads',
            labels: 'acetate-labels',
            hillshading: 'hillshading'
        }
    },
    FreeMapSK: {
        url: 'http://t{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
        options: {
            minZoom: 8,
            maxZoom: 16,
            maxNativeZoom: 16,
            subdomains: ['1', '2', '3', '4'],
            bounds: [[47.204642, 15.996093], [49.830896, 22.576904]],
            attribution:
                    '{attribution.OpenStreetMap}, vizualization CC-By-SA 2.0 <a href="http://freemap.sk">Freemap.sk</a>'
        }
    },
    MtbMap: {
        url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
        options: {
            maxNativeZoom: 18,
            attribution:
                    '{attribution.OpenStreetMap} &amp; USGS'
        }
    },
    CartoDB: {
        url: 'http://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
        options: {
            attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: ['a', 'b', 'c', 'd'],
            maxZoom: 19,
            maxNativeZoom: 19,
            variant: 'light_all'
        },
        variants: {
            Positron: 'light_all',
            PositronNoLabels: 'light_nolabels',
            PositronOnlyLabels: 'light_only_labels',
            DarkMatter: 'dark_all',
            DarkMatterNoLabels: 'dark_nolabels',
            DarkMatterOnlyLabels: 'dark_only_labels'
        }
    },
    HikeBike: {
        url: 'http://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
        options: {
            maxZoom: 19,
            maxNativeZoom: 19,
            attribution: '{attribution.OpenStreetMap}',
            variant: 'hikebike'
        },
        variants: {
            HikeBike: {},
            HillShading: {
                options: {
                    maxZoom: 15,
                    maxNativeZoom: 15,
                    variant: 'hillshading'
                }
            }
        }
    },
    BasemapAT: {
        url: '//maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
        options: {
            maxZoom: 19,
            maxNativeZoom: 19,
            attribution: 'Datenquelle: <a href="www.basemap.at">basemap.at</a>',
            subdomains: ['', '1', '2', '3', '4'],
            format: 'png',
            bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
            variant: 'geolandbasemap'
        },
        variants: {
            basemap: 'geolandbasemap',
            grau: 'bmapgrau',
            overlay: 'bmapoverlay',
            highdpi: {
                options: {
                    variant: 'bmaphidpi',
                    format: 'jpeg'
                }
            },
            orthofoto: {
                options: {
                    variant: 'bmaporthofoto30cm',
                    format: 'jpeg'
                }
            }
        }
    },
    NASAGIBS: {
        url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}9/{z}/{y}/{x}.{format}',
        options: {
            attribution:
                    'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
                    '(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
            credits: {
                text: 'Black Marble imagery courtesy NASA Earth Observatory'
            },
            bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
            minZoom: 1,
            maxZoom: 9,
            maxNativeZoom: 9,
            format: 'jpg',
            time: '',
            tilematrixset: 'GoogleMapsCompatible_Level'
        },
        variants: {
            ModisTerraTrueColorCR: 'MODIS_Terra_CorrectedReflectance_TrueColor',
            ModisTerraBands367CR: 'MODIS_Terra_CorrectedReflectance_Bands367',
            ViirsEarthAtNight2012: {
                url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}8/{z}/{y}/{x}.{format}',
                options: {
                    variant: 'VIIRS_CityLights_2012',
                    maxZoom: 8,
                    maxNativeZoom: 8
                }
            },
            ModisTerraLSTDay: {
                url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}7/{z}/{y}/{x}.{format}',
                options: {
                    variant: 'MODIS_Terra_Land_Surface_Temp_Day',
                    format: 'png',
                    maxZoom: 7,
                    maxNativeZoom: 7,
                    opacity: 0.75
                }
            },
            ModisTerraSnowCover: {
                url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}8/{z}/{y}/{x}.{format}',
                options: {
                    variant: 'MODIS_Terra_Snow_Cover',
                    format: 'png',
                    maxZoom: 8,
                    maxNativeZoom: 8,
                    opacity: 0.75
                }
            },
            ModisTerraAOD: {
                url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}6/{z}/{y}/{x}.{format}',
                options: {
                    variant: 'MODIS_Terra_Aerosol',
                    format: 'png',
                    maxZoom: 6,
                    maxNativeZoom: 6,
                    opacity: 0.75
                }
            },
            ModisTerraChlorophyll: {
                url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}7/{z}/{y}/{x}.{format}',
                options: {
                    variant: 'MODIS_Terra_Chlorophyll_A',
                    format: 'png',
                    maxZoom: 7,
                    maxNativeZoom: 7,
                    opacity: 0.75
                }
            }
        }
    },
    NLS: {
            // Maps from http://maps.nls.uk/geo/explore/
        url: '//nls-{s}.tileserver.com/{variant}/{z}/{x}/{y}.jpg',
        options: {
            attribution: '<a href="http://geo.nls.uk/maps/">National Library of Scotland Historic Maps</a>',
            bounds: [[49.6, -12], [61.7, 3]],
            minZoom: 1,
            maxZoom: 18,
            maxNativeZoom: 18,
            subdomains: ['0', '1', '2', '3']
        },
        variants: {
                // OS 1:1m to 1:10K, 1900s
                //   z0-10 - 1:1m
                //  z11-12 - ?
                //  z13-14 - one inch (1:63360)
                //  z15-18 - six inch (1:10560)
            'OS_1900': 'NLS_API',
                // OS 1:1m to 1:63K, 1920s-1940s
                //   z0-9  - 1:1m
                //  z10-11 - quarter inch (1:253440)
                //  z12-18 - one inch (1:63360)
            'OS_1920': 'nls',
            'OS_opendata': {
                url: 'http://geo.nls.uk/maps/opendata/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 16,
                    maxNativeZoom: 16
                }
            },
                // OS six inch, 1843 - 1882
            'OS_6inch_1st': {
                url: 'http://geo.nls.uk/maps/os/six_inch/{z}/{x}/{y}.png',
                options: {
                    tms: true,
                    minZoom: 6,
                    maxZoom: 16,
                    maxNativeZoom: 16,
                    bounds: [[49.86261, -8.66444], [60.89421, 1.7785]]
                }
            },
                // OS six inch, 1888 - 1913
            'OS_6inch': 'os_6_inch_gb',
                // OS 1:25000, 1937 - 1961
            'OS_25k': '25k',
                // OS one inch, 1945 - 1947
            'OS_npe': {
                url: 'http://geo.nls.uk/maps/os/newpopular/{z}/{x}/{y}.png',
                options: {
                    tms: true,
                    minZoom: 3,
                    maxZoom: 15,
                    maxNativeZoom: 15
                }
            },
                // OS one inch, 1952 - 1961
            'OS_7th': 'os7gb',
                // OS 1:1056, 1893 - 1896
            'OS_London': {
                options: {
                    variant: 'London_1056',
                    minZoom: 9,
                    maxNativeZoom: 9,
                    bounds: [[51.177621, -0.708618], [51.618016, 0.355682]]
                }
            },
            'GSGS_Ireland': {
                url: 'http://geo.nls.uk/maps/ireland/gsgs4136/{z}/{x}/{y}.png',
                options: {
                    tms: true,
                    minZoom: 5,
                    maxZoom: 15,
                    maxNativeZoom: 15,
                    bounds: [[51.371780, -10.810546], [55.422779, -5.262451]]
                }
            }
        }
    }
};
module.exports = CONFIGPROVIDER;
