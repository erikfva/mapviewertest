import {
  useFeatureCollection,
  exportProperties,
  exportIds,
} from "../mapshaper/src/geojson/geojson-export";

import { getFormattedStringify } from "../mapshaper/src/geojson/mapshaper-stringify";
import { error } from "../mapshaper/src/utils/mapshaper-logging";
import GeoJSON from "../mapshaper/src/geojson/geojson-common";
import { encodeString } from "../mapshaper/src/text/mapshaper-encodings";
import olGeoJSON from "ol/format/GeoJSON";

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
    //memo.push(obj);
    return memo;
  }, []);
};

const exportDatasetAsFeatures = function(dataset, opts, ofmt) {
  console.log("exportDatasetAsFeatures");
  opts = opts || {};
  const layers = dataset.layers;
  var useFeatures = useFeatureCollection(layers, opts);
  let collection = layers.reduce(function(memo, lyr) {
    let items = exportLayerAsFeatures(lyr, dataset, opts, useFeatures, ofmt);
    return memo.length > 0 ? memo.concat(items) : items;
  }, []);
  return collection;
};
export default exportDatasetAsFeatures;
