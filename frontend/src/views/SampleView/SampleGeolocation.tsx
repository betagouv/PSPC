import maplibregl from 'maplibre-gl';
import { useMemo, useState } from 'react';
import Map, {
  FullscreenControl,
  Marker,
  MarkerDragEvent,
  NavigationControl,
} from 'react-map-gl/maplibre';
import { Geolocation } from 'shared/schema/Sample/Sample';
import config from 'src/utils/config';
interface Props {
  sampleId?: string;
  location?: Geolocation;
  onLocationChange: (coordinates: Geolocation) => void;
}

type ViewStyle = 'map' | 'satellite';

const ViewStyles: Record<ViewStyle, string | undefined> = {
  map: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
  satellite: config.satelliteStyle,
};

const SampleGeolocation = ({ sampleId, location, onLocationChange }: Props) => {
  const [mapLatitude, setMapLatitude] = useState<number>(
    location ? location.x : 46
  );
  const [mapLongitude, setMapLongitude] = useState<number>(
    location ? location.y : 2.3522
  );
  const [mapZoom, setMapZoom] = useState<number>(location ? 15 : 5);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('map');
  const [isSecondaryMapHovered, setIsSecondaryMapHovered] = useState(false);

  const marker = useMemo(() => {
    return (
      location ?? {
        x: 46,
        y: 2.3522,
      }
    );
  }, [location]);

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    onLocationChange({
      x: Number(event.lngLat.lat.toFixed(6)),
      y: Number(event.lngLat.lng.toFixed(6)),
    });
  };

  return (
    <Map
      attributionControl={false}
      id="sampleLocationMap"
      latitude={mapLatitude}
      longitude={mapLongitude}
      zoom={mapZoom}
      mapLib={maplibregl}
      mapStyle={ViewStyles[viewStyle]}
      onZoom={(e) => setMapZoom(e.viewState.zoom)}
      onMove={(e) => {
        setMapLatitude(e.viewState.latitude);
        setMapLongitude(e.viewState.longitude);
      }}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <FullscreenControl position="bottom-right" />
      <Marker
        longitude={marker.y}
        latitude={marker.x}
        anchor="bottom"
        draggable
        onDrag={onMarkerDragEnd}
      />
      {ViewStyles['satellite'] && (
        <Map
          attributionControl={false}
          id="sampleLocationMapLayer"
          latitude={mapLatitude}
          longitude={mapLongitude}
          zoom={mapZoom}
          scrollZoom={false}
          dragPan={false}
          doubleClickZoom={false}
          style={{
            height: 50,
            width: 50,
            margin: 10,
            borderRadius: 5,
            border: `white solid ${isSecondaryMapHovered ? '2px' : '1px'}`,
            bottom: 0,
            position: 'absolute',
            cursor: 'grab',
          }}
          mapLib={maplibregl}
          mapStyle={ViewStyles[viewStyle === 'map' ? 'satellite' : 'map']}
          onClick={(e) => {
            e.preventDefault();
            setViewStyle(viewStyle === 'map' ? 'satellite' : 'map');
          }}
          onMouseOver={() => setIsSecondaryMapHovered(true)}
          onMouseOut={() => setIsSecondaryMapHovered(false)}
        />
      )}
    </Map>
  );
};

export default SampleGeolocation;
