<template>
  <div @click="$emit('click')">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { gvStylesFunction } from "@/plugins/olGeovision.js";

import { toContext } from "ol/render";
import ol_geom_Polygon from "ol/geom/Polygon";
import ol_geom_Point from "ol/geom/Point";
import ol_geom_LineString from "ol/geom/LineString";
import { DEVICE_PIXEL_RATIO as ol_has_DEVICE_PIXEL_RATIO } from "ol/has";
export default {
  props: ["gvStyle", "typeGeom"],
  data: () => ({}),
  //https://stackoverflow.com/questions/42133894/vue-js-how-to-properly-watch-for-nested-data#42134176
  watch: {
    gvStyle: {
      deep: true,
      handler(v) {
        //if (this.gvStyle) this.render();
        let gvStyle = JSON.parse(JSON.stringify(v));
        this.render(gvStyle);
      },
    },
  },

  mounted() {
    const vc = this;
    this.$nextTick(function() {
      vc.render(this.gvStyle);
    });

    //this.$el.append(symbol);
  },

  methods: {
    render(gvStyle) {
      //https://github.com/openlayers/openlayers/blob/fd44f0d4cbcf6f2615bb973bf1a73f18979d98ca/test/spec/ol/render.test.js
      if (
        typeof gvStyle === "undefined" ||
        typeof this.$refs.canvas === "undefined"
      )
        return;

      //let style = gvStylesFunction(f, 300, gvStyle);
      let style = gvStylesFunction(
        null,
        300,
        Array.isArray(gvStyle) ? gvStyle : [gvStyle]
      );

      const canvas = this.$refs.canvas;
      const pixelRatio = ol_has_DEVICE_PIXEL_RATIO;
      const size = [25, 25];
      const render = toContext(canvas.getContext("2d"), {
        pixelRatio: pixelRatio,
        size: size,
      });

      render.setStyle(style);
      //vectorContext.drawGeometry(new ol_geom_Polygon([[[cx-sx, cy-sy], [cx+sx, cy-sy], [cx+sx, cy+sy], [cx-sx, cy+sy], [cx-sx, cy-sy]]]));
      console.log(this.typeGeom);
      switch (this.typeGeom) {
        case ol_geom_Point:
        case "Point":
        case "MultiPoint":
          render.drawGeometry(new ol_geom_Point([10, 10]));
          break;
        case ol_geom_LineString:
        case "LineString":
        case "MultiLineString":
          render.drawGeometry(
            new ol_geom_LineString([
              [0, 0],
              [20, 20],
            ])
          );

          break;
        case ol_geom_Polygon:
        case "Polygon":
        case "MultiPolygon":
          render.drawGeometry(
            new ol_geom_Polygon([
              [
                [20, 1],
                [1, 1],
                [1, 20],
                [20, 20],
                [20, 1],
              ],
            ])
          );
          break;
      }
    },
  }, //end methods
};
</script>
