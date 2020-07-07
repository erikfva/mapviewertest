/* eslint-disable no-unused-vars */
<template>
  <div>
    <v-btn
      ref="btnDwdSHP"
      class="mb-5"
      absolute
      dark
      fab
      bottom
      right
      color="pink"
    >
      <v-icon>mdi-plus</v-icon>
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

import VectorTileSource from "ol/source/VectorTile";
import { VectorTile as VectorTileLayer } from "ol/layer";

import Projection from "ol/proj/Projection";
import geojsonvt from "geojson-vt";
import * as shpwrite from "shp-write";

console.log(shpwrite);
function justType(type, TYPE) {
  return function(gj) {
    var oftype = gj.features.filter(isType(type));
    return {
      geometries:
        TYPE === "POLYGON" || TYPE === "POLYLINE"
          ? [oftype.map(justCoords)]
          : oftype.map(justCoords),
      properties: oftype.map(justProps),
      type: TYPE,
    };
  };
}

function justCoords(t) {
  if (
    t.geometry.coordinates[0] !== undefined &&
    t.geometry.coordinates[0][0] !== undefined &&
    t.geometry.coordinates[0][0][0] !== undefined
  ) {
    return t.geometry.coordinates[0];
  } else {
    return t.geometry.coordinates;
  }
}

function justProps(t) {
  return t.properties;
}

function isType(t) {
  console.log("istype", t);
  return function(f) {
    return t.indexOf(f.geometry.type) > 0;
  };
}

shpwrite.point = justType(["Point"], "POINT");
shpwrite.line = justType(["LineString", "MultiLineString"], "POLYLINE");
shpwrite.polygon = justType(["Polygon"], "POLYGON");

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

  data: () => ({}),
  mounted() {
    let vc = this;

    vc.$nextTick(function() {
      let format = new GeoJSON({
        // Data returned from geojson-vt is in tile pixel units
        dataProjection: new Projection({
          code: "TILE_PIXELS",
          units: "tile-pixels",
          extent: [0, 0, 4096, 4096],
        }),
      });

      let vectorSource = new VectorTileSource({
        format: format,

        /*         tileLoadFunction: function(tile, url) {
          console.log("url -> " + url);

          let data = tileUrlFunction(url.split(","));
          tile.setFeatures(format.readFeatures(data));

          //const data = await response.json();
          //tile.setFeatures(format.readFeatures(data));
        }, */

        tileUrlFunction: function(tileCoord) {
          // console.log(tileCoord);
          var data = tileIndex.getTile(
            tileCoord[0],
            tileCoord[1],
            tileCoord[2]
          );
          var geojson = JSON.stringify(
            {
              type: "FeatureCollection",
              features: data ? data.features : [],
            },
            replacer
          );
          return "data:application/json;charset=UTF-8," + geojson;
        },

        overlaps: false,
        url: "{z},{x},{y}",
      });

      let vectorLayer = new VectorTileLayer({
        source: vectorSource,
      });

      vectorSource = new VectorSource({
        features: new GeoJSON({
          projection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(geojsonObject),
      });
      vectorLayer = new VectorLayer({
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

      const btnDwdSHP = vc.$refs.btnDwdSHP;
      //let downloading = false;
      btnDwdSHP.$el.addEventListener("click", () => {
        //if (downloading) return;
        //downloading = true;
        var options = {
          folder: "myshapes",
          types: {
            point: "mypoints",
            polygon: "mypolygons",
            line: "mylines",
          },
        };
        shpwrite.download(geojsonObject, options);
        // a GeoJSON bridge for features
        //console.log(shpwrite.zip(geojsonObject, options));
      });
    });
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
