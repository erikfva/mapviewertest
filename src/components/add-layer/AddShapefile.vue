<template>
  <v-card dark>
    <v-card-title class>Importar capa vectorial</v-card-title>

    <v-container v-show="processing" style="height: 400px;">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="subtitle-1 text-center" cols="12">Leyendo archivo...</v-col>
        <v-col cols="6">
          <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-show="success" style="height: 400px;">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="subtitle-1 text-center" cols="12">Proceso finalizado!!</v-col>
        <v-col cols="6" class="text-center">
          <v-icon size="100" color="green darken-2">mdi-check-circle-outline</v-icon>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-show="!success && !processing">
      <v-alert border="top" colored-border type="info" elevation="2" dense>
        <small class="caption">
          El archivo debe estar comprimido en formato
          <span class="yellow--text subtitle-1">.zip</span> conteniendo un
          archivo
          <span class="yellow--text subtitle-1">.shp, .dbf y .shx.</span>
        </small>
      </v-alert>

      <v-row class="mx-2">
        <v-col cols="12">
          <v-file-input v-model="file" accept=".zip" show-size label="Archivo shape"></v-file-input>
        </v-col>
        <v-col cols="12">
          <v-select v-model="proj" :items="projections" label="Proyección"></v-select>
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions v-show="!success && !processing" class="align-left">
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')" color="warning">Cancelar</v-btn>
      <v-btn v-show="file" text color="primary" @click="upload">Aceptar</v-btn>
    </v-card-actions>
    <v-bottom-sheet v-model="sheet">
      <v-sheet class="text-center" height="200px">
        <v-btn class="mt-6" text color="primary" @click="sheet = !sheet">Cerrar</v-btn>
        <div class="py-3 error--text">{{ msg }}</div>
      </v-sheet>
    </v-bottom-sheet>
  </v-card>
</template>

<script>
import { UncompressBlobFile, isZipFile } from "@/utils/Zip";
//import { Shapefile2Features } from "@/utils/Shapefile2Features.worker";
import {
  Shapefile2Geojson,
  readShapefile,
  Shapefile2Dataset
} from "@/utils/Shapefile2Geojson.worker";
import { importContent } from "../../mapshaper/src/io/mapshaper-import";
import { exportDatasetAsGeoJSON } from "../../mapshaper/src/geojson/geojson-export";

export default {
  props: {},
  data: () => ({
    file: null,
    proj: 4326,
    projections: [
      { text: "GEO WGS84", value: 4326 }
      /*       { text: "UTM Zona 19", value: 32719 },
      { text: "UTM Zona 20", value: 32720 },
      { text: "UTM Zona 21", value: 32721 } */
    ],
    sheet: false,
    msg: "",
    processing: false,
    success: false
  }),
  created() {},
  mounted() {
    let vc = this;
    this.$nextTick(function() {
      vc.$emit("mounted", vc);
    });
  },
  methods: {
    init() {
      this.sheet = false;
      this.msg = "";
      this.processing = false;
      this.success = false;
    },
    showError(err) {
      this.sheet = true;
      this.msg = err;
      return false;
    },
    async upload() {
      const vc = this;
      if (!isZipFile(this.file.name)) {
        return vc.showError("El archivo no es '.zip'");
      }

      vc.processing = true;
      try {
        const files = await UncompressBlobFile(this.file);
        if (files.length == 0) {
          vc.processing = false;
          return vc.showError("Archivo no válido.");
        }
        //console.log(files[0]);
        const files_ = files.map(el => {
          return { name: el.name, content: el };
        });
        console.log(files_, new Date().toLocaleTimeString());
        //let result = await Shapefile2Dataset(files_);
        //let result = await Shapefile2Geojson(files_);
        //let result = await Shapefile2Features(files_);

        console.log("init readShapefile", new Date().toLocaleTimeString());
        let input = await readShapefile(files_);

        console.log("init importContent", new Date().toLocaleTimeString());
        let out = await importContent(input, {
          encoding: "UTF-8",
          no_topology: true
        });
        console.log(
          "finish importContent",
          out,
          new Date().toLocaleTimeString()
        );

        console.log(
          "init exportDatasetAsGeoJSON",
          new Date().toLocaleTimeString()
        );
        let result = await exportDatasetAsGeoJSON(out, { format: "geojson" });
        console.log(
          "finish exportDatasetAsGeoJSON",
          new Date().toLocaleTimeString()
        );

        //let geojsonFiles = exportFileContent(out, { format: "geojson" });
        //return geojsonFiles[0].content;
        //let geojson = JSON.parse(geojsonFiles[0].content);
        console.log(
          "finish Shapefile2Geojson",
          new Date().toLocaleTimeString()
        );

        console.log(
          "recibe result Shapefile2xxx",
          result,
          new Date().toLocaleTimeString()
        );
        vc.success = true;
        vc.$emit("upload", result);

        //console.log(geojson);
      } catch (error) {
        return vc.showError(error);
      } finally {
        vc.processing = false;
      }
      return true;
    }
  }
};
</script>

<style></style>
