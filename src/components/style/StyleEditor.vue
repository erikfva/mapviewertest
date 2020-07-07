<template>
  <div>
    <v-container>
      <!-- RULE -->
      <v-row dense class="mx-4">
        <v-col cols="6" class="pt-3">
          <label class="mr-5 float-left v-label theme--dark">Regla</label>
          <ruler v-model="value.filter" :fields="fields" class="float-left" />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="value.text.field"
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
      <v-tab class="lime--text">Simbolo</v-tab>
      <v-tab class="orange--text">
        <v-btn @click="value.text.show = !value.text.show" text icon>
          <v-icon color="primary" v-if="value.text.show">mdi-eye</v-icon>
          <v-icon v-if="!value.text.show">mdi-eye-off</v-icon>
        </v-btn>Etiqueta
      </v-tab>
      <!-- SIMBOLO -->
      <v-tab-item>
        <v-container>
          <!-- COLOR -->
          <v-row dense>
            <v-col cols="6">
              <label class="font-weight-black">Fondo</label>
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
                  v-on:input="value.fill.color = $event; value.fill.opacity = 1"
                ></v-color-picker>
              </v-menu>

              <v-menu offset-y max-width="60">
                <template v-slot:activator="{ on }">
                  <v-btn class="mx-2" x-small v-on="on">{{fillOpacity}}%</v-btn>
                </template>
                <v-slider
                  v-model="fillOpacity"
                  min="0"
                  max="100"
                  thumb-label="always"
                  :thumb-size="16"
                  hide-details
                  vertical
                  class="pt-8 pb-5"
                  @change="value.fill.opacity = $event/100; updateColor(value)"
                ></v-slider>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <label class="font-weight-black">Borde</label>
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
                  v-on:input="value.border.color = $event; value.border.opacity = 1"
                ></v-color-picker>
              </v-menu>

              <v-menu offset-y max-width="60">
                <template v-slot:activator="{ on }">
                  <v-btn class="mx-2" x-small v-on="on">{{borderOpacity}}%</v-btn>
                </template>
                <v-slider
                  v-model="borderOpacity"
                  min="0"
                  max="100"
                  thumb-label="always"
                  :thumb-size="16"
                  hide-details
                  vertical
                  class="pt-8 pb-5"
                  @change="value.border.opacity = $event/100; updateColor(value)"
                ></v-slider>
              </v-menu>
            </v-col>
          </v-row>
          <!-- LINE -->
          <v-row>
            <v-col v-if="isPoint" cols="6">
              <v-select
                v-model="value.icon.form"
                label="Forma del punto"
                :items="['none', 'circle', 'poi', 'bubble', 'marker', 'coma','shield', 'blazon', 'bookmark', 'hexagon', 'diamond', 'triangle', 'sign', 'ban', 'lozenge', 'square']"
                dense
                hide-details
              >
                <template v-slot:append-outer>
                  <v-menu offset-y max-width="60">
                    <template v-slot:activator="{ on }">
                      <div class="mt-n4">
                        <label class="v-label v-label--active theme--dark small">Tamano</label>
                        <v-btn class="mx-2 text-capitalize" x-small v-on="on">{{value.icon.size}}px</v-btn>
                      </div>
                    </template>
                    <v-slider
                      v-model="value.icon.size"
                      min="0"
                      max="20"
                      thumb-label="always"
                      :thumb-size="16"
                      hide-details
                      vertical
                      class="pt-8 pb-5"
                    ></v-slider>
                  </v-menu>
                </template>
              </v-select>
            </v-col>
            <v-col :cols="isPoint?6:12">
              <v-select
                v-model="value.border.lineDash"
                :items="[
                  'solid',
                  'dot',
                  'dash',
                  'longdash',
                  'dashdot',
                  'longdashdot',
                  'shortdashdot'
                ]"
                label="Tipo de línea"
                dense
                hide-details
              >
                <template v-slot:append-outer>
                  <v-menu offset-y max-width="60">
                    <template v-slot:activator="{ on }">
                      <div class="mt-n4">
                        <label class="v-label v-label--active theme--dark small">Grosor</label>
                        <v-btn
                          class="mx-2 text-capitalize"
                          x-small
                          v-on="on"
                        >{{value.border.width}}px</v-btn>
                      </div>
                    </template>
                    <v-slider
                      v-model="value.border.width"
                      min="0"
                      max="10"
                      thumb-label="always"
                      :thumb-size="16"
                      hide-details
                      vertical
                      class="pt-8 pb-5"
                    ></v-slider>
                  </v-menu>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="value.border.lineJoin"
                :items="['bevel', 'round', 'miter']"
                label="Esquinas"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="value.border.lineCap"
                :items="['butt', 'round', 'square']"
                label="Fin de línea"
                dense
                hide-details
              ></v-select>
            </v-col>
          </v-row>
          <!-- POINT SYMBOL -->
          <v-row v-if="isPoint">
            <v-col cols="12">
              <point-style :gv-style="value"></point-style>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      <!-- ETIQUETA -->
      <v-tab-item>
        <label-style v-show="value.text.show" :gv-style="value"></label-style>
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
    value: {
      type: Object,
      default: () => JSON.parse(JSON.stringify(gvStylesDef.default))
    },
    typeGeom: {
      type: String,
      default: "Point"
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    fillColor: "",
    fillOpacity: 100,
    borderColor: "",
    borderOpacity: 100
  }),
  watch: {
    value: {
      deep: true,
      handler(v) {
        //console.log("change");
        this.updateColor(v);
      }
    }
  },
  computed: {
    isPoint: function() {
      return ["Point", "MultiPoint"].indexOf(this.typeGeom) >= 0;
    }
  },
  components: { PointStyle, LabelStyle, Ruler },
  mounted() {
    let vc = this;
    this.$nextTick(function() {
      vc.updateColor(vc.value);
      vc.$emit("mounted", vc);
    });
  },
  methods: {
    opacity(color) {
      let colorArr = asArray(asString(color));
      return colorArr[3];
    },
    color(color, opacity) {
      let _color = color;
      /*       if (_color.slice(0, 4) === "rgba") {
        _color = RGBAtoHex(CSStoRGBA(_color));
      } */
      let colorArr = asArray(asString(_color));
      colorArr = colorArr.slice();
      colorArr[3] = isNaN(opacity) ? 1 : opacity; // change the alpha of the color
      return RGBAtoHex(CSStoRGBA(asString(colorArr)));
    },
    updateColor(v) {
      this.fillOpacity = v.fill ? parseInt(v.fill.opacity * 100) : 0;
      this.fillColor = v.fill ? this.color(v.fill.color, v.fill.opacity) : "";
      this.borderOpacity = v.border ? parseInt(v.border.opacity * 100) : 0;
      this.borderColor = v.border
        ? this.color(v.border.color, v.border.opacity)
        : "";
    }
  }
};
</script>
