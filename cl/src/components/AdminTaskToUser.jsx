import React, { useEffect, useState } from "react";
import { UseAuth } from "../store/auth";
import "./AdminTaskToUser.css";
import Select from "react-select";
import ProfileUserShowHide from "./ProfileUserShowHide";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button } from 'react-bootstrap';

const AdminTaskToUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedUsersData, setSelectedUsersData] = useState([]);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [task, setTask] = useState("");
  const [projectname, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [description, setDescription] = useState("");
  const [completeWithIn, setCompleteWithIn] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showArchived, setShowArchived] = useState(false); // New state for archived tasks
  const { authorizationToken } = UseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replies, setReplies] = useState({});
  const [modalImageSrc, setModalImageSrc] = useState(""); // State for the modal image
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
   // State to manage notes modal
   const [showReadMoreModal, setShowReadMoreModal] = useState(false);
   const [currentTaskNotes, setCurrentTaskNotes] = useState([]);

  const getAllUsersData = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/taskToUser", {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });
      const data = await response.json();
      setUsers(
        data.map((user) => ({ value: user._id, label: user.email, ...user }))
      );
    } catch (error) {
      toast.error("Failed to fetch users data.");

      setError("Failed to fetch users data.");
    }
  };

  useEffect(() => {
    getAllUsersData();
    fetchAssignedTasks();
  }, []);

  const handleUserChange = (selectedOptions) => {
    setSelectedUser(selectedOptions);

    const selectedUserIds = selectedOptions.map((option) => option.value);
    const selectedUsersData = users.filter((user) =>
      selectedUserIds.includes(user.value)
    );
    setSelectedUsersData(selectedUsersData);
    setIsUserSelected(selectedUsersData.length > 0);

    selectedUsersData.forEach((user) => {
      if (user.position === "Intern") {
        const endDate = new Date(user.endDate);
        const currentDate = new Date();
        const differenceInTime = endDate.getTime() - currentDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

        if (differenceInDays <= 5 && differenceInDays >= 0) {
          alert(
            `Selected user ${user.email} is an intern and their end date is within 5 days. Be cautious when assigning tasks.`
          );
        } else if (differenceInDays < 0) {
          alert(
            `Selected user ${user.email} is an intern and their end date has passed. Please review their status.`
          );
        }
      }
    });
  };

  const handleTaskChange = (e) => {
    setTask(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleComplete = (e) => {
    setCompleteWithIn(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !task || !completeWithIn) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const completeWithinMilliseconds = parseCompleteWithin(completeWithIn);
      const deadline = new Date(Date.now() + completeWithinMilliseconds);

      const response = await fetch("http://localhost:3000/assignTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          userIds: selectedUser.map((user) => user.value),
          task: task,
          projectname: projectname,
          description: description,
          completeWithIn: completeWithIn,
          deadline: deadline.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Task assigned successfully!");
        setSelectedUser([]);
        setTask("");
        setDescription("");
        setCompleteWithIn("");
        fetchAssignedTasks();
      } else {
        toast.error("Error assigning task:", response.statusText);
        setError("Error assigning task.");
      }
    } catch (error) {
      toast.error("Error assigning task:", error.message);
      setError("Error assigning task.");
    } finally {
      setLoading(false);
    }
  };

  const parseCompleteWithin = (value) => {
    const timeValue = parseInt(value.split(" ")[0], 10);
    const timeUnit = value.split(" ")[1];

    switch (timeUnit) {
      case "hour":
      case "hours":
        return timeValue * 60 * 60 * 1000;
      case "day":
      case "days":
        return timeValue * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

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
      setFilteredTasks(data.reverse());
    } catch (error) {
      setError("Failed to fetch assigned tasks.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/tasks/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      if (response.ok) {
        setAssignedTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== id)
        );
      } else {
        setError("Failed to delete task.");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to delete task.");
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/tasks/updatePriority/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          body: JSON.stringify({
            priority: newPriority,
          }),
        }
      );

      if (response.ok) {
        fetchAssignedTasks(); // Refresh the task list after updating
      } else {
        console.error("Failed to update priority");
        setError("Failed to update priority.");
      }
    } catch (error) {
      console.error("Error updating priority:", error.message);
      setError("Error updating priority.");
    }
  };

  const updateTaskValidationStatus = async (taskId, newValidationStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/tasks/${taskId}/validationStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          body: JSON.stringify({
            validationStatus: newValidationStatus,
          }),
        }
      );

      if (response.ok) {
        fetchAssignedTasks(); // Refresh the task list after updating
      } else {
        console.error("Failed to update validation status");
        setError("Failed to update validation status.");
      }
    } catch (error) {
      console.error("Error updating validation status:", error.message);
      setError("Error updating validation status.");
    }
  };

  const archiveTask = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/tasks/archive/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: true }),
        }
      );
      if (response.ok) {
        fetchAssignedTasks(); // Refresh the task list after archiving
      } else {
        console.error("Failed to archive task");
        setError("Failed to archive task.");
      }
    } catch (error) {
      console.error("Error archiving task:", error.message);
      setError("Error archiving task.");
    }
  };

  const unarchiveTask = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/tasks/archive/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: false }),
        }
      );
      if (response.ok) {
        fetchAssignedTasks(); // Refresh the task list after unarchiving
      } else {
        console.error("Failed to unarchive task");
        setError("Failed to unarchive task.");
      }
    } catch (error) {
      console.error("Error unarchiving task:", error.message);
      setError("Error unarchiving task.");
    }
  };

  const handleImageClick = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const filtered = assignedTasks.filter((task) => {
      const searchString = searchQuery.toLowerCase();
      const nameMatch = task.assignedTo.some((user) =>
        user.name.toLowerCase().includes(searchString)
      );
      const emailMatch = task.emailTo.some((email) =>
        email.toLowerCase().includes(searchString)
      );
      return (
        (nameMatch || emailMatch) &&
        (showArchived ? task.archived : !task.archived)
      );
    });
    setFilteredTasks(filtered);
  }, [searchQuery, assignedTasks, showArchived]);

  if (error) return <div>Error: {error}</div>;

  const handleReplySubmit = async (taskId) => {
    const reply = replies[taskId];

    if (!reply) {
      toast.error("Reply cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/task/note/${taskId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          body: JSON.stringify({ noteReply: reply }),
        }
      );

      if (response.ok) {
        toast.success("Reply submitted successfully");
        setReplies((prevReplies) => ({
          ...prevReplies,
          [taskId]: "",
        }));
      } else {
        toast.error("Failed to submit reply");
      }
    } catch (error) {
      toast.error("Error submitting reply");
    }
  };

    // Function to sort notes by date (most recent first)
    const sortedNotes = (notes) => {
      return notes.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    };

        // Filter today's notes
  const getTodaysNotes = (notes) => {
    const today = new Date().toISOString().split('T')[0];
    return notes.filter(note => note.date.startsWith(today));
  };

  const handleModalOpenReadMore = (notes) => {
    setCurrentTaskNotes(notes);
    setShowReadMoreModal(true);
  };

  // Function to handle closing the modal
  const handleModalCloseReadMore = () => {
    setShowReadMoreModal(false);
    setCurrentTaskNotes([]);
  };
  
  return (
    <div className="Container">
      <ToastContainer />
      <div className="row">
        <div className="col-6">
          <h3 style={{ fontFamily: "popines" }}>Task To Team Members</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleSubmit} className="AdminTaskToUserForm">
            <label htmlFor="task">Enter Project Name :</label>
            <input
              type="text"
              id="task"
              value={projectname}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />

            <label htmlFor="task" className="mt-3">
              Select individual or multiple team members:
            </label>

            <Select
              id="users"
              isMulti
              options={users}
              styles={{ width: "338px" }}
              value={selectedUser}
              onChange={handleUserChange}
            />

            <br />
            <label htmlFor="task">Task:</label>
            <input
              type="text"
              id="task"
              value={task}
              onChange={handleTaskChange}
              placeholder="Enter task"
            />
            <br />
            <label htmlFor="description">Description:</label>
            <textarea
              type="text"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter task description"
            />
            <br />
            <label htmlFor="completeWithin">Expected to Complete in:</label>
            <select
              id="completeWithin"
              value={completeWithIn}
              onChange={handleComplete}
            >
              <option value="">Select time</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="5 hours">5 hours</option>
              <option value="6 hours">6 hours</option>
              <option value="1 day">1 day</option>
              <option value="2 days">2 days</option>
              <option value="3 days">3 days</option>
              <option value="4 days">4 days</option>
            </select>
            <br />
            <button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Task"}
            </button>
          </form>

          <div>
            <div className="AdminUsers">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Filter by Assignee"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ padding: "5px", width: "100%" }}
              />
            </div>

            <div className="archivetaskbtn">
              <button onClick={() => setShowArchived(!showArchived)}>
                {showArchived ? "Show Unarchived" : "Show Archived"}
              </button>
            </div>
          </div>
         
          <table className="tableFixHead2">
            <thead>
              <tr>
                <th>Task</th>
                <th>Description</th>
                <th>Assignee</th>
                <th>Assigned By</th>
                <th>Assigned At</th>
                <th>Priority</th>
                <th>Completed In</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Note</th>
                <th>Note Reply</th>
                <th>Challenges/issues</th>
                <th>Images</th>
                <th> Archive</th>
                <th>Actions</th>
              </tr>
            </thead>
            {filteredTasks.length > 0 ? (
              <tbody>
                {filteredTasks.map((assignedTask, index) => (
                  <tr key={index}>
                    <td>{assignedTask.task}</td>
                    <td>{assignedTask.description}</td>
                    <td>
                      {assignedTask.assignedTo
                        ? assignedTask.assignedTo
                            .map((user) => user.name)
                            .join(", ")
                        : "N/A"}
                    </td>
                    <td>{assignedTask.assignedByName}</td>
                    <td>
                      {new Date(assignedTask.createdAt).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }
                      )}
                    </td>
                    <td>
                      <select
                        value={assignedTask.priority}
                        onChange={(e) =>
                          updateTaskPriority(assignedTask._id, e.target.value)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td>{assignedTask.completeWithIn}</td>
                    <td>
                      {new Date(assignedTask.deadline).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td>
                      {filteredTasks.status === "Completed/Not Validated" ? (
                        <select
                          value={assignedTask.validationStatus}
                          onChange={(e) =>
                            updateTaskValidationStatus(
                              assignedTask._id,
                              e.target.value
                            )
                          }
                        >
                          <option value="validation pending">
                            Validation Pending
                          </option>
                          <option value="validated">Validated</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        assignedTask.status
                      )}
                    </td>
                    <td style={{ minWidth: '500px', maxWidth: '500px', overflow: 'auto' }}>
                      <div>
                      {assignedTask.note && assignedTask.note.length > 0 ? (
                        <>
                        <ul>
                        {getTodaysNotes(sortedNotes(assignedTask.note)).map((noteObj, index) => (
                          <li key={index}>
                            {noteObj.note} -{" "}
                            {new Date(noteObj.date).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => handleModalOpenReadMore(assignedTask.note)} className="btn btn-primary mx-3">Read More</button>
                      </>
                      ) : (
                        <span>No notes</span>
                      )}
                      </div>
                    </td>
                    <td>
                      <textarea
                        value={replies[assignedTask._id] || ""}
                        onChange={(e) =>
                          setReplies({
                            ...replies,
                            [assignedTask._id]: e.target.value,
                          })
                        }
                        placeholder="Reply to Note"
                      />
                      <button
                        onClick={() => handleReplySubmit(assignedTask._id)}
                        className="btn btn-primary mx-1"
                      >
                        Reply
                      </button>
                    </td>
                    <td>{assignedTask.completionNote}</td>
                    <td>
                      {assignedTask.images && assignedTask.images.length > 0
                        ? assignedTask.images.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={`http://localhost:3000/${image}`}
                              alt={`Task ${index} image ${imgIndex}`}
                              style={{
                                width: "50px",
                                height: "50px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleImageClick(
                                  `http://localhost:3000/${image}`
                                )
                              }
                            />
                          ))
                        : "No images"}
                    </td>

                    <td>
                      {assignedTask.archived ? (
                        <span
                          className="material-symbols-outlined"
                          onClick={() => unarchiveTask(assignedTask._id)}
                        >
                          unarchive
                        </span>
                      ) : (
                        <span
                          className="material-symbols-outlined"
                          onClick={() => archiveTask(assignedTask._id)}
                        >
                          archive
                        </span>
                      )}
                    </td>
                    <td>
                      <>
                        <span
                          className="material-symbols-outlined"
                          onClick={() => deleteTask(assignedTask._id)}
                        >
                          delete
                        </span>
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <div>No tasks assigned.</div>
            )}
          </table>
          
        </div>

        {isUserSelected && (
          <ProfileUserShowHide selectedUsersData={selectedUsersData} />
        )}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="close-btn" onClick={closeModal}>
                &times;
              </span>
              <img src={modalImageSrc} alt="Enlarged" className="modal-image" />
            </div>
          </div>
        )}
 <Modal show={showReadMoreModal} onHide={handleModalCloseReadMore}>
          <Modal.Header closeButton>
            <Modal.Title>All Notes for Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {currentTaskNotes && currentTaskNotes.length > 0 ? (
                sortedNotes(currentTaskNotes).map((noteObj, index) => (
                  <li key={index}>
                    {noteObj.note} - {new Date(noteObj.date).toLocaleString()}
                  </li>
                ))
              ) : (
                <span>No notes available</span>
              )}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalCloseReadMore}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default AdminTaskToUser;
