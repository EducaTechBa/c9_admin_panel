<template>
  <v-card>
    <v-card-title>Reset game</v-card-title>
    <v-card-text>Are you sure you want to reset the whole game for user {{student}}?</v-card-text>
    <v-card-actions>
      <v-btn @click="exit" :disabled="isProcessing">Cancel</v-btn>
      <v-btn @click="submit" :disabled="isProcessing">Reset</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { gameService } from "@/services";

export default {
  name: "ResetGame",
  props: {
    student: String,
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
      let body = await gameService.resetGame(this.student);
      this.isProcessing = false;
      if (!body.success) {
        this.$notify({
          type: "bad",
          group: "main",
          title: "Reset game",
          text: `${body.message || "An error has occurred."}`
        });
        return false;
      }
      this.exit();
      this.$notify({
        type: "good",
        group: "main",
        title: "Reset game",
        text: `Game resetted.`
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
