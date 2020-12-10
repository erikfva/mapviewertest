import { importContent } from "../mapshaper/src/io/mapshaper-import";
import exportDatasetAsFeatures from "./DatasetExport";
import { readShapefile } from "./Shapefile2Geojson.worker";
const Shapefile2Features = async function(files) {
  console.log("init Shapefile2Features");
  let input = await readShapefile(files);

  let out = importContent(input, {
    encoding: "UTF-8",
    no_topology: true,
  });

  let features = exportDatasetAsFeatures(out);
  return features;
};

export { Shapefile2Features };
