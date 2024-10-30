import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import 'ol/ol.css';
import './style.css'

const MapComponent = () => {
    const mapRef = useRef(null);
    const overlayRef = useRef(null);
    const popupContentRef = useRef(null);
    const overlay = useRef(null);
    const [map, setMap] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [hdms, setHdms] = useState('');
    const [clickedCoordinate, setClickedCoordinate] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [wmsLayers, setWmsLayers] = useState({
        totalM: false,
        gov: false,
        agriPoint: false,
        country: false,
        sec: false,
        ssec: false,
        agriLine: false,
        landmarkPoint: false,
        portsAirportLine: false,
        portsAirportPoly: false,
        agriArea: false,
        railwayPoint: false,
        railwayPoly: false,
        railwayLine: false,
        egyptBoundaries: false,
        transportationPoint: false,
        transportationPoly: false,
        utilitiesLine: false,
        utilitiesPoint: false,
        utilitiesPoly: false,
        waterbodyLine: false,
        waterbodyPoly: false,
        waterbodyPoint: false,
        roadsUpdate: false,
    });
    const layerNames = {
        totalM: "المباني",
        gov: "المحافظات",
        agriPoint: "نقاط زراعية",
        country: "الدولة",
        sec: "المراكز",
        ssec: "الشياخات",
        agriLine: "خطوط زراعية",
        landmarkPoint: "المعالم",
        portsAirportLine: "خطوط الموانئ والمطارات",
        portsAirportPoly: "مناطق الموانئ والمطارات",
        agriArea: "مناطق زراعية",
        railwayPoint: "نقاط السكك الحديدية",
        railwayPoly: "مناطق السكك الحديدية",
        railwayLine: "خطوط السكك الحديدية",
        egyptBoundaries: "حدود مصر",
        transportationPoint: "نقاط النقل",
        transportationPoly: "مناطق النقل",
        utilitiesLine: "خطوط المرافق",
        utilitiesPoint: "نقاط المرافق",
        utilitiesPoly: "مناطق المرافق",
        waterbodyLine: "خطوط المياه",
        waterbodyPoly: "مسطحات مائية",
        waterbodyPoint: "نقاط المياه",
        roadsUpdate: "الطرق"
    };

    useEffect(() => {
        overlay.current = new Overlay({
            element: overlayRef.current,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        });

        const newMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
                    }),
                }),
            ],
            view: new View({
                center: fromLonLat([31, 31]),
                zoom: 5.7,
            }),
            overlays: [overlay.current],
        });

        setMap(newMap);

        newMap.on('singleclick', (evt) => {
            const coordinate = evt.coordinate;
            const hdmsValue = toStringHDMS(fromLonLat(coordinate));
            setHdms(hdmsValue);
            setClickedCoordinate(coordinate);

            // Show popup immediately
            overlay.current.setPosition(coordinate);
            overlayRef.current.style.display = 'block';

            // Optional: If you still want to fetch data
            setIsLoading(true);
            sendCoordinatesToApi(coordinate);
        });

        return () => newMap.setTarget(undefined);
    }, []);

    const sendCoordinatesToApi = async (coordinate) => {
        const [x, y] = coordinate;
        const apiUrl = `http://10.100.100.41:1000/API/basemap/?X=${x}&Y=${y}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPopupData(data.length > 0 ? data[0] : null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setPopupData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        overlay.current.setPosition(undefined);
        overlayRef.current.style.display = 'none';
    };

    const handleLayerChange = (layerName) => {
        setWmsLayers(prevState => ({
            ...prevState,
            [layerName]: !prevState[layerName],
        }));
    };

    useEffect(() => {
        if (!map) return;

        const layerConfigs = [
            {
                name: 'totalM',
                url: 'http://192.168.17.106:8051/geoserver/total_m/wms',
                layerName: 'total_m',
                minZoom: 15,
                maxZoom: 25,
            },
            {
                name: 'gov',
                url: 'http://10.100.100.106:8051/geoserver/gov/wms',
                layerName: 'gov',
            },
            {
                name: 'agriPoint',
                url: 'http://10.100.100.106:8051/geoserver/agri_point/wms',
                layerName: 'agri_point',
            },
            {
                name: 'country',
                url: 'http://192.168.17.49:80/erdas-apollo/vector/country?service=WMS',
                layerName: 'country',
            },
            {
                name: 'sec',
                url: 'http://192.168.17.106:8051/geoserver/sec/wms',
                layerName: 'sec',
            },
            {
                name: 'ssec',
                url: 'http://192.168.17.106:8051/geoserver/ssec/wms',
                layerName: 'ssec',
            },
            {
                name: 'agriLine',
                url: 'http://10.100.100.106:8051/geoserver/agri_line/wms',
                layerName: 'agri_line',
            },
            {
                name: 'landmarkPoint',
                url: 'http://10.100.100.106:8051/geoserver/landmark_point/wms',
                layerName: 'landmark_point',
            },
            {
                name: 'portsAirportLine',
                url: 'http://10.100.100.106:8051/geoserver/ports_airport_line/wms',
                layerName: 'ports_airport_line',
            },
            {
                name: 'portsAirportPoly',
                url: 'http://10.100.100.106:8051/geoserver/ports_airport_poly/wms',
                layerName: 'ports_airport_poly',
            },
            {
                name: 'agriArea',
                url: 'http://10.100.100.106:8051/geoserver/agri_area/wms',
                layerName: 'agri_area',
            },
            {
                name: 'railwayPoint',
                url: 'http://10.100.100.106:8051/geoserver/railway_point/wms',
                layerName: 'railway_point',
            },
            {
                name: 'railwayPoly',
                url: 'http://10.100.100.106:8051/geoserver/railway_poly/wms',
                layerName: 'railway_poly',
            },
            {
                name: 'railwayLine',
                url: 'http://10.100.100.106:8051/geoserver/railway_line/wms',
                layerName: 'railway_line',
            },
            {
                name: 'egyptBoundaries',
                url: 'http://10.100.100.106:8051/geoserver/egypt_boundaries/wms',
                layerName: 'egypt_boundaries',
            },
            {
                name: 'transportationPoint',
                url: 'http://10.100.100.106:8051/geoserver/transportation_point/wms',
                layerName: 'transportation_point',
            },
            {
                name: 'transportationPoly',
                url: 'http://10.100.100.106:8051/geoserver/transportation_poly/wms',
                layerName: 'transportation_poly',
            },
            {
                name: 'utilitiesLine',
                url: 'http://10.100.100.106:8051/geoserver/utilities_line/wms',
                layerName: 'utilities_line',
            },
            {
                name: 'utilitiesPoint',
                url: 'http://10.100.100.106:8051/geoserver/utilities_point/wms',
                layerName: 'utilities_point',
            },
            {
                name: 'utilitiesPoly',
                url: 'http://10.100.100.106:8051/geoserver/utilities_poly/wms',
                layerName: 'utilities_poly',
            },
            {
                name: 'waterbodyLine',
                url: 'http://10.100.100.106:8051/geoserver/waterbody_line/wms',
                layerName: 'waterbody_line',
            },
            {
                name: 'waterbodyPoly',
                url: 'http://10.100.100.106:8051/geoserver/waterbody_poly/wms',
                layerName: 'waterbody_poly',
            },
            {
                name: 'waterbodyPoint',
                url: 'http://10.100.100.106:8051/geoserver/waterbody_point/wms',
                layerName: 'waterbody_point',
            },
            {
                name: 'roadsUpdate',
                url: 'http://10.100.100.106:8051/geoserver/roads_update/wms',
                layerName: 'roads_update',
            },
        ];

        layerConfigs.forEach(config => {
            const existingLayer = map.getLayers().getArray().find(layer =>
                layer.get('name') === config.name
            );

            if (wmsLayers[config.name] && !existingLayer) {
                const newLayer = new TileLayer({
                    source: new TileWMS({
                        url: config.url,
                        params: { 'LAYERS': config.layerName, 'TILED': true },
                    }),
                    minZoom: config.minZoom,
                    maxZoom: config.maxZoom,
                });
                newLayer.set('name', config.name);
                map.addLayer(newLayer);
            } else if (!wmsLayers[config.name] && existingLayer) {
                map.removeLayer(existingLayer);
            }
        });
    }, [wmsLayers, map]);

    return (
        <div>
            <button
                className="toggle-sidebar"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                style={{
                    position: 'absolute',
                    top: '80px',
                    left: '7px',
                    padding: '10px',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    zIndex: 1000,
                    background: 'rgb(128 128 128 / 0%)',
                    fontSize: '28px',
                }}
            >
                <i className="fa-solid fa-layer-group"></i>
            </button>

            {sidebarVisible && (
                <div style={{
                    position: 'absolute',
                    left: '15px',
                    top: '140px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    alignItems: 'center',
                    boxShadow: '-2px 0 5px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    direction: 'rtl'  // Add RTL direction
                }} dir="rtl" lang="ar">
                    <h3>طبقات الخريطة</h3>
                    {Object.keys(wmsLayers).map((layer) => (
                        <div key={layer}>
                            <input
                                type="checkbox"
                                id={layer}
                                checked={wmsLayers[layer]}
                                onChange={() => handleLayerChange(layer)}
                            />
                            <label htmlFor={layer}>{layerNames[layer] || layer}</label>
                        </div>
                    ))}
                </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100vh' }}></div>
            <div ref={overlayRef} className="ol-popup" style={{ display: 'none' }}>
                <a href="#" className="ol-popup-closer" onClick={closePopup}>✖</a>
                <div ref={popupContentRef}>
                    {isLoading ? (
                        <p>جارٍ تحميل البيانات...</p>
                    ) : popupData ? (
                        <>
                            <h3>معلومات المبنى</h3>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>{popupData.seragid || 'غير متوفر'}</td>
                                        <td><strong>:seragid</strong></td>
                                    </tr>
                                    <tr>
                                        <td>{popupData.gov_name || 'غير متوفر'}</td>
                                        <td><strong>:المحافظة</strong></td>
                                    </tr>
                                    <tr>
                                        <td>{popupData.sec_name || 'غير متوفر'}</td>
                                        <td><strong>:مركز</strong></td>
                                    </tr>
                                    <tr>
                                        <td>{popupData.ssec_name || 'غير متوفر'}</td>
                                        <td><strong>:الشياخة</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>لا توجد بيانات متاحة لهذه النقطة</p>
                    )}
                    <p>You clicked here:</p>
                    <h3>X: {clickedCoordinate ? clickedCoordinate[0].toFixed(6) : ''}</h3>
                    <h3>Y: {clickedCoordinate ? clickedCoordinate[1].toFixed(6) : ''}</h3>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
