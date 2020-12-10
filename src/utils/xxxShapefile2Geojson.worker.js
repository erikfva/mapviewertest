import { getFileExtension } from "../mapshaper/src/utils/mapshaper-filename-utils";
import { importContent } from "../mapshaper/src/io/mapshaper-import";
import { GeoJSON as olGeoJSON } from "ol/format/GeoJSON";
//import { exportFileContent } from "../mapshaper/src/io/mapshaper-export";
import {
  exportDatasetAsGeoJSON,
  useFeatureCollection,
  exportProperties,
  exportIds,
} from "../mapshaper/src/geojson/geojson-export";

import { exportPathData } from "../mapshaper/src/paths/mapshaper-path-export";
import { groupPolygonRings } from "../mapshaper/src/paths/mapshaper-path-utils";
import GeoJSON from "../mapshaper/src/geojson/geojson-common";
import { getFormattedStringify } from "../geojson/mapshaper-stringify";
import { error } from "../utils/mapshaper-logging";
import { encodeString } from "../text/mapshaper-encodings";

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

// export GeoJSON or TopoJSON point geometry
GeoJSON.exportPointGeom = function(points) {
  var geom = null;
  if (points.length == 1) {
    geom = {
      type: "Point",
      coordinates: points[0],
    };
  } else if (points.length > 1) {
    geom = {
      type: "MultiPoint",
      coordinates: points,
    };
  }
  return geom;
};

GeoJSON.exportLineGeom = function(ids, arcs) {
  var obj = exportPathData(ids, arcs, "polyline");
  if (obj.pointCount === 0) return null;
  var coords = obj.pathData.map(function(path) {
    return path.points;
  });
  return coords.length == 1
    ? {
        type: "LineString",
        coordinates: coords[0],
      }
    : {
        type: "MultiLineString",
        coordinates: coords,
      };
};

GeoJSON.exportPolygonGeom = function(ids, arcs, opts) {
  var obj = exportPathData(ids, arcs, "polygon");
  if (obj.pointCount === 0) return null;
  var groups = groupPolygonRings(obj.pathData, opts.invert_y);
  // invert_y is used internally for SVG generation
  // mapshaper's internal winding order is the opposite of RFC 7946
  var reverse = (opts.rfc7946 || opts.v2) && !opts.invert_y;
  var coords = groups.map(function(paths) {
    return paths.map(function(path) {
      if (reverse) path.points.reverse();
      return path.points;
    });
  });
  return coords.length == 1
    ? {
        type: "Polygon",
        coordinates: coords[0],
      }
    : {
        type: "MultiPolygon",
        coordinates: coords,
      };
};

GeoJSON.exporters = {
  polygon: GeoJSON.exportPolygonGeom,
  polyline: GeoJSON.exportLineGeom,
  point: GeoJSON.exportPointGeom,
};

const exportLayerAsFeatures = function(lyr, dataset, opts, asFeatures, ofmt) {
  var properties = exportProperties(lyr.data, opts),
    shapes = lyr.shapes,
    ids = exportIds(lyr.data, opts),
    stringify;

  if (ofmt) {
    stringify = opts.prettify
      ? getFormattedStringify(["bbox", "coordinates"])
      : JSON.stringify;
  }

  if (properties && shapes && properties.length !== shapes.length) {
    error("Mismatch between number of properties and number of shapes");
  }

  return (shapes || properties || []).reduce(function(memo, o, i) {
    var shape = shapes ? shapes[i] : null,
      exporter = GeoJSON.exporters[lyr.geometry_type],
      obj = shape ? exporter(shape, dataset.arcs, opts) : null;
    if (asFeatures) {
      obj = {
        type: "Feature",
        geometry: obj,
        properties: properties ? properties[i] : null,
      };
      if (ids) {
        obj.id = ids[i];
      }
    } else if (!obj) {
      return memo; // don't add null objects to GeometryCollection
    }
    if (ofmt) {
      // stringify features as soon as they are generated, to reduce the
      // number of JS objects in memory (so larger files can be exported)
      obj = stringify(obj);
      if (ofmt == "buffer") {
        obj = encodeString(obj, "utf8");
        // obj = stringToBuffer(obj);
        // obj = new Buffer(obj, 'utf8');
      }
    }

    memo.push(new olGeoJSON().readFeature(obj));
    return memo;
  }, []);
};

const exportDatasetAsFeatures = function(dataset, opts, ofmt) {
  opts = opts || {};
  const layers = dataset.layers;
  var useFeatures = useFeatureCollection(layers, opts);
  let collection = layers.reduce(function(memo, lyr) {
    let items = exportLayerAsFeatures(lyr, dataset, opts, useFeatures, ofmt);
    return memo.length > 0 ? memo.concat(items) : items;
  }, []);
  return collection;
};

const Shapefile2Features = async function(files) {
  let input = await readShapefile(files);

  let out = importContent(input, {
    encoding: "UTF-8",
    no_topology: true,
  });

  //let geojsonFiles = exportFileContent(out, { format: "geojson" });
  let features = exportDatasetAsFeatures(out);
  //return geojsonFiles[0].content;
  //let geojson = JSON.parse(geojsonFiles[0].content);
  return features;
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
export { Shapefile2Geojson, Shapefile2Features };
