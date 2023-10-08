<template>
  <v-card>
    <v-card-title>Grade task manually</v-card-title>
    <v-card-text>Use this option to enter numer of points for this task manually.</v-card-text>
      <v-text-field
        type="number"
        step="0.01"
        label="Points"
        v-model="points"
        :rules="[nonNegative]"
        style="margin-left: 20px; margin-right: 20px"
      ></v-text-field>
    <v-card-text>Use option below to prevent student from returning to this task using &quot;Second Chance&quot; powerup.</v-card-text>
    <v-checkbox label="Prevent Second Chance" v-model="preventSecondChance" style="margin-left: 20px; margin-right: 20px" />
    <v-card-actions>
      <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
      <v-btn @click="submit" :disabled="isProcessing">Grade task</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "GradeTask",
  props: {
    student: String,
    task: Object,
    exit: Function,
  },
  data() {
    return {
      isProcessing: false,
      points: 0,
      preventSecondChance: false
    };
  },
  methods: {
    async submit() {
      this.isProcessing = true;
      let body = await gameService.gradeTask(this.student, this.task.assignmentId, this.task.taskId, this.points, this.preventSecondChance);
      this.isProcessing = false;
      if (!body.success) {
        this.$notify({
          type: "bad",
          group: "main",
          title: "Grade task manually",
          text: `${body.message || "An error has occurred."}`
        });
        return false;
      }
      this.exit();
      this.$notify({
        type: "good",
        group: "main",
        title: "Grade task manually",
        text: `Task ${this.task.name} was given ${this.points} points.`
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
    this.points = this.task.points;
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
    this._keyListener = undefined;
  }
};
</script>

<style scoped></style>
