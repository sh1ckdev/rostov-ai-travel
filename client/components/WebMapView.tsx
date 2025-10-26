import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { Route } from '../services/DirectionsService';
import { POI } from '../types/poi';

interface WebMapViewProps {
  style?: any;
  onLocationSelect?: (coordinate: { latitude: number; longitude: number }) => void;
  showUserLocation?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  route?: Route | null;
  children?: React.ReactNode;
  mapType?: 'standard' | 'satellite' | 'hybrid';
  mapStyle?: string;
  pois?: POI[];
  selectedPOIs?: POI[];
  onPOISelect?: (poi: POI) => void;
}

const WebMapView: React.FC<WebMapViewProps> = ({
  style,
  onLocationSelect,
  showUserLocation = true,
  initialRegion = {
    latitude: 47.2357,
    longitude: 39.7125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  route,
  mapType = 'standard',
  mapStyle = 'light',
  pois = [],
  selectedPOIs = [],
  onPOISelect,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Функция для получения URL тайлов в зависимости от стиля
  const getTileLayerUrl = (style: string) => {
    switch (style) {
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '© OpenStreetMap contributors © CartoDB'
        };
      case 'voyager':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '© OpenStreetMap contributors © CartoDB'
        };
      case 'positron':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '© OpenStreetMap contributors © CartoDB'
        };
      case 'openstreet':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors'
        };
      case 'light':
      default:
        return {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '© OpenStreetMap contributors © CartoDB'
        };
    }
  };

  const generateHTML = () => {

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.7;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .custom-poi-marker {
            transition: transform 0.2s ease;
        }
        
        .custom-poi-marker:hover {
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);
        
        const tileConfig = ${JSON.stringify(getTileLayerUrl(mapStyle))};
        L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        let userMarker = null;
        let routeLayer = null;
        let poiMarkers = [];

        // Функция для получения цвета маркера по категории
        function getMarkerColor(category) {
            const colors = {
                'ATTRACTION': '#FF6B6B',
                'RESTAURANT': '#4ECDC4',
                'HOTEL': '#45B7D1',
                'SHOPPING': '#96CEB4',
                'ENTERTAINMENT': '#FFEAA7',
                'TRANSPORT': '#DDA0DD',
                'HEALTH': '#98D8C8',
                'EDUCATION': '#F7DC6F',
                'RELIGIOUS': '#BB8FCE',
                'NATURE': '#85C1E9',
                'CULTURE': '#F8C471',
                'SPORT': '#82E0AA',
                'OTHER': '#95A5A6'
            };
            return colors[category] || '#95A5A6';
        }

        // Функция для получения иконки маркера по категории
        function getMarkerIcon(category) {
            const icons = {
                'ATTRACTION': '⭐',
                'RESTAURANT': '🍽️',
                'HOTEL': '🏨',
                'SHOPPING': '🛍️',
                'ENTERTAINMENT': '🎮',
                'TRANSPORT': '🚗',
                'HEALTH': '🏥',
                'EDUCATION': '📚',
                'RELIGIOUS': '⛪',
                'NATURE': '🌿',
                'CULTURE': '🎭',
                'SPORT': '🏃',
                'OTHER': '📍'
            };
            return icons[category] || '📍';
        }

        // Добавление маркеров POI
        const pois = ${JSON.stringify(pois)};
        const selectedPOIIds = ${JSON.stringify(selectedPOIs.map(p => p.id))};
        
        pois.forEach(poi => {
            const isSelected = selectedPOIIds.includes(poi.id);
            const markerColor = getMarkerColor(poi.category);
            const markerIcon = getMarkerIcon(poi.category);
            
            // Создаем кастомную иконку
            const customIcon = L.divIcon({
                className: 'custom-poi-marker',
                html: \`<div style="
                    background-color: \${markerColor};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 2px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    \${isSelected ? 'border: 3px solid #007AFF; transform: scale(1.2);' : ''}
                ">\${markerIcon}</div>\`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker([poi.latitude, poi.longitude], { icon: customIcon })
                .addTo(map)
                .bindPopup(\`
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">\${poi.name}</h3>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">\${poi.description}</p>
                        \${poi.rating ? \`<div style="display: flex; align-items: center; margin: 4px 0;">
                            <span style="color: #FFD700;">⭐</span>
                            <span style="margin-left: 4px; font-size: 14px;">\${poi.rating.toFixed(1)}</span>
                        </div>\` : ''}
                        \${poi.address ? \`<p style="margin: 4px 0; font-size: 12px; color: #999;">\${poi.address}</p>\` : ''}
                        <button onclick="selectPOI('\${poi.id}')" style="
                            background: #007AFF;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            cursor: pointer;
                            margin-top: 8px;
                        ">\${isSelected ? 'Убрать из маршрута' : 'Добавить в маршрут'}</button>
                    </div>
                \`);
            
            poiMarkers.push(marker);
        });

        // Функция для выбора POI
        function selectPOI(poiId) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'poiSelect',
                    poiId: poiId
                }));
            }
        }

        // Показать местоположение пользователя
        if (${showUserLocation}) {
            if (navigator.geolocation) {
                // Сначала попробуем получить текущее местоположение
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLatLng = [position.coords.latitude, position.coords.longitude];
                        const userIcon = L.divIcon({
                            className: 'user-location-marker',
                            html: \`<div style="
                                background-color: #007AFF;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                animation: pulse 2s infinite;
                            "></div>\`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        
                        userMarker = L.marker(userLatLng, { icon: userIcon })
                            .addTo(map)
                            .bindPopup('Ваше местоположение')
                            .openPopup();
                        
                        // Центрируем карту на пользователе
                        map.setView(userLatLng, 15);
                        
                        // Отправляем координаты пользователя в React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'userLocation',
                                coordinate: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                }
                            }));
                        }
                    },
                    (error) => {
                        console.log('Geolocation error:', error);
                        // Если не удалось получить местоположение, показываем сообщение
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'geolocationError',
                                error: error.message
                            }));
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
                
                // Также отслеживаем изменения местоположения
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const userLatLng = [position.coords.latitude, position.coords.longitude];
                        if (userMarker) {
                            userMarker.setLatLng(userLatLng);
                        } else {
                            const userIcon = L.divIcon({
                                className: 'user-location-marker',
                                html: \`<div style="
                                    background-color: #007AFF;
                                    width: 20px;
                                    height: 20px;
                                    border-radius: 50%;
                                    border: 3px solid white;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    animation: pulse 2s infinite;
                                "></div>\`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            });
                            
                            userMarker = L.marker(userLatLng, { icon: userIcon })
                                .addTo(map)
                                .bindPopup('Ваше местоположение');
                        }
                    },
                    (error) => {
                        console.log('Watch position error:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
            }
        }

        // Обработка кликов по карте
        map.on('click', function(e) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelect',
                    coordinate: {
                        latitude: e.latlng.lat,
                        longitude: e.latlng.lng
                    }
                }));
            }
        });

        // Обработка маршрута
        ${route ? `
        if (routeLayer) {
            map.removeLayer(routeLayer);
        }
        
        const routeCoordinates = ${JSON.stringify((route as any)?.geometry?.coordinates || [])};
        const latLngs = routeCoordinates.map(coord => [coord[1], coord[0]]);
        
        routeLayer = L.polyline(latLngs, {
            color: 'blue',
            weight: 4,
            opacity: 0.7
        }).addTo(map);
        
        map.fitBounds(routeLayer.getBounds());
        ` : ''}

        // Обработчик сообщений от React Native
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fitBounds' && data.bounds) {
                    map.fitBounds(data.bounds);
                }
            } catch (e) {
                console.log('Error parsing message:', e);
            }
        });
    </script>
</body>
</html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelect' && onLocationSelect) {
        onLocationSelect(data.coordinate);
      } else if (data.type === 'poiSelect' && onPOISelect) {
        const poi = pois.find(p => p.id === data.poiId);
        if (poi) {
          onPOISelect(poi);
        }
      } else if (data.type === 'userLocation') {
        console.log('User location updated:', data.coordinate);
      } else if (data.type === 'geolocationError') {
        console.log('Geolocation error:', data.error);
      }
    } catch (error) {
      console.log('Error parsing message from WebView:', error);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      style={style}
      source={{ html: generateHTML() }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
    />
  );
};

export default WebMapView;