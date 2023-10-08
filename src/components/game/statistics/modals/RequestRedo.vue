<template>
  <v-card>
    <v-card-title>Request to redo task</v-card-title>
    <v-form v-model="valid">
      <v-card-text>When student turns in their current task, they will be returned to this task so they can make changes. You can enter a reason for returning below, student will see it briefly.</v-card-text>
      <v-textarea label="Reason" v-model="reason" style="margin-left: 20px; margin-right: 20px"></v-textarea>
      <v-card-text>Are you sure you want to request that student {{student}} redo the task {{task.name}}?</v-card-text>
      <v-card-actions>
        <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
        <v-btn @click="submit" :disabled="isProcessing">Request redo</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "RequestRedo",
  props: {
    student: String,
    task: Object,
    exit: Function,
  },
  data() {
    return {
      isProcessing: false,
      valid: true,
      reason: ""
    };
  },
  methods: {
    async submit() {
      this.isProcessing = true;
      let body = await gameService.requestRedo(this.student, this.task.assignmentId, this.task.taskId, this.reason);
      this.isProcessing = false;
      if (!body.success) {
        this.$notify({
          type: "bad",
          group: "main",
          title: "Request to redo task",
          text: `${body.message || "An error has occurred."}`
        });
        return false;
      }
      this.exit();
      this.$notify({
        type: "good",
        group: "main",
        title: "Request to redo task",
        text: `Student will redo ${this.task.name}.`
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
