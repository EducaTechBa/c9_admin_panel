<template>
  <v-container fluid>
    <h1>
      Game lessons
      <v-icon @click="onClick('Create assignment', undefined)">mdi-plus</v-icon>
    </h1>
    <v-overlay :value="overlay" v-if="overlay">
      <template v-if="overlayAction === 'Create assignment'">
        <CreateAssignment :exit="hideOverlay" :refresh="refreshGame" />
      </template>
      <template v-else-if="overlayAction === 'Edit assignment'">
        <EditAssignment
          :exit="hideOverlay"
          :refresh="refreshGame"
          :categories="categories"
          :assignment="modalItem"
        ></EditAssignment>
      </template>
      <template v-else-if="overlayAction === 'Create task'">
        <CreateTask
          :exit="hideOverlay"
          :refresh="refreshGame"
          :categories="categories"
          :assignment="modalItem"
        />
      </template>
      <template v-else-if="overlayAction === 'Edit task'">
        <EditTask
          :exit="hideOverlay"
          :refresh="refreshGame"
          :categories="categories"
          :assignment="modalItem.parent"
          :task="modalItem"
        />
      </template>
      <template v-else-if="overlayAction === 'Delete task'">
        <DeleteTask
          :exit="hideOverlay"
          :refresh="refreshGame"
          :task="modalItem"
        />
      </template>
      <template v-else-if="overlayAction === 'Create file'">
        <CreateFile
          :exit="hideOverlay"
          :refresh="refreshGame"
          :task="modalItem"
        />
      </template>
      <template v-else-if="overlayAction === 'Delete file'">
        <DeleteFile
          :exit="hideOverlay"
          :refresh="refreshGame"
          :file="modalItem"
          :task="modalItem.parent"
        />
      </template>
      <template v-else />
    </v-overlay>
    <vue-context ref="menu" v-slot="{ data }">
      <template v-if="data !== null && data !== undefined">
        <template v-if="data.type === 'assignment'">
          <li>
            <a @click.prevent="onClick('Edit assignment', data)">
              Edit assignment
            </a>
          </li>
          <li>
            <a @click.prevent="onClick('Create task', data)">
              Create task
            </a>
          </li>
        </template>
        <template v-if="data.type === 'task'">
          <li>
            <a @click.prevent="onClick('Edit task', data)">
              Edit task
            </a>
          </li>
          <li>
            <a @click.prevent="onClick('Delete task', data)">
              Delete task
            </a>
          </li>
          <li>
            <a @click.prevent="onClick('Create file', data)">
              Create file
            </a>
          </li>
          <li>
            <a @click.prevent="solutionsClicked(data)">
              See solutions
            </a>
          </li>
        </template>
        <template v-if="data.type === 'file'">
          <li>
            <a @click.prevent="onClick('Delete file', data)">
              Delete file
            </a>
          </li>
        </template>
      </template>
    </vue-context>
    <v-row>
      <v-col cols="4">
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
            <v-badge overlap dot :color="getTaskHintColor(item)">
              <v-icon
                v-if="item.isDirectory"
                @contextmenu.prevent="$refs.menu.open($event, item)"
                :color="getColorOfIcon(item)"
              >
                {{
                  item.type === "task" && item.data.disabled
                    ? "mdi-wheelchair-accessibility"
                    : open
                    ? "mdi-folder-open"
                    : "mdi-folder"
                }}
              </v-icon>
              <v-icon
                v-else
                @contextmenu.prevent="$refs.menu.open($event, item)"
              >
                {{ fileTypes[extensionRegex.exec(item.name)[1]] }}
              </v-icon>
            </v-badge>
          </template>
          <template v-slot:label="{ item }">
            <v-list-item-title
              :class="
                item.type === 'task' && item.data.disabled === true
                  ? 'text-decoration-line-through'
                  : ''
              "
              @contextmenu.prevent="$refs.menu.open($event, item)"
            >
              {{ item.name + (item.type !== "file" ? ` (${item.path})` : "") }}
              <template v-if="item.type === 'assignment'">
                <v-avatar
                  color="blue lighten-4"
                  style="font-size: smaller"
                  size="24"
                  class="ml-2 my-auto"
                >
                  {{ getNumberOfTasksInCategory(item, "Easy") }}
                </v-avatar>
                <v-avatar
                  color="green lighten-4"
                  style="font-size: smaller"
                  size="24"
                  class="ml-2 my-auto"
                >
                  {{ getNumberOfTasksInCategory(item, "Moderate") }}
                </v-avatar>
                <v-avatar
                  color="red lighten-4"
                  style="font-size: smaller"
                  size="24"
                  class="ml-2 my-auto"
                >
                  {{ getNumberOfTasksInCategory(item, "Hard") }}
                </v-avatar>
              </template>
            </v-list-item-title>
          </template>
        </v-treeview>
      </v-col>
      <v-col cols="8">
        <v-card class="sticky" tile elevation="2">
          <FileEditor
            ref="fileEditor"
            class="editorWrapper"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueContext from "vue-context";
import "vue-context/src/sass/vue-context.scss";
import CreateAssignment from "@/components/game/builder/modals/CreateAssignment";
import EditAssignment from "@/components/game/builder/modals/EditAssignment";
import CreateTask from "@/components/game/builder/modals/CreateTask";
import EditTask from "@/components/game/builder/modals/EditTask";
import FileEditor from "@/components/game/builder/FileEditor";
import DeleteTask from "@/components/game/builder/modals/DeleteTask";
import DeleteFile from "@/components/game/builder/modals/DeleteFile";
import CreateFile from "@/components/game/builder/modals/CreateFile";
import { gameService } from "@/services";
import { fileTypes, extensionRegex } from "@/constants";

export default {
  components: {
    CreateFile,
    DeleteFile,
    DeleteTask,
    FileEditor,
    EditTask,
    CreateTask,
    EditAssignment,
    CreateAssignment,
    VueContext
  },
  name: "GameBuilder",
  data() {
    return {
      modalItem: undefined,
      overlay: false,
      overlayAction: "",
      assignments: [],
      active: [],
      categories: [],
      fileTypes,
      extensionRegex
    };
  },
  async mounted() {
    await this.refreshGame();
  },
  methods: {
    hideOverlay() {
      this.overlay = false;
      this.overlayAction = "";
    },
    showOverLay() {
      this.overlay = true;
    },
    activeChanged(active) {
      console.log(`Active changed ${Date.now()}`);
      this.file = undefined;
      if (active.length !== 0) {
        console.log(`Calling treeItemClicked ${Date.now()}`);
        this.treeItemClicked(active[0]);
      } else {
        console.log(`Calling file editor refresh ${Date.now()}`);
        this.$refs.fileEditor.refresh(undefined);
      }
    },
    async treeItemClicked(item) {
      console.log(`Tree item clicked ${Date.now()}`);
      if (!item.isDirectory) {
        console.log(`Is not directory ${Date.now()}`);
        this.$refs.fileEditor.refresh(item);
        console.log(`After file editor refresh invocation 233 ${Date.now()}`);
      } else {
        console.log(`It is a directory ${Date.now()}`);
        if (item.type === "task") {
          console.log(`It is a task ${Date.now()}`);
          console.log(item);
          const children = item.children?.filter(
            child => extensionRegex.exec(child.name)[1] === "html"
          );
          console.log(`Filtered shit ${Date.now()}`);
          if (children && children.length > 0) {
            console.log(`show the first html file ${Date.now()}`);
            this.$refs.fileEditor.refresh(children[0]);
            console.log(`After invoking the first html showing ${Date.now()}`);
          } else {
            console.log(`Just refresh the thing 245 ${Date.now()}`);
            this.$refs.fileEditor.refresh(undefined);
            console.log(`After refresh invocation 247 ${Date.now()}`);
          }
        } else {
          console.log(`Last refresh ${Date.now()}`);
          this.$refs.fileEditor.refresh(undefined);
          console.log(`Tokyo drift 252 ${Date.now()}`);
        }
      }
    },
    onClick(action, item) {
      this.overlayAction = action;
      this.modalItem = item;
      this.showOverLay();
    },
    solutionsClicked(item) {
      this.$router.push(`/game/solutions?taskId=${item.scrapedId}`);
    },
    fixIds(item, parent) {
      if (item) {
        if (parent !== null) {
          item.parent = parent;
        }
        if (item.type === "file") {
          item.id = item.path;
        } else {
          item.scrapedId = item.id;
          item.id = item.id + "." + item.type;
        }
        if (item.children) {
          item.children.forEach(child => this.fixIds(child, item));
        }
      }
    },
    async refreshGame() {
      let assignments = [];
      let categories = [];

      let body = await gameService.getTaskCategories();
      if (!body.success) {
        return false;
      }
      categories = body.data;
      body = await gameService.getAssignments();
      if (!body.success) {
        return false;
      }
      assignments = body.data.children;
      assignments.forEach(item => this.fixIds(item, null));
      this.assignments = assignments;
      this.categories = categories;
      return true;
    },
    getNumberOfTasksInCategory(assignment, category) {
      if (assignment.type === "assignment") {
        let id = 1;
        this.categories.forEach(c => (c.name === category ? (id = c.id) : ""));
        let numberOfTasks = 0;
        if (assignment.children) {
          assignment.children.forEach(task => {
            if (task.data.category === id) {
              numberOfTasks++;
            }
          });
        }
        return numberOfTasks;
      }
      return 0;
    },
    getColorOfIcon(node) {
      if (node.type === "task") {
        const id = node.data.category;
        for (const category of this.categories) {
          if (category.id === id) {
            if (category.name === "Easy") {
              return "blue lighten-4";
            } else if (category.name === "Moderate") {
              return "green lighten-4";
            }
            return "red lighten-4";
          }
        }
        return "";
      }
    },
    getTaskHintColor(item) {
      if (item.type === "task" && item.data.hint.trim().length > 0) {
        return "orange lighten-2";
      }
      return "transparent";
    }
  }
};
</script>

<style scoped>
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 15px;
}

.editorWrapper {
  height: 75vh;
  overflow-y: hidden;
  clear: both;
}
</style>
