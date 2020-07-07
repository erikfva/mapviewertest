<template>
  <div id="map" class="map"></div>
</template>

<script>
import "core-js/stable";
import "regenerator-runtime/runtime";
import "ol/ol.css";
//import { Map } from "../plugins/olGeovision";
import Map from "ol/Map";
import View from "ol/View";

import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";

import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";

import geojsonObject from "../caminos.json";

export default {
  name: "OpenLayers",

  data: () => ({}),
  mounted() {
    let vc = this;

    vc.$nextTick(function() {
      var vectorSource = new VectorSource({
        features: new GeoJSON({
          projection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(geojsonObject),
      });

      var vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      let OSM_ = new TileLayer({
        source: new OSM(),
      });
      OSM_;

      let map = new Map({
        layers: [OSM_, vectorLayer],
        target: "map",
        view: new View({
          center: [-63.18117, -17.78629],
          zoom: 2,
        }),
      });
      map.updated();
      /*       
      map.addGeojsonLayer({
        id: "testjson",
        geojson: geojsonObject,
        title: "Test JS",
      });
      */
    });
  },
};
</script>
<style>
.map {
  width: 100%;
  height: 100%;
}
</style>
