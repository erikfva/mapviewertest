import OpenLayers from "./components/OpenLayers.vue";
import MapBox from "./components/MapBox.vue";
import LeafLet from "./components/LeafLet";
import NotFound from "./components/NotFound.vue";

export default [
  // Redirects to /route-one as the default route.
  {
    path: "/open-layers",
    name: "open-layers",
    component: OpenLayers,
  },
  {
    path: "/leaf-let",
    name: "leaf-let",
    component: LeafLet,
  },
  {
    path: "/",
    name: "map-box",
    component: MapBox,
  },
  {
    path: "/not-found",
    name: "not-found",
    component: NotFound,
  },

  { path: "*", redirect: "/not-found" },
];
