import {
  LngLat,
  type MapLayerMouseEvent,
  type RequestTransformFunction,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RLayer, RMap, RSource, useMap, RPopup } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { getAdresserFromSearchText } from '../api/getAdresserFromSearchText';
import { getBygningAtPunkt } from '../api/getBygningAtPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import { SearchBar, type Address } from './SearchBar';
import DrawComponent from './DrawComponent';

import type { GeoJSON } from 'geojson';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

const KVP_BASE_URL = 'https://kvp.maps.norkart.no/mvt/';

type NorkartBasemapVariant =
  | 'standard'
  | 'standard-without-text'
  | 'greyscale'
  | 'greyscale-without-text'
  | 'darkmode'
  | 'transparent'
  | 'hybrid'
  | 'ortofoto';
const NORKART_BASEMAP_VARIANT: NorkartBasemapVariant = 'standard';

const NORKART_BASEMAP_STYLE = `${KVP_BASE_URL}norkart-basemap/${NORKART_BASEMAP_VARIANT}/style.json`;

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);

  const [address, setAddress] = useState<Address | null>(null); // <--- Legg til dette!

  useEffect(() => {
    console.log(pointHoyde, clickPoint);
  }, [clickPoint, pointHoyde]);

  const [bygningsOmriss, setBygningsOmriss] = useState<GeoJSON | undefined>(undefined);

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const hoyder = await getHoydeFromPunkt(e.lngLat.lng, e.lngLat.lat);
    setPointHoydeAtPunkt(hoyder[0].Z);
    setClickPoint(new LngLat(e.lngLat.lng, e.lngLat.lat));
    
    const bygningResponse = await getBygningAtPunkt(e.lngLat.lng, e.lngLat.lat)
    console.log(bygningResponse)
    
    if (bygningResponse?.FkbData?.BygningsOmriss) {
        const geoJsonObject = JSON.parse(bygningResponse.FkbData.BygningsOmriss);
        setBygningsOmriss(geoJsonObject);
        console.log(geoJsonObject);

    } else {
        setBygningsOmriss(undefined);
    }
  };

  const polygonStyle = {
    "fill-outline-color": "rgba(0,0,0,0.1)",
    "fill-color":  "rgba(18, 94, 45, 0.41)"
  }

  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={12}
      mapStyle={NORKART_BASEMAP_STYLE}
      initialTransformRequest={transformRequest}
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      <Overlay>
        <h2>Dette er et overlay</h2>
        <p>Legg til funksjonalitet knyttet til kartet.</p>
        <SearchBar setAddress={setAddress}/> 
      </Overlay>
      {
        clickPoint && (
          <RPopup longitude={clickPoint?.lng} latitude={clickPoint?.lat}>
          {clickPoint?.lng}, {clickPoint?.lat}, {pointHoyde}
        </RPopup>
        )
      }
        
      {address && (
        <MapFlyTo
          lng={address.PayLoad.Posisjon.X}
          lat={address.PayLoad.Posisjon.Y}
        />
      )}
      
      {bygningsOmriss &&
         <>
            <RSource id="bygning" type="geojson" data={bygningsOmriss} />
            <RLayer
               source="bygning"
               id="bygning-fill"
               type="fill"
               paint={polygonStyle}
            />
         </>
      }
      <DrawComponent />
      
    </RMap>
  );
};

function MapFlyTo({ lng, lat }: { lng: number; lat: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lng, lat], zoom: 20, speed: 10 });
  }, [lng, lat, map]);

  return null;
}

const transformRequest: RequestTransformFunction = (url) => {
  if (!url.startsWith(KVP_BASE_URL)) {
    return { url };
  }

  const apiKey = import.meta.env.VITE_API_KEY;
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${encodeURIComponent(apiKey)}` };
};
