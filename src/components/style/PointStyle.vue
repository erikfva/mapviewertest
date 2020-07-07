<template>
  <div>
    <v-row dense>
      <v-col cols="8" class="py-0">
        <v-row dense>
          <v-col cols="6">
            <v-switch v-model="useSymbol" hide-details dense label="Usar figura" class="ma-0 pa-0"></v-switch>
          </v-col>
          <v-col cols="6" v-show="useSymbol">
            <span class="pl-0 float-left">Color</span>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn :color="symbolColor" class="mx-2 float-left" x-small fab dark v-on="on"></v-btn>
              </template>
              <v-color-picker
                v-model="symbolColor"
                hide-canvas
                show-swatches
                hide-inputs
                class="mx-auto"
              ></v-color-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-slider
          v-show="useSymbol"
          v-model="fontScale"
          min="0"
          max="100"
          label="Escala"
          thumb-label="always"
          :thumb-size="18"
          hide-details
          class="mt-2"
        ></v-slider>
      </v-col>
      <v-col v-show="useSymbol" cols="4" class="small">
        <v-switch
          v-model="gvStyle.icon.gradient"
          dense
          hide-details
          label="Gradiente"
          class="ma-0 pa-0"
        ></v-switch>
        <v-switch v-model="gvStyle.icon.shadow" hide-details dense label="Sombra" class="ma-0 pa-0"></v-switch>
        <v-switch
          v-model="gvStyle.icon.offset"
          hide-details
          dense
          label="Desplazado"
          class="ma-0 pa-0"
        ></v-switch>
        <v-switch
          v-model="gvStyle.icon.rotateWithView"
          hide-details
          dense
          label="Autorotar"
          class="ma-0 pa-0"
        ></v-switch>
      </v-col>
    </v-row>
    <v-tabs v-show="useSymbol">
      <v-tab v-for="(style, index) in fs" :key="'tab-' + index">
        {{
        style.font
        }}
      </v-tab>

      <v-tab-item v-for="(style, index) in fs" :key="'tab-item-' + index">
        <a
          v-for="icon in style.icons"
          class="pa-1"
          :key="icon.key"
          @click="gvStyle.icon.theGlyph = icon.key"
        >
          <i
            :class="[`fa ${icon.key}`, {'title v-btn--outlined orange--text': gvStyle.icon.theGlyph == icon.key}]"
            :title="icon.name"
            :key="'icon-' + icon.name"
          ></i>
        </a>
      </v-tab-item>
    </v-tabs>
  </div>
</template>
<script>
/*
import { ol_style_FontSymbol as FontAwesome } from "ol-ext/style/FontAwesomeDef";
import ol_style_FontSymbol from "ol-ext/style/FontMakiDef";
import "./css/fontmaki.css";
*/
import ol_style_FontSymbol from "ol-ext/style/FontSymbol";

export default {
  props: ["gvStyle"],
  data: function() {
    return {
      glyphs: ol_style_FontSymbol.prototype.defs.glyphs,
      fonts: ol_style_FontSymbol.prototype.defs.fonts,
      theGlyph: this.gvStyle.icon.theGlyph
    };
  },
  computed: {
    fs() {
      let vc = this;
      let data = [];
      for (var font in vc.fonts) {
        let icons = [];
        for (var i in vc.glyphs) {
          if (vc.glyphs[i].font == font) {
            icons.push(Object.assign(vc.glyphs[i], { key: i }));
          }
        }
        if (icons.length) data.push({ font, icons });
      }
      return data;
    },
    symbolColor: {
      get() {
        if (this.gvStyle.icon.symbolColor.slice(0, 4) === "rgba") {
          return RGBAtoHex(CSStoRGBA(this.gvStyle.icon.symbolColor));
        }
        return this.gvStyle.icon.symbolColor;
      },
      set(v) {
        this.gvStyle.icon.symbolColor = v;
      }
    },
    fontScale: {
      get() {
        return parseInt(this.gvStyle.icon.fontSize * 100);
      },
      set(v) {
        this.gvStyle.icon.fontSize = v / 100;
      }
    },
    useSymbol: {
      get() {
        return this.gvStyle.icon.theGlyph != "";
      },
      set(v) {
        if (v)
          this.gvStyle.icon.theGlyph =
            this.theGlyph == "" ? "maki2-marker-stroked" : this.theGlyph;
        if (!v) {
          this.theGlyph = this.gvStyle.icon.theGlyph;
          this.gvStyle.icon.theGlyph = "";
        }
      }
    }
  }
};
</script>
<style>
.v-window-item,
.v-tabs-slider-wrapper,
.v-slide-group__content {
  transition: none !important;
}
.small .v-input--selection-controls,
.small .v-input__slot,
.small .v-input--selection-controls__input {
  margin: 0px !important;
  padding: 0px;
}
.small .v-input--switch__thumb {
  width: 15px !important;
  height: 15px !important;
}
.small .v-input--switch__track {
  height: 9px !important;
  width: 28px !important;
}
</style>
