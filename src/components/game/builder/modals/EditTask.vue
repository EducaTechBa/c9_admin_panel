<template>
  <v-card class="pa-5 px-8" dark>
    <h3 class="text-center mb-3">Edit task</h3>
    <v-form v-model="valid">
      <v-text-field
        label="Name"
        v-model="name"
        required
        :rules="[notEmpty]"
      ></v-text-field>
      <v-select
        label="Category"
        v-model="selected"
        :items="categories"
        item-text="name"
        :rules="[isSelected]"
        return-object
      ></v-select>
      <v-checkbox label="Disabled" v-model="disabled" />
      <v-textarea label="Hint" v-model="hint"></v-textarea>
      <div class="d-flex justify-space-between mt-5">
        <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
        <v-btn @click="submit" :disabled="isProcessing">Update</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "EditTask",
  props: {
    assignment: Object,
    task: Object,
    categories: Array,
    refresh: Function,
    exit: Function
  },
  data() {
    return {
      isProcessing: false,
      name: "",
      hint: "",
      disabled: false,
      selected: undefined,
      valid: true,
      notEmpty: v => (v || "").length > 0 || "This field cannot be empty",
      noSpaces: v => (v || "").indexOf(" ") < 0 || "No spaces are allowed",
      isSelected: v => v !== undefined || "Number must not be negative"
    };
  },
  mounted() {
    this._keyListener = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.exit();
      }
    };
    document.addEventListener("keydown", this._keyListener);
    this.name = this.task.name;
    this.hint = this.task.data.hint;
    this.disabled = this.task.disabled;
    let result = this.categories.reduce((cat, item) => {
      if (item.id === this.task.data.category) {
        cat = item;
      }
      return cat;
    }, undefined);
    if (result === undefined) {
      result = this.categories[0];
    }
    this.selected = result;
  },
  methods: {
    async submit() {
      if (this.valid) {
        this.isProcessing = true;
        let body = await gameService.editTask({
          id: this.task.scrapedId,
          name: this.name,
          category: this.selected.id,
          hint: this.hint,
          disabled: this.disabled
        });
        this.isProcessing = false;
        if (!body.success) {
          this.$notify({
            type: "bad",
            group: "main",
            title: "Edit task",
            text: `${body.message || "An error has occurred."}`
          });
          return false;
        }
        this.refresh();
        this.exit();
        this.$notify({
          type: "good",
          group: "main",
          title: "Edit task",
          text: `Task ${this.name} updated.`
        });
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
    this._keyListener = undefined;
  }
};
</script>

<style scoped></style>
