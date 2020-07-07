import { applyCommands } from "mapshaper-es/www/mapshaper.js";

const Geojson2Shapefile = function(geojson, filename) {
  const FILENAMES = {
    TARGET: "target.geojson",
    SOURCE: "source.geojson",
    OUTPUT: "output.geojson",
  };
  const exportCommand = `
          -i ${FILENAMES.TARGET}
          -o ${FILENAMES.OUTPUT}
          format=shapefile
          encoding=utf-8
        `;
  let process = new Promise((resolve, reject) => {
    applyCommands(
      exportCommand,
      {
        [FILENAMES.TARGET]: geojson,
      },
      (err, output) => {
        if (err) {
          console.log(err);
          return reject(err);
          //mapshaper.internal.logArgs([`${err.toString()} \n`]);
        }

        // TODO: Do something with output.
        // Output is an Object that can be one ore more keys, containing encoded data.
        // Decode using new TextDecoder("utf-8").decode(output[key])

        const files = Object.entries(output).map((el) => {
          return {
            filename: el[0].replace("output", filename),
            content: el[1],
          };
        });
        console.log(files);
        return resolve(files);

        //console.log(output);
        //return output;
      }
    );
  });
  return process;
};
export default Geojson2Shapefile;
