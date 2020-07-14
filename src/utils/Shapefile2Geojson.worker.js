import { getFileExtension } from "../mapshaper/src/utils/mapshaper-filename-utils";
import { importContent } from "../mapshaper/src/io/mapshaper-import";
//import { exportFileContent } from "../mapshaper/src/io/mapshaper-export";
import { exportDatasetAsGeoJSON } from "../mapshaper/src/geojson/geojson-export";

const readFileContent = function(file, opt) {
  let defautOpt = { text: false, encode: "UTF-8" };

  opt = opt ? Object.assign(defautOpt, opt) : defautOpt;

  const process = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function() {
      reject(reader.error);
    };
    opt.text
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file, opt.encode);
  });
  return process;
};

const readShapefile = function(files) {
  //console.log(files);
  const process = new Promise((resolve, reject) => {
    let output = {};
    let count = files.length;
    function done() {
      if (count == 0) resolve(output);
    }
    done();

    files.forEach((file) => {
      /*
      console.log(
        new Date().toLocaleTimeString(),
        "readFileContent",
        file,
        name
      );
      */

      readFileContent(file.content, {
        text: getFileExtension(file.name) == "prj",
      })
        .then((content) => {
          output[getFileExtension(file.name)] = {
            filename: file.name,
            content,
          };
          //console.log("content", content);
          count--;
          done();
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  });
  return process;
};

const Shapefile2Geojson = async function(files) {
  let input = await readShapefile(files);

  let out = importContent(input, {
    encoding: "UTF-8",
    no_topology: true,
  });

  //let geojsonFiles = exportFileContent(out, { format: "geojson" });
  let geojson = exportDatasetAsGeoJSON(out, { format: "geojson" });
  //return geojsonFiles[0].content;
  //let geojson = JSON.parse(geojsonFiles[0].content);
  return geojson;
};
export default Shapefile2Geojson;
