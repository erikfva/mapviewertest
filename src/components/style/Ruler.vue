<template>
  <div>
    <v-btn
      v-show="value.length == 0"
      dark
      x-small
      color="indigo"
      @click="createRule"
    >
      Crear regla
      <!-- <v-icon dark>mdi-plus</v-icon> -->
    </v-btn>
    <div v-if="value.length == 3" class>
      <v-row v-show="!edit">
        <div class="mr-4">
          <a @click="edit = true"
            >{{ value[1] }} {{ value[0] }} {{ value[2] }}</a
          >
          <v-btn
            color="error"
            icon
            x-small
            dark
            @click="deleteRule"
            class="pl-3"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-row>
    </div>
    <v-dialog v-model="edit" dark persistent width="430">
      <v-card dark color="blue-grey darken-3">
        <v-toolbar dark color="transparent">
          <v-toolbar-title>Regla</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="success" text @click="edit = false">OK</v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row dense>
              <v-col cols="12" sm="5" style="min-width:150px">
                <v-select
                  v-model="value[1]"
                  :items="fields"
                  label="Campo"
                  dense
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3" style="min-width:80px">
                <v-select
                  v-model="value[0]"
                  :items="['==', '!=', '>', '>=', '<', '<=']"
                  label="Operación"
                  dense
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4" style="min-width:120px">
                <v-text-field
                  v-model="value[2]"
                  label="Valor"
                  dense
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      //in parent: v-model="filter", in this componet: values is filter
      type: Array,
      default: () => []
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return { edit: false };
  },
  computed: {},
  watch: {
    edit: {
      handler(v) {
        if (!v) {
          //when close filter editor, update model value
          this.$emit("input", this.value);
        }
      }
    }
  },
  methods: {
    createRule() {
      //this.value = ["==", this.fields[0], null];

      this.$emit("input", ["==", this.fields[0], null]);
      this.edit = true;
      //
    },
    deleteRule() {
      this.$emit("input", []);
    }
  }
};
</script>

<style></style>
