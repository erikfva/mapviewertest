<template>
  <div id="mapbox" class="map"></div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import "../assets/mapbox-gl.css";
import geojsonObject from "../caminos.json";

/* mapboxgl.accessToken = "pk.eyJ1IjoicWFzaW01NyIsImEiOiJjanZzMTN4YmYwbTJoNDRtc3lveTUycjR5In0.NHo5uv7_XQpM7fPEus_M-w"; */
export default {
  name: "MapBox",

  data: () => ({}),
  mounted() {
    let vc = this;
    vc.$nextTick(function() {
      let map = new mapboxgl.Map({
        container: "mapbox", // container id
        //style: "mapbox://styles/mapbox/outdoors-v11", // stylesheet location
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                //"https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
              ],
              tileSize: 256,
              attribution:
                'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
            }
          },
          layers: [
            {
              id: "simple-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [-63.18117, -17.78629],
        zoom: 9 // starting zoom
      });
      map.addControl(new mapboxgl.NavigationControl());

      map.on("load", function() {
        map.addSource("maine", {
          type: "geojson",
          data: geojsonObject
        });
        map.addLayer({
          id: "maine",
          type: "line",
          source: "maine",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#888",
            "line-width": 2
          }
        });
      });
    });
  }
};
</script>
<style>
.map {
  width: 100%;
  height: 100%;
}
</style>
