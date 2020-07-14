<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>
      <v-btn text to="/open-layers">
        <span class="mr-2">OpenLayers</span>
      </v-btn>
      <v-btn text to="/leaf-let">
        <span class="mr-2">LeafLet</span>
      </v-btn>
      <v-btn text to="/">
        <span class="mr-2">MapBox</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    //
  }),
};
</script>
