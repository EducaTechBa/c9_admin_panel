export default {
  async getFileContent(student, assignmentId, taskId, filename) {
    const url = `/api/v1/game/admin/student_file?student=${student}&assignmentId=${assignmentId}&taskId=${taskId}&filename=${filename}`;
    let response = await fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json"
      }
    });
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getGroups() {
    let response = await fetch("/services/game_statistics.php?action=groups", {
      method: "get",
      headers: {
        Accept: "application/json"
      }
    });
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getGroupMembers(groupId) {
    let response = await fetch(
      `/services/game_statistics.php?action=groupMembers&groupId=${groupId}`,
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getStudentInfo(username) {
    let response = await fetch(
      `/api/v1/game/admin/player?student=${username}`,
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getLeaderboard() {
    let response = await fetch(
      "/api/v1/game/admin/leaderboard",
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async searchUsers() {
    let response = await fetch(
      `/api/v1/game/admin/search?query=${query}`,
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getGeneral() {
    let response = await fetch("/api/v1/game/admin/stats", {
      method: "get",
      headers: {
        Accept: "application/json"
      }
    });
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  },
  async getAssignments() {
    let response = await fetch(
      "/api/v1/game/admin/assignments",
      {
        method: "get",
        headers: {
          Accept: "application/json"
        }
      }
    );
    let body = await response.json();
    if (!body.success) {
      if (body.message && body.message.includes("logged")) {
        const event = new Event("logout");
        document.dispatchEvent(event);
      }
    }
    return body;
  }
};
