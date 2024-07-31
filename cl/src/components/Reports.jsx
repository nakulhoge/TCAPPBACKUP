import React, { useEffect, useState } from "react";
import { UseAuth } from "../store/auth";
import * as XLSX from "xlsx";

const Reports = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { authorizationToken } = UseAuth();

  const fetchAssignedTasks = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/tasks", {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });
      const data = await response.json();
      setAssignedTasks(data);
      const uniqueProjects = [...new Set(data.map((task) => task.projectname))];
      setProjects(uniqueProjects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filterTasks = () => {
    let filteredTasks = assignedTasks;

    if (selectedProject) {
      filteredTasks = filteredTasks.filter(
        (task) => task.projectname === selectedProject
      );
    }

    if (dateFilter) {
      const now = new Date();
      if (dateFilter === "today") {
        filteredTasks = filteredTasks.filter(
          (task) =>
            new Date(task.createdAt).toDateString() === now.toDateString()
        );
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        filteredTasks = filteredTasks.filter(
          (task) =>
            new Date(task.createdAt) >= weekAgo &&
            new Date(task.createdAt) <= now
        );
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        filteredTasks = filteredTasks.filter(
          (task) =>
            new Date(task.createdAt) >= monthAgo &&
            new Date(task.createdAt) <= now
        );
      }
    }

    if (statusFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === statusFilter
      );
    }

    return filteredTasks;
  };

  const filteredTasks = filterTasks();

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTasks, {
      header: [
        "task",
        "assignedByName",
        "description",
        "priority",
        "status",
        "validationStatus",
        "deadline",
        "assignedTo",
        "projectname",
        "emailTo",
        "completionNote",
        "completeWithIn",
        "createdAt",
      ],
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");

    XLSX.writeFile(wb, "Filtered_Tasks.xlsx");
  };

  return (
    <div>
      <div>
        <label htmlFor="projectFilter" className="reports mx-2">
          Filter by Project:
        </label>
        <select id="projectFilter" onChange={handleProjectChange}>
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        <label className="mx-3" htmlFor="dateFilter">
          Filter by Date:
        </label>
        <select id="dateFilter" onChange={handleDateFilterChange}>
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <label className="mx-3" htmlFor="statusFilter">
          Filter by Status:
        </label>
        <select id="statusFilter" onChange={handleStatusFilterChange}>
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="WIP">WIP</option>
          <option value="Incomplete">Incompleted</option>
          <option value="Completed/Not Validated">
            Completed / Not Validated
          </option>
        </select>

        <button className="btn btn-primary mx-5" onClick={exportToExcel}>
          Export to Excel
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p>No tasks assigned.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned By</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Validation Status</th>
              <th>Deadline</th>
              <th>Assigned To</th>
              <th>Project Name</th>
              <th>Email To</th>
              <th>Completion Note</th>
              <th>Complete Within</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task._id}>
                <td>{task.task}</td>
                <td>{task.assignedByName}</td>
                <td>{task.description}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>{task.validationStatus}</td>
                <td>{new Date(task.deadline).toLocaleString()}</td>
                <td>{task.assignedTo.map((user) => user.email).join(", ")}</td>
                <td>{task.projectname}</td>
                <td>{task.emailTo.join(", ")}</td>
                <td>{task.completionNote}</td>
                <td>{task.completeWithIn}</td>
                <td>{new Date(task.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "20px 0",
  fontSize: "16px",
  textAlign: "left",
};

const thStyle = {
  borderBottom: "2px solid #ddd",
  padding: "10px",
  backgroundColor: "#f2f2f2",
  fontWeight: "bold",
};

const tdStyle = {
  borderBottom: "1px solid #ddd",
  padding: "10px",
};

export default Reports;
