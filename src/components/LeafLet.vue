<template>
  <div id="map" class="map"></div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
import geojsonObject from "../caminos.json";

export default {
  name: "LeafLet",

  data: () => ({}),
  mounted() {
    let vc = this;

    vc.$nextTick(function() {
      const map = L.map("map");
      const defaultCenter = [-17.78629, -63.18117];
      const defaultZoom = 15;
      const basemap = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        }
      );
      const marker = L.marker(defaultCenter);

      map.setView(defaultCenter, defaultZoom);

      basemap.addTo(map);
      L.geoJSON(geojsonObject).addTo(map);
      marker.addTo(map);
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
