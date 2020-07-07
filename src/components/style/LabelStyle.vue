<template>
  <v-container class="grey darken-3">
    <v-tabs>
      <v-tab>Apariencia</v-tab>
      <v-tab>Formato</v-tab>
      <v-tab-item>
        <v-container>
          <v-row>
            <v-col>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-subheader>
                    <v-btn :color="fontColor" class="mx-2" x-small fab dark v-on="on"></v-btn>Color de texto
                  </v-subheader>
                </template>
                <v-color-picker
                  v-model="fontColor"
                  hide-canvas
                  show-swatches
                  hide-inputs
                  class="mx-auto"
                ></v-color-picker>
              </v-menu>
            </v-col>
            <v-col>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-subheader>
                    <v-btn :color="outlineColor" class="mx-2" x-small fab dark v-on="on"></v-btn>Color de borde
                  </v-subheader>
                </template>
                <v-color-picker
                  v-model="outlineColor"
                  hide-canvas
                  show-swatches
                  hide-inputs
                  class="mx-auto"
                ></v-color-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4" class="py-0">
              <v-select
                v-model="gvStyle.text.weight"
                :items="[{text:'Regular', value: 'normal'}, {text:'Bold', value:'bold'}]"
                label="Estilo"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="7" class="py-0">
              <v-select
                v-model="gvStyle.text.font"
                :items="fonts"
                label="Fuente"
                dense
                hide-details
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-subheader class="pl-0">Tamaño de letra</v-subheader>
              <v-slider
                v-model="gvStyle.text.size"
                min="0"
                max="100"
                thumb-label="always"
                :thumb-size="16"
                dense
                hide-details
              ></v-slider>
            </v-col>
            <v-col>
              <v-subheader class="pl-0">Grosor del borde</v-subheader>
              <v-slider
                v-model="gvStyle.text.outlineWidth"
                min="0"
                max="10"
                thumb-label="always"
                :thumb-size="16"
                dense
                hide-details
              ></v-slider>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <v-container>
          <v-row>
            <v-col cols="4">
              <v-select
                v-model="gvStyle.text.placement"
                :items="[{text:'Dentro', value: 'point'},{text:'En el borde', value: 'line'}]"
                label="Colocación"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="gvStyle.text.align"
                :items="[{text:'Centro', value: 'center'}, {text:'Izquierda', value:'left'}, {text:'Derecha', value:'right'}, {text:'Inicio', value:'start'}, {text:'Fin', value:'end'}]"
                label="Alineación"
                dense
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="gvStyle.text.type"
                :items="[{text:'Normal', value: 'normal'}, {text:'Acortado', value:'shorten'}, {text:'Ajustado', value:'wrap'}]"
                label="Forma del texto"
                dense
                hide-details
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="py-0">
              <small>Interlineado</small>
              <v-slider
                v-model="gvStyle.text.lineHeight"
                min="0"
                max="10"
                thumb-label="always"
                :thumb-size="16"
                hide-details
                class="pt-2"
              ></v-slider>
            </v-col>
            <v-col>
              <v-select
                v-model="gvStyle.text.maxresol"
                :items="scales"
                label="Escala Máxima"
                dense
                hide-details
                class="text-right"
                align="right"
              ></v-select>
            </v-col>
            <v-col>
              <v-switch
                v-model="hideOverflow"
                dense
                hide-details
                label="Ocultar sobrepuestas"
                class="ma-0 pa-0 small"
              ></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4" class="py-0">
              <v-subheader>Desplazamiento</v-subheader>
            </v-col>
            <v-col cols="4" class="py-0">
              <v-text-field
                v-model="gvStyle.text.offsetX"
                prepend-icon="mdi-minus-circle-outline"
                append-outer-icon="mdi-plus-circle-outline"
                label="X"
                dense
                class="text-right"
                @click:prepend="gvStyle.text.offsetX = parseInt(gvStyle.text.offsetX) - 1"
                @click:append-outer="gvStyle.text.offsetX = parseInt(gvStyle.text.offsetX) + 1"
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="py-0">
              <v-text-field
                v-model="gvStyle.text.offsetY"
                prepend-icon="mdi-minus-circle-outline"
                append-outer-icon="mdi-plus-circle-outline"
                label="Y"
                dense
                class="text-right"
                @click:prepend="gvStyle.text.offsetY = parseInt(gvStyle.text.offsetY) - 1"
                @click:append-outer="gvStyle.text.offsetY = parseInt(gvStyle.text.offsetY) + 1"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs>

    <div class="the-canvas">
      <canvas ref="canvas"></canvas>
    </div>
  </v-container>
</template>
<script>
//import { RGBAtoHex, HexToRGBA } from "vuetify/lib/util/colorUtils";
//import { CSStoRGBA } from "../../plugins/olGeovision";
import { asString as ol_color_asString } from "ol/color";
export default {
  props: ["gvStyle"],
  data: () => ({
    fonts: ["Arial", "'Corier New'", "'Open Sans'", "Verdana"],
    scales: [
      { text: "38,400", value: 38400 },
      { text: "19,200", value: 19200 },
      { text: "9,600", value: 9600 },
      { text: "4,800", value: 4800 },
      { text: "2,400", value: 2400 },
      { text: "1,200", value: 1200 },
      { text: "600", value: 600 },
      { text: "300", value: 300 },
      { text: "150", value: 150 },
      { text: "75", value: 75 },
      { text: "32", value: 32 },
      { text: "16", value: 16 },
      { text: "8", value: 8 }
    ]
  }),
  watch: {
    gvStyle: {
      deep: true,
      handler(v) {
        //if (this.gvStyle) this.render();
        let gvStyle = JSON.parse(JSON.stringify(v));
        this.render(gvStyle);
      }
    }
  },
  computed: {
    fontColor: {
      get() {
        return ol_color_asString(this.gvStyle.text.color);
      },
      set(v) {
        this.gvStyle.text.color = v;
      }
    },
    outlineColor: {
      get() {
        return ol_color_asString(this.gvStyle.text.outlineColor);
      },
      set(v) {
        this.gvStyle.text.outlineColor = v;
      }
    },
    hideOverflow: {
      get() {
        return !this.gvStyle.text.overflow;
      },
      set(v) {
        this.gvStyle.text.overflow = !v;
      }
    }
  },
  mounted() {
    const vc = this;
    this.$nextTick(function() {
      vc.render(this.gvStyle);
    });
  },
  methods: {
    render(gvStyle) {
      if (
        typeof this.$refs.canvas === "undefined" ||
        typeof gvStyle === "undefined"
      )
        return;

      let canvas = this.$refs.canvas;

      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font =
        gvStyle.text.weight +
        " " +
        gvStyle.text.size +
        "px '" +
        gvStyle.text.font +
        "'";
      ctx.fillStyle = gvStyle.text.color;

      ctx.strokeStyle = gvStyle.text.outlineColor;
      ctx.lineWidth = gvStyle.text.outlineWidth;
      //ctx.textAlign = "center";
      //ctx.textBaseline = "middle";
      let x = 10 + parseInt(gvStyle.text.offsetX) || 10;
      let y =
        gvStyle.text.offsetY +
        (1 - gvStyle.text.size / 100) * 10 +
        gvStyle.text.size;

      ctx.strokeText("Lorem Ipsum", x, y);
      ctx.fillText("Lorem Ipsum", x, y);
    }
  }
};
</script>
<style >
.the-canvas canvas {
  width: 100%;
}
.the-canvas {
  height: 80px;
  overflow: hidden;
  background-color: silver;
}
.text-right input {
  text-align: right !important;
}
.v-select__selection--comma {
  width: 100%;
}
.small .v-label {
  line-height: 12px !important;
}
</style>
