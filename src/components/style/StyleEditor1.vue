<template>
  <div>
    <v-container class="pb-0">
      <v-row dense class="mx-4">
        <v-col cols="12" md="6">
          <label class="mr-5 float-left v-label theme--dark">Regla</label>
          <ruler v-model="gvStyle.filter" :fields="fields" class="float-left" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="gvStyle.text.field"
            :items="fields"
            label="Campo para etiqueta"
            dense
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>
    </v-container>

    <v-tabs>
      <v-tab>Simbolo</v-tab>
      <v-tab>
        <v-checkbox v-model="gvStyle.text.show" class="mx-0"></v-checkbox>Etiqueta
      </v-tab>
      <!-- SIMBOLO -->
      <v-tab-item>
        <v-card-text>
          <!-- POINT -->
          <v-row v-if="isPoint">
            <v-col cols="12">
              <point-style :gv-style="gvStyle"></point-style>
            </v-col>
          </v-row>
          <!-- FONDO -->
          <v-row dense>
            <v-col cols="2">
              <label class="v-label indigo--text theme--dark pl-0">FONDO</label>
            </v-col>
            <v-col cols="3" class="py-0">
              <label class="v-label theme--dark pl-0">Color xxx {{opacity(gvStyle.fill.color)}}</label>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn :color="fillColor" class="mx-2" x-small fab v-on="on"></v-btn>
                </template>
                <v-color-picker
                  v-model="fillColor"
                  hide-canvas
                  show-swatches
                  hide-inputs
                  class="mx-auto"
                ></v-color-picker>
              </v-menu>
            </v-col>
            <v-col cols="6" class="py-0">
              <label class="v-label theme--dark pl-0">Transp.</label>
              <v-slider
                v-model="fillOpacity"
                min="0"
                max="100"
                thumb-label="always"
                :thumb-size="16"
                dense
                hide-details
                class="pl-3"
              ></v-slider>
            </v-col>
          </v-row>
          <!-- BORDE -->
          <v-row dense>
            <v-col cols="2">
              <label class="v-label indigo--text theme--dark pl-0">BORDE</label>
            </v-col>
            <v-col cols="3" class="py-0">
              <label class="v-label theme--dark pl-0">Color</label>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn :color="borderColor" class="mx-2" x-small fab v-on="on"></v-btn>
                </template>
                <v-color-picker
                  v-model="borderColor"
                  hide-canvas
                  show-swatches
                  hide-inputs
                  class="mx-auto"
                ></v-color-picker>
              </v-menu>
            </v-col>
            <v-col cols="6" class="py-0">
              <label class="v-label theme--dark pl-0">Transp.</label>
              <v-slider
                v-model="borderOpacity"
                min="0"
                max="100"
                thumb-label="always"
                :thumb-size="16"
                dense
                hide-details
                class="pl-3"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              <v-select
                v-model="gvStyle.border.lineDash"
                :items="[
                  'solid',
                  'dot',
                  'dash',
                  'longdash',
                  'dashdot',
                  'longdashdot',
                  'shortdashdot'
                ]"
                label="Tipo"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-subheader class="pl-0">Ancho</v-subheader>
              <v-slider
                v-model="gvStyle.border.width"
                min="0"
                max="10"
                thumb-label="always"
                :thumb-size="16"
                dense
                hide-details
              ></v-slider>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              <v-select
                v-model="gvStyle.border.lineJoin"
                :items="['bevel', 'round', 'miter']"
                label="Esquinas"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="gvStyle.border.lineCap"
                :items="['butt', 'round', 'square']"
                label="Fin de línea"
                dense
                hide-details
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-tab-item>

      <!-- ETIQUETA -->
      <v-tab-item>
        <label-style v-show="gvStyle.text.show" :gv-style="gvStyle"></label-style>
      </v-tab-item>
    </v-tabs>
  </div>
</template>
<script>
import { RGBAtoHex, HexToRGBA } from "vuetify/lib/util/colorUtils";
import PointStyle from "./PointStyle";
import LabelStyle from "./LabelStyle";
import Ruler from "./Ruler";
import ObjectMerge from "@/utils/ObjectMerge";
import { gvStylesDef } from "@/plugins/olGeovision";
import { asArray, asString } from "ol/color";

function CSStoRGBA(css) {
  if (css.slice(0, 4) === "rgba") {
    let rgba = css.replace(/^rgba?\(|\s+|\)$/g, "").split(","),
      hex = `#${(
        (1 << 24) +
        (parseInt(rgba[0]) << 16) +
        (parseInt(rgba[1]) << 8) +
        parseInt(rgba[2])
      )
        .toString(16)
        .slice(1)}`;
    //return hex;
    return { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
export default {
  props: {
    typeGeom: {
      type: String,
      default: "Point"
    },
    gvStyle: {
      type: Object,
      default: () => JSON.parse(JSON.stringify(gvStylesDef.default))
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    borderColor: {
      get() {
        return this.color(
          this.gvStyle.border.color || "rgba(0,0,0,0)",
          this.gvStyle.border.opacity
        );
        /*
        if (this.gvStyle.border.color.slice(0, 4) === "rgba") {
          return RGBAtoHex(CSStoRGBA(this.gvStyle.border.color));
        }
        return this.gvStyle.border.color;
        */
      },
      set(v) {
        this.gvStyle.border.color = v;
        if (v.slice(0, 1) === "#") {
          let rgba = HexToRGBA(v);
          this.gvStyle.border.opacity = rgba.a;
        }
      }
    },
    borderOpacity: {
      get() {
        return 100 - parseInt(this.gvStyle.border.opacity * 100);
      },
      set(v) {
        this.gvStyle.border.opacity = (100 - v) / 100;
      }
    },
    fillColor: {
      get() {
        /*         return this.color(
          this.gvStyle.fill.color || "rgba(0,0,0,0)",
          this.gvStyle.fill.opacity
        ); */

        let color = this.gvStyle.fill.color || "rgba(0,0,0,0)";
        if (color.slice(0, 4) === "rgba") {
          return RGBAtoHex(CSStoRGBA(color));
        }
        return color;
      },
      set(v) {
        this.gvStyle.fill.color = v;
        if (v.slice(0, 1) === "#") {
          let rgba = HexToRGBA(v);
          this.gvStyle.fill.opacity = rgba.a;
        }
      }
    },
    fillOpacity: {
      get() {
        return 100 - parseInt(this.opacity(this.gvStyle.fill.color) * 100);
        //return 100 - parseInt(this.gvStyle.fill.opacity * 100);
      },
      set(v) {
        this.gvStyle.fill.opacity = (100 - v) / 100;
        this.gvStyle.fill.color = this.color(
          this.gvStyle.fill.color,
          this.gvStyle.fill.opacity
        );
        console.log(this.gvStyle.fill.color);
      }
    },
    isPoint: function() {
      return ["Point", "MultiPoint"].indexOf(this.typeGeom) >= 0;
    }
  },
  components: { PointStyle, LabelStyle, Ruler },
  mounted() {
    let vc = this;
    this.$nextTick(function() {
      vc.$emit("mounted", vc);
    });
  },
  methods: {
    setStyle(gvStyle) {
      this.gvStyle = ObjectMerge(
        JSON.parse(JSON.stringify(gvStylesDef.default)),
        gvStyle
      );
    },
    opacity(color) {
      let colorArr = asArray(asString(color));
      return colorArr[3];
    },
    color(color, opacity) {
      let _color = color;
      if (_color.slice(0, 4) === "rgba") {
        _color = RGBAtoHex(CSStoRGBA(_color));
      }
      let colorArr = asArray(asString(_color));
      colorArr = colorArr.slice();
      colorArr[3] = isNaN(opacity) ? 1 : opacity; // change the alpha of the color
      return RGBAtoHex(asString(colorArr));
    }
  }
};
</script>
