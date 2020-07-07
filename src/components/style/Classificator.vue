<template>
  <v-container fluid>
    <v-row class="px-0">
      <v-col cols="1">&nbsp;</v-col>
      <v-col cols="2">Fig.</v-col>
      <v-col cols="4">Regla</v-col>
      <v-col cols="5">Nombre</v-col>
    </v-row>
    <v-row no-gutters v-for="(gvStyle,index) in  value " :key="'rule-' + index">
      <v-col cols="1">
        <v-btn v-if="value.length > 1" color="red" icon dark @click="value.splice(index,1)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="2">
        <legend-symbol :gv-style="gvStyle" :type-geom="typeGeom"></legend-symbol>
      </v-col>
      <v-col cols="4">
        <ruler v-model="gvStyle.filter" :fields="fields" />
      </v-col>
      <v-col cols="5">
        <v-text-field v-model="gvStyle.name" clearable dark dense hide-details></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { gvStylesDef } from "../../plugins/olGeovision";
import LegendSymbol from "../style/LegendSymbol";
import Ruler from "../style/Ruler";
export default {
  props: {
    value: {
      type: Array,
      default: () => [JSON.parse(JSON.stringify(gvStylesDef.default))]
    },
    fields: {
      type: Array
    },
    typeGeom: {
      type: String
    }
  },
  data() {
    return {
      //value: [JSON.parse(JSON.stringify(valueDef.default))]
    };
  },
  components: { LegendSymbol, Ruler },
  methods: {}
};
</script>

<style>
</style>