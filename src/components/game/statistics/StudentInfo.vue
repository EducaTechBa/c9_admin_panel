<template>
  <v-card>
    <v-card-title>{{ realName }}</v-card-title>
    <v-overlay :value="overlay" v-if="overlay">
      <template v-if="overlayAction === 'Reset game'">
        <ResetGame :exit="hideOverlay" :student="username" />
      </template>
      <template v-else-if="overlayAction === 'Reset assignment'">
        <ResetAssignment :exit="hideOverlay" :student="username" :assignment="modalItem" />
      </template>
      <template v-else-if="overlayAction === 'Grade task'">
        <GradeTask :exit="hideOverlay" :student="username" :task="modalItem" />
      </template>
      <template v-else-if="overlayAction === 'Request redo'">
        <RequestRedo :exit="hideOverlay" :student="username" :task="modalItem" />
      </template>
      <template v-else />
    </v-overlay>
    <v-btn @click="onClick('Reset game', undefined)" style="margin: 10px">Reset Game</v-btn>
    <v-progress-linear height="25" :value="pointPercentage">
      <strong>{{ points.toFixed(2) }}</strong>
    </v-progress-linear>
    <v-row>
      <v-col cols="6">
        <v-treeview
          activatable
          dense
          hoverable
          :items="assignments"
          return-object
          :active.sync="active"
          @update:active="activeChanged(active)"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon v-if="item.isDirectory" :color="getColorOfIcon(item)">
              {{ open ? "mdi-folder-open" : "mdi-folder" }}
            </v-icon>
            <v-icon v-else>
              {{ fileTypes[extensionRegex.exec(item.name)[1]] }}
            </v-icon>
          </template>
          <template v-slot:label="{ item }">
            {{ item.name + (item.type !== "file" ? ` (${item.path})` : "") }}
            <v-icon
              v-if="item.type === 'assignment' && isAssignmentDone(item)"
              color="green"
              >mdi-check-bold</v-icon
            >
            <template v-if="item.status === 'TURNED IN'">
              <v-chip
                class="ma-2"
                label
                small
                v-if="item.type === 'task'"
                :color="getTaskChipColor(item)"
                >{{ item.points }}</v-chip
              >
            </template>
            <template v-else>
              <v-chip
                v-if="item.type === 'task'"
                label
                small
                class="ma-2"
                :color="getTaskChipColor(item)"
                >{{ item.status }}</v-chip
              >
            </template>
            <template v-if="item.type === 'assignment'">
              {{
                `${getAssignmentPoints(item).toFixed(2)} / ${item.totalPoints}`
              }}
            </template>
          </template>
        </v-treeview>
      </v-col>
      <v-col cols="6">
        <v-container>
          <div v-if="selectedTask !== undefined && selectedTask.type === 'task'">
            <v-btn @click="onClick('Grade task', selectedTask)" style="margin: 10px" v-if="selectedTask.status === 'TURNED IN'">Grade Task</v-btn>
            <v-btn @click="onClick('Request redo', selectedTask)" style="margin: 10px" v-if="selectedTask.status === 'TURNED IN'">Request Redo</v-btn>
            <pre style="overflow: scroll; background-color: #eee; font-size: small">{{ fileContent }}</pre>
          </div>
          <div v-if="selectedTask !== undefined && selectedTask.type === 'assignment'">
            <v-btn @click="onClick('Reset assignment', selectedTask)" style="margin: 10px">Reset Assignment</v-btn>
          </div>
        </v-container>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { gameStatisticsService } from "@/services";
import { fileTypes, extensionRegex, getCategoryColor } from "@/constants";
import ResetGame from "@/components/game/statistics/modals/ResetGame";
import ResetAssignment from "@/components/game/statistics/modals/ResetAssignment";
import GradeTask from "@/components/game/statistics/modals/GradeTask";
import RequestRedo from "@/components/game/statistics/modals/RequestRedo";

export default {
  components: {
    ResetGame,
    ResetAssignment,
    GradeTask,
    RequestRedo
  },
  name: "StudentInfo",
  data() {
    return {
      username: "",
      realName: "",
      points: 0,
      assignments: [],
      active: undefined,
      selectedTask: undefined,
      modalItem: undefined,
      overlay: false,
      overlayAction: "",
      fileTypes,
      extensionRegex,
      fileContent: ""
    };
  },
  computed: {
    pointPercentage() {
      return (this.points * 100) / 30; // Hardcoded
    }
  },
  async mounted() {
    const query = this.$route.query;
    if (Object.keys(query).includes("username")) {
      this.username = query.username;
      const body = await gameStatisticsService.getStudentInfo(query.username);
      const assignmentBody = await gameStatisticsService.getAssignments();
      if (body.success === true && assignmentBody.success === true) {
        this.realName = body.student.realName;
        this.points = body.student.totalPoints;
        let assignmentDescriptions = assignmentBody.data.children;
        let assignmentMap = {};
        assignmentDescriptions.forEach(assignmentDescription => {
          assignmentDescription.children?.forEach(child => {
            assignmentDescription[child.id] = child;
          });
          assignmentDescription.children = undefined;
          assignmentMap[assignmentDescription.id] = assignmentDescription;
        });
        let assignments = [];
        for (let assignmentId of Object.keys(body.data)) {
          let assignment = {
            id: "assignment" + assignmentId,
            scrapedId: assignmentId,
            name: assignmentMap[assignmentId].name,
            path: assignmentMap[assignmentId].path,
            isDirectory: assignmentMap[assignmentId].isDirectory,
            type: assignmentMap[assignmentId].type,
            totalPoints: assignmentMap[assignmentId].data.points
          };
          let children = [];
          body.data[assignmentId].forEach(task => {
            const descriptor = assignmentMap[assignmentId][task.task_id];
            let element = {
              id: assignmentId + "-" + descriptor.id,
              assignmentId: assignmentId,
              taskId: task.task_id,
              scrapedId: descriptor.id,
              path: descriptor.path,
              name: descriptor.name,
              type: descriptor.type,
              isDirectory: descriptor.isDirectory,
              status: task.status,
              taskNumber: task.task_number,
              points: task.points,
              parent: assignment
            };
            children.push(element);
          });
          assignment.children = children;
          assignments.push(assignment);
        }
        this.assignments = assignments;
      }
    } else {
      console.log("Student username not set!!!");
    }
  },
  methods: {
    async activeChanged(item) {
      if (item !== undefined && item.length > 0) {
        this.selectedTask = item[0];
        this.fileContent = "";
        if (item[0].type == 'task') {
          let body = await gameStatisticsService.getFileContent(this.username, item[0].assignmentId, item[0].taskId, "main.c" /* FIXME */);
          if (body.success)
            this.fileContent = body.data.content;
        }
      }
    },
    getColorOfIcon(item) {
      if (item.type === "task") {
        if (item.taskNumber < 6) {
          return getCategoryColor("Easy");
        } else if (item.taskNumber < 11) {
          return getCategoryColor("Moderate");
        } else {
          return getCategoryColor("Hard");
        }
      }
      return "";
    },
    isAssignmentDone(assignment) {
      for (const child of assignment.children) {
        if (child.status !== "TURNED IN") {
          return false;
        }
      }
      return true;
    },
    getTaskChipColor(task) {
      if (task.status === "TURNED IN") {
        return "gray lighten-3";
      } else if (task.status === "CURRENT TASK") {
        return "green lighten-3";
      } else if (task.status === "NOT TURNED IN") {
        return "purple lighten-3";
      }
      return "";
    },
    getAssignmentPoints(assignment) {
      let result = 0;
      assignment.children.forEach(task => (result += task.points));
      return result;
    },
    onClick(action, item) {
      this.overlayAction = action;
      this.modalItem = item;
      this.showOverLay();
    },
    hideOverlay() {
      this.overlay = false;
      this.overlayAction = "";
    },
    showOverLay() {
      this.overlay = true;
    }
  }
};
</script>

<style scoped></style>
