//import { applyCommands } from "mapshaper-es/www/mapshaper.js";
//*import { applyCommands } from "../mapshaper/src/cli/mapshaper-run-commands";
import { importGeoJSON } from "../mapshaper/src/geojson/geojson-import";
//import { exportShapefile } from "../mapshaper/src/shapefile/shp-export";
import { exportFileContent } from "../mapshaper/src/io/mapshaper-export";
const Geojson2Shapefile = function(geojson, filename) {
  let process = new Promise((resolve, reject) => {
    /* console.log("init importGeoJSON", new Date().toLocaleTimeString()); */
    const dataset = importGeoJSON(geojson);
    /*     console.log(
      "finish importGeoJSON",
      new Date().toLocaleTimeString(),
      dataset
    ); */
    const outShp = exportFileContent(dataset, { format: "shapefile" });
    /* console.log(
      "finish exportFileContent",
      new Date().toLocaleTimeString(),
      outShp
    ); */
    outShp.forEach((file) => {
      file.filename = file.filename.replace("layer", filename);
    });
    resolve(outShp);
  });
  return process;
};

export default Geojson2Shapefile;
