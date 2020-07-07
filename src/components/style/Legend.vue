<template>
  <div>
    <ul>
      <li v-for="(gvStyle,index) in  gvStyles " :key="'legend-' + index">
        <v-checkbox
          v-model="gvStyle.visible"
          :off-icon="'mdi-checkbox-blank-outline'"
          :on-icon="'mdi-check-box-outline'"
          hide-details
          class="ma-0 pa-0 float-left"
          @change="$emit('toggle')"
        ></v-checkbox>
        <legend-symbol
          class="ml-0"
          :gv-style="gvStyle"
          :type-geom="typeGeom"
          @click="$emit('edit', index)"
        ></legend-symbol>
        <span>{{gvStyle.name}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import LegendSymbol from "../style/LegendSymbol";

export default {
  props: ["gvStyles", "typeGeom", "fields"],
  data: () => ({}),
  components: { LegendSymbol },
  methods: {}
};
</script>

<style>
</style>