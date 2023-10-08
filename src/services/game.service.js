export default {
  async getTaskCategories() {
    const response = await fetch(
      "/api/v1/game/task_categories",
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getAssignments() {
    const response = await fetch(
      "/api/v1/game/admin/assignments",
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async createAssignment({
    path,
    name,
    points,
    challengePoints,
    active
  }) {
    const response = await fetch(
      "/api/v1/game/admin/assignment",
      {
        method: "post",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          path,
          name,
          points,
          challengePoints,
          active
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async editAssignment({ id, name, points, challengePoints, active }) {
    // Path can't be changed
    const response = await fetch(
      `/api/v1/game/admin/assignment/${id}`,
       {
        method: "put",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          points,
          challengePoints,
          active
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async createTask({ assignmentId, path, name, category, hint, disabled }) {
    const response = await fetch(
      `/api/v1/game/admin/task?assignmentId=${assignmentId}`,
      {
        method: "post",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          path,
          name,
          category,
          hint,
          disabled
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async editTask({ id, name, category, hint, disabled }) {
    const response = await fetch(
      `/api/v1/game/admin/task/${id}`,
      {
        method: "put",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          hint,
          disabled
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async deleteTask(id) {
    const response = await fetch(
      `/api/v1/game/admin/task/${id}`,
      {
        method: "delete",
        headers: {
          Accept: "application/json"
        }
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async createFile({ taskId, name, show, binary, content }) {
    const response = await fetch(
      `/api/v1/game/admin/task/${taskId}/file`,
      {
        method: "put",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name,
          show: show,
          binary: binary,
          content: content
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async editFile({ taskId, name, show, binary, content }) {
    const response = await fetch(
      `/api/v1/game/admin/task/${taskId}/file/${name}`,
      {
        method: "put",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name,
          show: show,
          binary: binary,
          content: content
        })
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async deleteFile({ taskId, filename }) {
    const response = await fetch(
      `/api/v1/game/admin/task/${taskId}/file/${filename}`,
       {
        method: "delete",
        headers: {
          Accept: "application/json"
        }
      }
    );
    const body = await response.json();
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getFileContent({ taskId, filename }) {
    console.log(`Getting ${filename} ${Date.now()}`);
    const response = await fetch(
      `/api/v1/game/admin/task/${taskId}/file/${filename}`,
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    console.log(`Response got here ${Date.now()}`);
    const body = await response.json();
    console.log(`Converted to json ${Date.now()}`);
    if (!body.success) {
      if (body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    console.log(`Checked the body ${Date.now()}`);
    return body;
  },
  async deployFile(taskId, fileName) {
    const response = await fetch(
      `/api/v1/game/admin/deploy?task_id=${taskId}&filename=${fileName}`,
       {
        method: "post",
        headers: {
          Accept: "application/json"
        }
      }
    );
    console.log(`Deployment response: ${JSON.stringify(response)}`);
    const body = await response.json();
    return body;
  },
  async resetGame(student) {
    const response = await fetch(
      `/api/v1/game/admin/reset?student=${student}`,
      {
        method: "post",
        headers: {
          Accept: "application/json"
        }
      }
    );
    console.log(`Game reset response: ${JSON.stringify(response)}`);
    const body = await response.json();
    return body;
  },
  async resetAssignment(student, assignmentId) {
    const response = await fetch(
      `/api/v1/game/admin/reset?student=${student}&assignmentId=${assignmentId}`,
      {
        method: "post",
        headers: {
          Accept: "application/json"
        }
      }
    );
    console.log(`Game reset response: ${JSON.stringify(response)}`);
    const body = await response.json();
    return body;
  },
  async requestRedo(student, assignmentId, taskId, reason) {
    const response = await fetch(
      `/api/v1/game/admin/request_redo`,
      {
        method: "post",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          student: student,
          assignmentId: assignmentId,
          taskId: taskId,
          reason: reason
        })

      }
    );
    console.log(`Request redo: ${JSON.stringify(response)}`);
    const body = await response.json();
    return body;
  },
  async gradeTask(student, assignmentId, taskId, points, preventSecondChance) {
    const response = await fetch(
      `/api/v1/game/admin/grade`,
      {
        method: "post",
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify({
          student: student,
          assignmentId: assignmentId,
          taskId: taskId,
          points: points,
          preventSecondChance: preventSecondChance
        })
      }
    );
    console.log(`Grade task: ${JSON.stringify(response)}`);
    const body = await response.json();
    return body;
  }
};
