<template>
  <div style="height: 100%">
    <v-overlay :value="showOverlay">
      <v-progress-circular
        v-if="loading"
        :size="180"
        :width="7"
        color="purple"
        indeterminate
        class="position-absolute"
      ></v-progress-circular>
      <span :style="{ display: loading ? 'none' : 'initial' }">
        <v-btn @click="closeGenerator">Close</v-btn>
        <v-card
          ref="autotestGeneratorRef"
          id="autotestGeneratorId"
          height="80vh"
          width="80vw"
        >
        </v-card>
      </span>
    </v-overlay>
    <v-card class="inner-tile" v-if="editable.type === 'none'" tile>
      <v-card-title>Select a file</v-card-title>
    </v-card>
    <v-card class="inner-tile" v-else-if="editable.type === 'html'" tile>
      <v-card-title>
        <span class="headline">{{ file.name }}</span>
        <v-spacer />
        <v-checkbox label="Binary" v-model="binary"></v-checkbox>
        <v-spacer />
        <v-checkbox label="Show" v-model="show"></v-checkbox>
        <v-spacer />
        <v-btn @click="save()">Save</v-btn>
      </v-card-title>
      <div>
        <editor ref="toaster" :options="editorOptions" height="75vh"></editor>
      </div>
    </v-card>
    <v-card v-else-if="rawEditorFileExtensions.includes(editable.type)" tile>
      <v-card-title>
        <span class="headline">{{ file.name }}</span>
        <v-spacer />
        <v-checkbox label="Binary" v-model="binary"></v-checkbox>
        <v-spacer />
        <v-checkbox label="Show" v-model="show"></v-checkbox>
        <v-spacer />
        <v-btn v-if="editable.type === 'autotest2' || editable.type === 'autotest3'" @click="openGenerator"
          >Open generator
        </v-btn>
        <v-spacer />
        <v-btn @click="deployFile()" :disabled="isSaving">Deploy</v-btn>
        <v-spacer />
        <v-btn @click="save()" :disabled="isSaving">Save</v-btn>
      </v-card-title>
      <div>
        <codemirror
          ref="mirror"
          v-model="fileContent"
          :options="cmOptions"
          id="codemirror"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import "@/assets/styles/codemirror.css";

import "codemirror/mode/clike/clike";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/idea.css";
import { codemirror } from "vue-codemirror";
import "codemirror/addon/edit/closebrackets";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

import { Editor } from "@toast-ui/vue-editor";

import GeneratorFrame from "@/components/GeneratorFrame";
import GeneratorFrameV3 from "@/components/GeneratorFrameV3";
import { gameService } from "@/services";

export default {
  name: "FileEditor",
  components: {
    codemirror,
    Editor
  },
  data() {
    return {
      loading: false,
      showOverlay: false,
      binary: false,
      show: true,
      fileContent: "",
      file: undefined,
      extensionRegex: /(?:\.([^.]+))?$/,
      editorOptions: {
        hideModeSwitch: false
      },
      modes: {
        c: "text/x-csrc",
        cpp: "text/x-c++src",
        java: "text/x-java",
        json: "application/json",
        javascript: "text/javascript",
        typescript: "text/typescript"
      },
      cmOptions: {
        tabSize: 4,
        mode: "text/x-csrc",
        theme: "idea",
        lineNumbers: true,
        line: true,
        autoCloseBrackets: true,
        viewportMargin: Infinity,
        scrollStyle: "null"
      },
      rawEditorFileExtensions: [
        "c",
        "cpp",
        "java",
        "js",
        "mat",
        "php",
        "autotest",
        "zadaca",
        "json",
        "txt",
        "autotest2",
        "autotest3"
      ],
      isSaving: false
    };
  },
  computed: {
    editable() {
      if (this.file && !this.file.isDirectory) {
        return {
          type: this.extensionRegex.exec(this.file.name)[1]
        };
      } else {
        return { type: "none" };
      }
    }
  },
  methods: {
    openGenerator() {
      if (this.editable.type === "autotest2" || this.editable.type === "autotest3") {
        let config = this.fileContent;
        if (this.file && this.file.parent && this.file.parent.parent) {
          if (config === "") {
            config = {
              id: this.file.parent.scrapedId,
              name:
                "Game, " +
                this.file.parent.parent.name +
                ", " +
                this.file.parent.name,
              languages: [],
              tools: {},
              tests: []
            };
            config = JSON.stringify(config);
          }
        }
        const saveFunction = async content => {
          let body = await gameService.editFile({
            taskId: this.file.parent.scrapedId,
            name: this.file.name,
            content: content
          });
          this.isSaving = false;
          if (!body.success) {
            this.$notify({
              type: "bad",
              group: "main",
              title: "Save file",
              text: `${body.message || "An error has occurred."}`
            });
          } else {
            this.$notify({
              type: "good",
              group: "main",
              title: "Save file",
              text: `Autotests updated`
            });
            let result = JSON.parse(content);
            result = JSON.stringify(result, null, 4);
            this.fileContent = result;
          }
          this.showOverlay = false;
          const parent = document.getElementById("autotestGeneratorId");
          const children = parent.childNodes;
          for (let child of children) {
            parent.removeChild(child);
          }
        };
        const FrameClass = (this.editable.type === "autotest3") ? Vue.extend(GeneratorFrameV3) : Vue.extend(GeneratorFrame);
        let frame = new FrameClass({
          propsData: {
            save: saveFunction,
            config: config
          }
        });
        frame.$mount();
        this.showOverlay = true;
        this.loading = true;
        this.insertGenerator(frame.$el);
      }
    },
    insertGenerator(element) {
      const ref = this.$refs.autotestGeneratorRef;
      if (ref === undefined) {
        setTimeout(() => {
          this.insertGenerator(element);
        }, 1000);
      } else {
        ref.$el.appendChild(element);
        this.loading = false;
      }
    },
    closeGenerator() {
      this.showOverlay = false;
      const parent = document.getElementById("autotestGeneratorId");
      const children = parent.childNodes;
      for (let child of children) {
        parent.removeChild(child);
      }
    },
    async save() {
      this.isSaving = true;
      let content = "";
      if (this.$refs.toaster) {
        content = this.$refs.toaster.invoke("getHtml");
      } else if (this.$refs.mirror) {
        content = this.fileContent;
      }
      let body = await gameService.editFile({
        taskId: this.file.parent.scrapedId,
        name: this.file.name,
        show: this.show,
        binary: this.binary,
        content: content
      });
      this.isSaving = false;
      if (!body.success) {
        this.$notify({
          type: "bad",
          group: "main",
          title: "Save file",
          text: `${body.message || "An error has occurred."}`
        });
        return false;
      }
      this.$notify({
        type: "good",
        group: "main",
        title: "Save file",
        text: `File /${this.file.parent.parent.name}/${this.file.parent.name}/${this.file.name} saved.`
      });
    },
    async refresh(file) {
      if (file === undefined) {
        this.editable = {
          type: "none"
        };
      }
      if (this.$refs.toaster) {
        this.$refs.toaster.invoke("height", "75vh");
      }
      this.file = file;
      if (this.file && this.file.parent) {
        let body = await gameService.getFileContent({
          taskId: this.file.parent.scrapedId,
          filename: this.file.name
        });
        if (!body.success) {
          return false;
        }
        if (this.$refs.toaster) {
          this.$refs.toaster.invoke("setHtml", body.data.content);
        } else if (this.$refs.mirror) {
          this.fileContent = body.data.content;
        }
        this.binary = this.file.data.binary;
        this.show = this.file.data.show;
        if (
          ["autotest", "zadaca", "json", "autotest2", "autotest3"].includes(
            this.extensionRegex.exec(file.name)[1]
          )
        ) {
          this.cmOptions.mode = this.modes.json;
          this.fileContent = JSON.stringify(
            JSON.parse(this.fileContent),
            null,
            4
          );
        } else if (["c"].includes(this.extensionRegex.exec(file.name)[1])) {
          this.cmOptions.mode = this.modes.c;
        } else if (["cpp"].includes(this.extensionRegex.exec(file.name)[1])) {
          this.cmOptions.mode = this.modes.cpp;
        } else if (["java"].includes(this.extensionRegex.exec(file.name)[1])) {
          this.cmOptions.mode = this.modes.java;
        } else if (["js"].includes(this.extensionRegex.exec(file.name)[1])) {
          this.cmOptions.mode = this.modes.javascript;
        } else if (["ts"].includes(this.extensionRegex.exec(file.name)[1])) {
          this.cmOptions.mode = this.modes.typescript;
        }
      }
    },
    async deployFile() {
      const taskId = this.file.parent.scrapedId;
      console.log(`Deploying file ${this.file.name} of task ${taskId}`);
      await gameService.deployFile(taskId, this.file.name);
    }
  },
  mounted() {
    this._keyListener = function(e) {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.save();
      }
    };
    document.addEventListener("keydown", this._keyListener.bind(this));
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener);
  }
};
</script>

<style lang="scss" scoped>
#codemirror {
  height: 75vh;
  overflow-y: hidden;
  clear: both;
}
</style>
