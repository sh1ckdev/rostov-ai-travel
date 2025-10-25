import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Route } from '../services/DirectionsService';

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
}) => {
  const webViewRef = useRef<WebView>(null);

  const generateHTML = () => {
    const mapTypeToLeaflet = {
      'standard': 'OpenStreetMap.Mapnik',
      'satellite': 'OpenStreetMap.HOT',
      'hybrid': 'OpenStreetMap.DE'
    };

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
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        let userMarker = null;
        let routeLayer = null;

        // Показать местоположение пользователя
        if (${showUserLocation}) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLatLng = [position.coords.latitude, position.coords.longitude];
                        userMarker = L.marker(userLatLng)
                            .addTo(map)
                            .bindPopup('Ваше местоположение')
                            .openPopup();
                        map.setView(userLatLng, 15);
                    },
                    (error) => {
                        console.log('Geolocation error:', error);
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
        
        const routeCoordinates = ${JSON.stringify(route?.geometry?.coordinates || [])};
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