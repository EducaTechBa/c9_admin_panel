<template>
  <v-card class="pa-5 px-8" dark>
    <v-card-title class="text-center">Create task</v-card-title>
    <v-form v-model="valid">
      <v-text-field
        label="Name"
        v-model="displayName"
        required
        :rules="[notEmpty]"
      ></v-text-field>
      <v-text-field
        label="Filesystem name"
        v-model="name"
        :rules="[notEmpty, noSpaces]"
        required
      ></v-text-field>
      <v-select
        label="Category"
        v-model="selected"
        :items="categories"
        :rules="[isSelected]"
        item-text="name"
        return-object
      ></v-select>
      <v-checkbox label="Disabled" v-model="disabled" />
      <v-textarea label="Hint" v-model="hint"></v-textarea>
      <v-card-actions class="justify-space-between">
        <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
        <v-btn @click="create" :disabled="isProcessing">Create</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "CreateTask",
  props: {
    assignment: Object,
    categories: Array,
    refresh: Function,
    exit: Function
  },
  data() {
    return {
      isProcessing: false,
      valid: false,
      name: "",
      displayName: "",
      hint: "",
      disabled: false,
      selected: undefined,
      notEmpty: v => (v || "").length > 0 || "This field cannot be empty",
      noSpaces: v => (v || "").indexOf(" ") < 0 || "No spaces are allowed",
      isSelected: v => v !== undefined || "Number must not be negative"
    };
  },
  methods: {
    async create() {
      if (this.valid) {
        this.isProcessing = true;
        let body = await gameService.createTask({
          assignmentId: this.assignment.scrapedId,
          path: this.name,
          name: this.displayName,
          category: this.selected.id,
          hint: this.hint,
          disabled: this.disabled
        });
        this.isProcessing = false;
        if (!body.success) {
          this.$notify({
            type: "bad",
            group: "main",
            title: "Create task",
            text: `${body.message || "An error has occurred."}`
          });
          return false;
        }
        this.refresh();
        this.exit();
        this.$notify({
          type: "good",
          group: "main",
          title: "Create task",
          text: `Task ${this.displayName} created.`
        });
      }
    }
  },
  mounted() {
    this._keyListener = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.create();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.exit();
      }
    };
    document.addEventListener("keydown", this._keyListener);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
    this._keyListener = undefined;
  }
};
</script>

<style scoped></style>
