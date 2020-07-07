/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-console */
import "@/components/style/css/fontmaki2.css";
import "@/components/style/css/fontmaki.css";
import "ol-ext/style/FontMaki2Def";
import ol_style_FontSymbol from "ol-ext/style/FontMakiDef";
import ol_featureAnimation_Zoom from "ol-ext/featureanimation/Zoom";

import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import BaseLayer from "ol/layer/Base";
import { Circle, Style, Text, Stroke, Fill } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { asArray, asString } from "ol/color";
import { Vector as VectorSource } from "ol/source";
import axios from "axios";
import ObjectMerge from "../utils/ObjectMerge";
import TileLayer from "ol/layer/Tile";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { easeOut } from "ol/easing";

//**********************************************//
//**Extendiendo las funciones del core OL, para buscar un layer mediante su id, ej.: map.getLayer(<lyrID>);
if (Map.prototype.getLayer === undefined) {
  Map.prototype.getLayer = function(id) {
    var layer = null;
    this.getLayers().forEach(function(lyr) {
      if (id == lyr.get("id")) {
        layer = lyr;
      }
    });
    return layer;
  };
}

//**********************************************//
//** FUNCIONES PARA APLICAR ESTILOS
//**********************************************//
//https://openlayers.org/en/latest/examples/regularshape.html
export let pointStyles = {
  circle: {},
  square: {
    points: 4,
    radius: 10,
    angle: Math.PI / 4,
  },
  triangle: {
    points: 3,
    radius: 10,
    rotation: Math.PI / 4,
    angle: 0,
  },
  star: {
    points: 5,
    radius: 15,
    radius2: 2,
    angle: 0,
  },
  cross: {
    points: 4,
    radius: 10,
    radius2: 0,
    angle: 0,
  },
  x: {
    points: 4,
    radius: 10,
    radius2: 0,
    angle: Math.PI / 4,
  },
};

var lineDashType = {
  solid: [],
  dot: [1, 1],
  dash: [10, 10],
  longdash: [20, 5],
  dashdot: [15, 3, 3, 3],
  longdashdot: [20, 3, 3, 3, 3, 3, 3, 3],
  shortdashdot: [12, 3, 3],
};

var gvStylesDef = {
  default: {
    name: "default",
    visible: true,
    filter: [], //https://docs.geoserver.org/stable/en/user/styling/mbstyle/reference/spec.html#types-filter
    //Vector with three elements:
    //[0] = logical operation, ej: '==', '!=', '>', '>=', '<', <='.
    //[1] = field name for operation.
    //[2] = value for operation.
    //Ej.: filter: ['>=', 'poblation', '2000']
    icon: {
      file: "",
      crossOrigin: "anonymous",
      maxresol: 1200,
      position: "center", //left,right,top,bottom,top-left,top-right,bottom-left,bottom-right
      shape: "circle", //'circle', 'x', 'cross', 'star', 'triangle', 'square'
      size: 5,
      /** opacity, scale **/
      /**Font symbol */
      theGlyph: "",
      symbolColor: "red",
      form: "circle", //none, circle, poi, bubble, marker, coma, shield, blazon, bookmark, hexagon, diamond, triangle, sign, ban, lozenge, square
      fillColor: "white",
      fontStyle: "", //bold, italic, bold italic
      strokeColor: "red", //transparen, black, red, etc.
      strokeBorder: 3,
      radius: 20,
      fontSize: 1,
      rotation: 0,
      rotateWithView: false,
      offset: false,
      gradient: false,
      shadow: false,
    },
    border: {
      //stroke
      color: "#078615",
      lineCap: "round", // extremos de la linea (butt, round, or square. Default is round).
      lineJoin: "round", //	junte de las lineas (bevel, round, or miter. Default is round).
      lineDash: "solid", // estilo de linea 'solid', 'dot', 'dash', 'longdash', 'dashdot', 'longdashdot', 'shortdashdot',
      // (An Array of numbers which specify distances
      //	to alternately draw a line and a gap (in coordinate space units).
      // If the number of elements in the array is odd, the elements of the array
      // get copied and concatenated.
      //For example, [5, 15, 25] will become [5, 15, 25, 5, 15, 25].
      //If the array is empty, the line dash list is cleared and line strokes return to being solid.)
      lineDashOffset: 0.0, //Desplazamiento en relacion al maraco para empezar a dibujar la linea.
      miterLimit: 10,
      opacity: 1,
      width: 1,
    },
    fill: {
      color: "#0000ff",
      opacity: 0,
    },
    text: {
      show: true,
      field: "gv_id",
      type: "normal", //normal, shorten, wrap
      maxresol: 1200,
      align: "center",
      baseline: "middle", //Text base line. Possible values: 'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic'.
      size: 10,
      offsetX: parseInt(0, 10),
      offsetY: parseInt(0, 10),
      weight: "bold",
      rotation: parseFloat(0),
      font: "Arial",
      color: "#000000",
      outlineColor: "#ffffff",
      outlineWidth: 3, //parseInt(2, 10),
      lineHeight: 1,
      placement: "point",
      overflow: false,
    },
  },
  titulado: {
    text: {
      field: "titulo",
      color: "green",
    },
    fill: {
      color: "green",
    },
    border: {
      color: "green",
    },
  },
};

const CSStoRGBA = function(css) {
  if (css.slice(0, 4) === "rgba") {
    let rgba = css.replace(/^rgba?\(|\s+|\)$/g, "").split(",");
    /*       hex = `#${(
        (1 << 24) +
        (parseInt(rgba[0]) << 16) +
        (parseInt(rgba[1]) << 8) +
        parseInt(rgba[2])
      )
        .toString(16)
        .slice(1)}`;
    return hex; */
    return { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

//** Retorna o asigna el estilo de un layer (array de estilos)

if (BaseLayer.prototype.gvStyle === undefined) {
  BaseLayer.prototype.gvStyle = function(gvStyle) {
    if (!arguments.length)
      return (
        this.getProperties().gvStyle || [
          JSON.parse(JSON.stringify(gvStylesDef.default)),
        ]
      );

    let newStyle = {
      gvStyle: Array.isArray(gvStyle)
        ? JSON.parse(JSON.stringify(gvStyle))
        : JSON.parse(JSON.stringify([gvStyle])),
    };

    this.setProperties(newStyle, false);

    //this.changed();
  };
}
if (VectorLayer.prototype.pulseAnimation === undefined)
  VectorLayer.prototype.pulseAnimation = function(coord) {
    let layer = this;

    const pulseFeature = function(color) {
      var f = new Feature(new Point(coord));
      f.setStyle(
        new Style({
          image: new Circle({
            radius: 30,
            stroke: new Stroke({ color: color || "blue", width: 3 }),
          }),
        })
      );
      layer.animateFeature(
        f,
        new ol_featureAnimation_Zoom({
          fade: easeOut,
          duration: 350,
        })
      );
    };
    ["blue", "green", "orange", "red"].forEach((color, index) => {
      setTimeout(() => {
        pulseFeature(color);
      }, index * 200);
    });
  };

if (VectorLayer.prototype.typeGeom === undefined)
  VectorLayer.prototype.typeGeom = function() {
    return this.getSource()
      .getFeatures()[0]
      .getGeometry()
      .getType();
  };

if (VectorLayer.prototype.fields === undefined)
  VectorLayer.prototype.fields = function() {
    let fieldNames = [];
    let attr = this.getSource()
      .getFeatures()[0]
      .getProperties();

    for (var key in attr) {
      if (
        key != "info_title" &&
        (attr[key] == null || typeof attr[key] !== "object")
      )
        fieldNames.push(key);
    }
    return fieldNames;
  };

String.prototype.trunc =
  String.prototype.trunc ||
  function(n) {
    return this.length > n ? this.substr(0, n - 1) + "..." : this.substr(0);
  };
//** Prepara el texto de la etiqueta
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    for (; p > 0 && str[p] != " "; p--) {
      width; //para que no sea un bloque vacio.
    }
    if (p > 0) {
      var left = str.substring(0, p);
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}
var getText = function(feature, resolution, gvStyle) {
  //console.log(feature);
  var type = gvStyle.text.type;
  var maxResolution = gvStyle.text.maxresol;
  var text = "" + (feature.get(gvStyle.text.field) || "");
  //console.log(maxResolution,resolution);

  if (resolution > maxResolution) {
    text = "";
  } else if (!gvStyle.text.show) {
    text = "";
  } else if (type == "shorten") {
    text = text.trunc(12);
  } else if (
    type == "wrap" &&
    (!gvStyle.text.placement || gvStyle.text.placement != "line")
  ) {
    text = stringDivider(text, 16, "\n");
  }

  return text;
};
//** Prepara la etiqueta
var createTextStyle = function(feature, resolution, gvStyle) {
  var align = gvStyle.text.align;
  var baseline = gvStyle.text.baseline;
  var size = gvStyle.text.size;
  var offsetX = parseInt(gvStyle.text.offsetX, 10);
  var offsetY = parseInt(gvStyle.text.offsetY, 10);
  var weight = gvStyle.text.weight;
  var placement = gvStyle.text.placement ? gvStyle.text.placement : undefined;
  var maxAngle = gvStyle.text.maxangle
    ? parseFloat(gvStyle.text.maxangle)
    : undefined;
  var overflow = gvStyle.text.overflow;
  var rotation = parseFloat(gvStyle.text.rotation);
  if (
    gvStyle.text.font == "'Open Sans'" &&
    document.getElementById("font-open-sans") == null
  ) {
    var openSans = document.createElement("link");
    openSans.href = "https://fonts.googleapis.com/css?family=Open+Sans";
    openSans.rel = "stylesheet";
    openSans.id = "font-open-sans";
    document.getElementsByTagName("head")[0].appendChild(openSans);
  }
  var font =
    weight +
    " " +
    size +
    "px/" +
    gvStyle.text.lineHeight +
    " " +
    gvStyle.text.font;
  var fillColor = gvStyle.text.color;
  var outlineColor = gvStyle.text.outlineColor;
  var outlineWidth = parseInt(gvStyle.text.outlineWidth, 10);

  return new Text({
    textAlign: align == "" ? undefined : align,
    textBaseline: baseline,
    font: font,
    text:
      feature == null ? "Lorem Ipsum" : getText(feature, resolution, gvStyle),
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: outlineColor, width: outlineWidth }),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    maxAngle: maxAngle,
    overflow: overflow,
    rotation: rotation,
  });
};

//** Prepara el borde
const createBorderStyle = function(feature, resolution, gvStyle) {
  //let data = gvStyle.border;
  //console.log(gvStyle.border);
  let data = JSON.parse(JSON.stringify(gvStyle.border));
  if (typeof data.lineDash === "string")
    data.lineDash = lineDashType[data.lineDash] || [];
  data.lineDashOffset = parseFloat(gvStyle.border.lineDashOffset);
  data.miterLimit = parseInt(gvStyle.border.miterLimit, 10);
  data.width = parseInt(gvStyle.border.width);
  if (data.width == 0) data.opacity = 0;
  var _color = asArray(asString(data.color));
  _color = _color.slice();
  _color[3] = isNaN(data.opacity) ? 1 : data.opacity; // change the alpha of the color
  data.color = asString(_color);
  return new Stroke(data);
};
//** Prepara el fondo
var createFillStyle = function(feature, resolution, gvStyle) {
  var data = gvStyle.fill;
  var _color = asArray(asString(data.color));
  _color = _color.slice();
  _color[3] = data.opacity || gvStylesDef.default.fill.opacity; // change the alpha of the color
  if (_color[3] == 0) _color[3] = 0.01;
  data.color = asString(_color);

  return new Fill(data);
};
//** Prepara el icono
var createIconStyle = function(feature, resolution, gvStyle) {
  var data = gvStyle.icon;

  data.opacity = data.opacity || 1;
  if (resolution > data.maxresol) data.opacity = 0;
  switch (data.position) {
    case "center":
      data.anchor = [0.5, 0.5];
      break;
    case "top":
      data.anchor = [0.5, 0];
      break;
    case "bottom":
      data.anchor = [0.5, 1];
      break;
  }

  if (gvStyle.icon.file != "") {
    data.src = gvStyle.icon.file;
    return new Style.Icon(data);
  }

  //  if (gvStyle.icon.theGlyph != "") {
  return new ol_style_FontSymbol({
    form: gvStyle.icon.form, //"hexagone",
    gradient: gvStyle.icon.gradient,
    glyph: gvStyle.icon.theGlyph, //car[Math.floor(Math.random()*car.length)],
    fontSize: Number(gvStyle.icon.fontSize),
    fontStyle: gvStyle.icon.fontStyle,
    radius: Number(gvStyle.icon.size), //Number(gvStyle.icon.radius),
    //offsetX: -15,
    rotation: (Number(gvStyle.icon.rotation) * Math.PI) / 180,
    rotateWithView: gvStyle.icon.rotateWithView,
    offsetY: gvStyle.icon.offset ? -Number(gvStyle.icon.radius) : 0,
    color: gvStyle.icon.symbolColor, //gvStyle.fill.color,
    fill: createFillStyle(feature, resolution, gvStyle),
    stroke: createBorderStyle(feature, resolution, gvStyle),
  });
  //  }

  /*
  let shapeType = gvStyle.icon.shape || "circle";
  let shape = pointStyles[shapeType] || pointStyles[0];
  shape.fill = createFillStyle(feature, resolution, gvStyle);
  shape.stroke = createBorderStyle(feature, resolution, gvStyle);
  shape.radius = gvStyle.icon.size;
  return shapeType == "circle" ? new Circle(shape) : new RegularShape(shape);
  */
};

function gvMixedStyle(feature, gvStyles) {
  //console.log(feature.getProperties());
  var gvStyle = JSON.parse(JSON.stringify(gvStylesDef.default));
  //Set default text field from first style element
  gvStyle.text.field = gvStyles[0].text.field;

  if (feature) {
    //for map: mixed styles by condition
    let properties = feature.getProperties();
    var visible = true;
    for (let i = 0; i < gvStyles.length; i++) {
      let gvNStyle = JSON.parse(JSON.stringify(gvStyles[i]));
      let apply = gvStyles.length == 1;
      if (
        gvNStyle.filter &&
        Array.isArray(gvNStyle.filter) &&
        gvNStyle.filter.length >= 3
      ) {
        //**ANALIZANDO REGLA**//
        let operator = gvNStyle.filter[0];
        let key = gvNStyle.filter[1];
        let value1 = properties[key];
        let value2 = gvNStyle.filter[2];
        let isNumeric = !isNaN(value2);

        switch (operator) {
          case "==":
            apply = isNumeric
              ? Number(value1) == Number(value2)
              : value1 == value2;
            break;
          case "!=":
            apply = isNumeric
              ? Number(value1) != Number(value2)
              : value1 != value2;
            break;
          case ">":
            apply = isNumeric
              ? Number(value1) > Number(value2)
              : value1 > value2;
            break;
          case ">=":
            apply = isNumeric
              ? Number(value1) >= Number(value2)
              : value1 >= value2;
            break;
          case "<":
            apply = isNumeric
              ? Number(value1) < Number(value2)
              : value1 < value2;
            break;
          case "<=":
            apply = isNumeric
              ? Number(value1) <= Number(value2)
              : value1 <= value2;
            break;
        }
      }
      //console.log(operator, value1, value2, apply);
      if (apply) {
        //gvStyle = Object.assign({}, gvStyle, gvNStyle);
        if (visible) visible = gvNStyle.visible; //Si sige visible, se actualiza la propiedad con la regla analizada.
        gvStyle = ObjectMerge(gvStyle, gvNStyle);
      }
    }
    gvStyle.visible = visible;
  } else {
    //for legend: mixed with first style of array
    //gvStyle = Object.assign({}, gvStyle, gvStyles[0]);
    gvStyle = ObjectMerge(gvStyle, gvStyles[0]);
  }

  //console.log(gvStyle);
  return gvStyle;
}

//** Prepara el estilo = borde + fondo + etiqueta
const gvStylesFunction = function(feature, resolution, gvStyles) {
  //console.log(gvStyles);
  //let apply = gvStyles[0].apply || true;
  //if (!apply) return;

  var gvStyle = Array.isArray(gvStyles)
    ? gvMixedStyle(feature, gvStyles)
    : gvStyles;

  if (feature != null && !gvStyle.visible) {
    //console.log(feature.getProperties(), gvStyle.visible, gvStyles);
    return new Style({
      stroke: new Stroke({
        color: "transparent",
        width: 0,
      }),
      fill: new Fill({
        color: "transparent",
      }),
    });
  }

  //console.log(gvStyle, gvStyles);

  var data = {
    stroke: createBorderStyle(feature, resolution, gvStyle),
    fill: createFillStyle(feature, resolution, gvStyle),
  };

  if (feature != null && gvStyle.text.field == "") gvStyle.text.field = "gv_id";
  //console.log(feature.getProperties());

  if (feature != null && gvStyle.text.field != "")
    data.text = createTextStyle(feature, resolution, gvStyle);

  if (
    feature == null ||
    ["Point", "MultiPoint"].indexOf(feature.getGeometry().getType()) >= 0
  )
    data.image = createIconStyle(feature, resolution, gvStyle);

  return new Style(data);
};

//**********************************************//
//** Agrega una capa vectorial a partir de un geoJSON. El parametro de entrada es un json con los sgtes atributos:
//	id (alfanumerico): Identificador unico para la nueva capa.
//	title (opcional) : Titulo para la nueva capa.
//	type (opcional) : Valor para clasificar la capa, util para procesos posteriores.
//	Ej.: Para las capas cargadas del geoSICOB se asiga automaticamente el valor de 'geosicob'.
//	geojson (texto/JSON): Contenido en formato geoJSON de la capa, el formato puede ser en texto plano o en JSON.
//  gvStyle (opcional): Estilo para dibujar los features.
//  url (opcional) : Carga el geoJSON mediante llamada AJAX a la URL dada.
if (Map.prototype.addGeojsonLayer === undefined) {
  Map.prototype.addGeojsonLayer = function(o) {
    var lyr = this.getLayer(o.id); //buscando si ya existe el layer
    if (!!lyr) {
      //console.log('ya esta cargado', g.id);
      if (!!!o.replace) return;
      this.removeLayer(lyr);
    }
    var olMap = this;
    var createLayer = function() {
      if (typeof o.geojson == "string") {
        o.geojson = JSON.parse(o.geojson.replace(/\\"/g, '\\"'));
      }

      //if(!o.geojson.features) return; //si no existen elementos.

      var vectorSource = new VectorSource({
        features: new GeoJSON({
          projection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(o.geojson),
      });
      console.log("new VectorSource", new Date().toLocaleTimeString());

      function applyStylesFunction(feature, resolution) {
        //fix: cut icon/labels in border of layer extent.
        /*
        let factor = 50;
        let dx = resolution * factor;
        let dy = resolution * factor;
        let virtualExtent = [
          extent[0] - dx,
          extent[1] - dy,
          extent[2] + dx,
          extent[3] + (dy + factor + (resolution / 10) * 2 * factor) //Se aumenta unos pixeles para que no se corte la parte del icono que queda fuera del recuadro.
        ];
        //vLayer.setExtent(virtualExtent);
        vLayer.setExtent(undefined);
        */
        if (typeof feature.styles === "undefined") {
          feature.styles = [];
        }
        feature.styles[Math.floor(resolution)] =
          feature.styles[Math.floor(resolution)] ||
          gvStylesFunction(feature, resolution, vLayer.gvStyle());

        return feature.styles[Math.floor(resolution)]; //gvStylesFunction(feature, resolution, vLayer.gvStyle());
      }
      o.id = o.id || "newgeojson";
      o.gvStyle = o.gvStyle
        ? !Array.isArray(o.gvStyle)
          ? [o.gvStyle]
          : o.gvStyle
        : [{}];
      o.gvStyle[0] = ObjectMerge(
        JSON.parse(JSON.stringify(gvStylesDef.default)),
        o.gvStyle[0]
      );

      //console.log(o.gvStyle);

      var opVectorLayer = Object.assign(
        {},
        o,
        {
          id: o.id,
          title: o.title || "Capa: " + o.id,
          type: o.type || "undefined",
        },
        {
          style: applyStylesFunction,
          source: vectorSource,
          //declutter: true
        }
      );

      //console.log(opVectorLayer.gvStyle);
      /*
      if (!Array.isArray(opVectorLayer.gvStyle)) {
        opVectorLayer.gvStyle = [opVectorLayer.gvStyle]; //always must be a styles array
      }
*/
      var vLayer = new VectorLayer(opVectorLayer);
      console.log("new VectorLayer", new Date().toLocaleTimeString());

      olMap.addLayer(vLayer);
      console.log("addLayer", new Date().toLocaleTimeString());

      var extent = vectorSource.getExtent();

      if (!isNaN(olMap.getSize()[0])) {
        olMap.getView().fit(extent, olMap.getSize());
      }

      return vLayer;
    };

    var url = o.url || "";
    if (url != "") {
      axios.get(url).then((response) => {
        let data = response.data;
        if (!data.features) return null; //si no existen elementos
        o.geojson = data;
        return createLayer();
      });
    } else {
      return createLayer();
    }
  };
}
//**********************************************//
//** Agrega una capa vectorial de tipo PUNTO. El parametro de entrada es un json con los sgtes atributos:
if (Map.prototype.addPointLayer === undefined) {
  Map.prototype.addPointLayer = function(o) {
    //op.lon = longitud
    //op.lat = latitud
    //op.properties = atributos de informacion del punto
    //Cualquier otro parametro para la funcion addGeojsonLayer por ejemplo:
    //	geosicobStyle = estilo para dibujar el punto (GeoVision Style)
    var olMap = this;
    var ran = Math.floor(Math.random() * 1000 + 1);
    var GeoJSON = {
      type: "FeatureCollection",
      crs: { type: "name", properties: { name: "EPSG:4326" } },
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(o.lon), parseFloat(o.lat)],
          },
          properties: o.properties || { nombrepunto: "Nuevo punto" },
        },
      ],
    };

    o.id = o.id || "punto" + ran;
    o.geojson = GeoJSON;
    o.title = o.title || "Capa: " + o.id;
    o.gvStyle = o.gvStyle || {};
    o.process = o.process || "";
    olMap.addGeojsonLayer(o);
  };
}
/********************************************** */
/* Variables de informacion del progreso de carga de tiles
/* para implementar un progress control
/********************************************** */

var setProperties = TileLayer.prototype.setProperties;

TileLayer.prototype.setProperties = function(options) {
  this.progress = {
    loading: 0,
    loaded: 0,
    value: 0,
  };

  setProperties.call(this, options);

  let self = this;

  const updateProgress = function() {
    var p = parseFloat(
      ((self.progress.loaded / self.progress.loading) * 100).toFixed(1)
    );
    self.progress.value = p;
    if (p > 90 && p < 100)
      setTimeout(() => {
        if (self.progress.value > 90 && self.progress.value <= 100) {
          self.progress.loading = 0;
          self.progress.loaded = 0;
          self.progress.value = 0;
        }
      }, 2500);
  };

  setTimeout(() => {
    let source = self.getSource();
    if (source) {
      source.on("tileloadstart", function() {
        self.progress.loading++;
        updateProgress();
        //console.log("tileloadstart", self.progress);
      });
      source.on("tileloadend", function() {
        self.progress.loaded++;
        updateProgress();
        //console.log("tileloadend", self.progress);
        if (self.progress.loaded == self.progress.loading) {
          self.progress.loading = 0;
          self.progress.loaded = 0;
        }
      });
      source.on("tileloaderror", function() {
        self.progress.loaded++;
        updateProgress();
        //console.log("tileloaderror", self.progress);
        if (self.progress.loaded == self.progress.loading) {
          self.progress.loading = 0;
          self.progress.loaded = 0;
        }
      });
    }
    //console.log("create ol_layer_Tile", options, source);
  }, 50);
};

//**********************************************//
//** Muesta una animacion estilo ondas de agua en un punto del mapa

if (Map.prototype.pulseAnimation === undefined)
  Map.prototype.pulseAnimation = function(options) {
    if (!options) options = {};
    if (typeof options.coord === undefined) return;

    let coord = options.coord;
    var f = new Feature(new Point(coord));
    f.setStyle(
      new Style({
        image: new Circle({
          radius: 30,
          stroke: new Stroke({ color: "red", width: 2 }),
        }),
      })
    );

    this.animateFeature(
      f,
      new ol_featureAnimation_Zoom({
        fade: easeOut,
        duration: 800,
      })
    );
  };

export {
  Map,
  gvStylesFunction,
  createTextStyle,
  gvStylesDef,
  CSStoRGBA,
  gvMixedStyle,
};
