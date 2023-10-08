<template>
  <v-card>
    <v-card-title>Reset assignment</v-card-title>
    <v-card-text>Are you sure you want to reset assignment {{assignment.name}} for user {{student}}?<br><br>
    This is not recommended since student will keep the tokens and powerups that they gained during this level. Also they saw a number of tasks in this assignment which removes some of the mistery :)</v-card-text>
    <v-card-actions>
      <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
      <v-btn @click="submit" :disabled="isProcessing">Reset</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "ResetAssignment",
  props: {
    student: String,
    assignment: Object,
    exit: Function,
  },
  data() {
    return {
      isProcessing: false
    };
  },
  methods: {
    async submit() {
      this.isProcessing = true;
      let body = await gameService.resetAssignment(this.student, this.assignment.scrapedId);
      this.isProcessing = false;
      if (!body.success) {
        this.$notify({
          type: "bad",
          group: "main",
          title: "Reset assignment",
          text: `${body.message || "An error has occurred."}`
        });
        return false;
      }
      this.exit();
      this.$notify({
        type: "good",
        group: "main",
        title: "Reset assignment",
        text: `Assignment ${this.assignment.name} resetted.`
      });
    }
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
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
    this._keyListener = undefined;
  }
};
</script>

<style scoped></style>
