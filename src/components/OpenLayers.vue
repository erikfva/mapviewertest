/* eslint-disable no-unused-vars */
<template>
  <div>
    <v-btn
      ref="btnDwdSHP"
      :loading="downloading"
      :disabled="downloading"
      color="blue-grey"
      class="ma-2 white--text"
      absolute
      fab
      bottom
      right
      @click="downloadShapeFile"
    >
      <v-icon dark>mdi-cloud-upload</v-icon>
    </v-btn>

    <div ref="map" class="map"></div>
  </div>
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

import geojsonObject from "../caminos.json";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

import geojsonvt from "geojson-vt";
import Geojson2Shapefile from "@/utils/Geojson2Shapefile.worker";
import { CompressBlobFiles } from "@/utils/Zip";
import SaveBlob from "@/utils/SaveBlobFile";

//import * as mapshaper from "mapshaper-es/www/mapshaper.js";

// Converts geojson-vt data to GeoJSON
// eslint-disable-next-line no-unused-vars
var replacer = function(key, value) {
  if (value && value.geometry) {
    var type;
    var rawType = value.type;
    var geometry = value.geometry;

    if (rawType === 1) {
      type = "MultiPoint";
      if (geometry.length == 1) {
        type = "Point";
        geometry = geometry[0];
      }
    } else if (rawType === 2) {
      type = "MultiLineString";
      if (geometry.length == 1) {
        type = "LineString";
        geometry = geometry[0];
      }
    } else if (rawType === 3) {
      type = "Polygon";
      if (geometry.length > 1) {
        type = "MultiPolygon";
        geometry = [geometry];
      }
    }

    return {
      type: "Feature",
      geometry: {
        type: type,
        coordinates: geometry,
      },
      properties: value.tags,
    };
  } else {
    return value;
  }
};

// eslint-disable-next-line no-unused-vars
var tileIndex = geojsonvt(geojsonObject, {
  extent: 4096,
  debug: 1,
});

// eslint-disable-next-line no-unused-vars
const tileUrlFunction = function(tileCoord) {
  console.log(tileCoord);
  var data = tileIndex.getTile(
    parseInt(tileCoord[0]),
    parseInt(tileCoord[1]),
    parseInt(tileCoord[2])
  );
  var geojson = JSON.stringify(
    {
      type: "FeatureCollection",
      features: data ? data.features : [],
    },
    replacer
  );
  //return "data:application/json;charset=UTF-8," + geojson;
  return JSON.parse(geojson);
};

export default {
  name: "OpenLayers",

  data: () => ({ downloading: false }),
  mounted() {
    let vc = this;

    vc.$nextTick(function() {
      let vectorSource = new VectorSource({
        features: new GeoJSON({
          projection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(geojsonObject),
      });
      let vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      let OSM_ = new TileLayer({
        source: new OSM(),
      });
      OSM_;

      let map = new Map({
        layers: [/* OSM_, */ vectorLayer],
        target: vc.$refs.map,
        view: new View({
          center: [-63.18117, -17.78629],
          zoom: 2,
        }),
      });

      map.updateSize();
      /*
      map.addGeojsonLayer({
        id: "testjson",
        geojson: geojsonObject,
        title: "Test JS",
      });
      */
    });
  },
  methods: {
    downloadShapeFile() {
      let vc = this;
      vc.downloading = true;
      const filename = "caminos secundarios";
      setTimeout(() => {
        Geojson2Shapefile(geojsonObject, filename)
          .then((files) => {
            CompressBlobFiles(files)
              .then((blobZip) => {
                SaveBlob(filename + ".zip", blobZip, (err) => {
                  if (err) console.log(err);
                  vc.downloading = false;
                });
              })
              .catch((reason) => {
                //error saveZipFile
                console.log(reason);
                vc.downloading = false;
              });
          })
          .catch((reason) => {
            //error Geojson2Shapefile
            console.log(reason);
            vc.downloading = false;
          });
      }, 400);
    },
  },
};
</script>
<style>
.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>
