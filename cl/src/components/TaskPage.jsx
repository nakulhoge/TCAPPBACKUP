import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import "./AdminTaskToUser.css";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showReadMoreModal, setShowReadMoreModal] = useState(false);
  const [showReadMoreRepliesModal, setShowReadMoreRepliesModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTaskNotes, setCurrentTaskNotes] = useState([]);
  const [currentTaskNotesReplies, setCurrentTaskNotesReplies] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }
      const response = await fetch("http://localhost:3000/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleStatusChange = (taskId, status) => {
    updateTaskStatus(taskId, status);
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/tasks/${taskId}`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update task status");
      }

      // Update the tasks list
      const updatedTasks = tasks.map((task) => {
        if (task._id === taskId) {
          return { ...task, status };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleModalOpen = (taskId) => {
    setCurrentTaskId(taskId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentTaskId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the note is empty
    if (!note.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    if (!currentTaskId) {
      console.error("Task ID is missing");
      return;
    }

    setIsSubmitting(true); // Indicate that submission is in progress

    try {
      const response = await axios.post(
        `http://localhost:3000/tasks/${currentTaskId}/note`,
        { note }
      );
      toast.success("Note submitted successfully");
      setNote("");
      setShowModal(false);
      fetchTasks(); // Refresh tasks to show the new note
    } catch (error) {
      console.error("Error submitting note:", error);
      toast.error("Failed to submit note");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  // Function to sort notes by date (most recent first)
  const sortedNotes = (notes) => {
    return notes.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  };
    // Function to sort note reply by date (most recent first)
    const sortedNotesReplies = (noteReplies) => {
      return noteReplies.slice().sort((a, b) => new Date(b.repliedAt) - new Date(a.repliedAt));
    };

      // Filter today's notes
  const getTodaysNotes = (notes) => {
    const today = new Date().toISOString().split('T')[0];
    return notes.filter(note => note.date.startsWith(today));
  };

  const getTodaysNotesReplies = (noteReplies) => {
    const today = new Date().toISOString().split('T')[0];
    return noteReplies.filter(note => new Date(note.repliedAt).toISOString().split('T')[0] === today);
  };

  const handleOpenModalForReadMore = (taskId) => {
    const task = tasks.find((task) => task._id === taskId);
    setCurrentTaskId(taskId);
    setCurrentTaskNotes(task.note); // Set notes for the selected task
    setShowReadMoreModal(true);
  };

  const handleOpenModalForReadMoreReplies = (taskId) => {
    const task = tasks.find((task) => task._id === taskId);
    setCurrentTaskId(taskId);
    setCurrentTaskNotesReplies(task.noteReplies); // Set notes for the selected task
    setShowReadMoreRepliesModal(true);
  };

  const handleModalCloseReadMore = () => {
    setShowReadMoreModal(false);
    setCurrentTaskId(null);
    setCurrentTaskNotes([]);
  };
  const handleModalCloseReadMoreReplies = () => {
    setShowReadMoreRepliesModal(false);
    setCurrentTaskId(null);
    setCurrentTaskNotes([]);
  };
  
  return (
    <div className="container-fluid">
      <Navbar />
      <ToastContainer />
      <h2>Tasks Assigned to You</h2>
      <table className="tableFixHead">
        <thead>
          <tr>
            <th>Task</th>
            <th>Description</th>
            <th>Status</th>
            <th>Assigned By</th>
            <th>Deadline</th>
            <th>Write a Note</th>
            <th>Notes</th>
            <th>Note Reply</th>
            <th>Time Left/Comments</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.task}</td>
              <td>{task.description}</td>
              <td>
                {task.status === "Completed/Not Validated" ? (
                  task.validationStatus === "rejected" ? (
                    <>
                      <div className="message" style={{ color: "red" }}>
                        Task validation status is rejected. Please complete it
                        and update status again.
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Completed/Not Validated">
                          Completed/Not Validated
                        </option>
                        <option value="WIP">WIP</option>
                        <option value="Incomplete">Incomplete</option>
                      </select>
                    </>
                  ) : (
                    task.validationStatus
                  )
                ) : (
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="WIP">WIP</option>
                    <option value="Completed/Not Validated">
                      Completed/Not Validated
                    </option>
                  </select>
                )}
              </td>
              <td>{task.assignedByName}</td>
              <td>
                {new Date(task.deadline).toLocaleString("en-GB", {
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
                <a
                  href="#!"
                  onClick={() => handleModalOpen(task._id)}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  Write a Note
                </a>
              </td>
              <td>
                {task.note && task.note.length > 0 ? (
                  <div>
                    <ul>
                      {getTodaysNotes(sortedNotes(task.note)).map((noteObj, index) => (
                        <li key={index}>
                          {noteObj.note} - {new Date(noteObj.date).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                    {task.note.length > 0 && (
                      <button onClick={() => handleOpenModalForReadMore(task._id)} className="btn btn-primary mx-3">
                        Read More
                      </button>
                    )}
                  </div>
                ) : (
                  <span>No notes</span>
                )}
              </td>
              <td>
  {task.noteReplies && task.noteReplies.length > 0 ? (
    <div>
      <ul>
        {getTodaysNotesReplies(sortedNotesReplies(task.noteReplies)).map((noteObj, index) => (
          <li key={index}>
            {noteObj.reply} - {new Date(noteObj.repliedAt).toLocaleString()}
          </li>
        ))}
      </ul>
      <button
        onClick={() => handleOpenModalForReadMoreReplies(task._id)}
        className="btn btn-primary mx-3"
      >
        Read More
      </button>
    </div>
  ) : (
    <span>No notes</span>
  )}
</td>
              <td>
                <Timer
                  deadline={task.deadline}
                  taskId={task._id}
                  status={task.status}
                  taskName={task.task}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} style={formStyle}>
            <textarea
              type="text"
              placeholder="Ask me anything regarding this task..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={textareaStyle}
            />
            <button type="submit" style={buttonStyle} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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

      <Modal show={showReadMoreRepliesModal} onHide={handleModalCloseReadMore}>
        <Modal.Header closeButton>
          <Modal.Title>All Notes Replies for Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {currentTaskNotesReplies && currentTaskNotesReplies.length > 0 ? (
              sortedNotesReplies(currentTaskNotesReplies).map((noteObj, index) => (
                <li key={index}>
                  {noteObj.reply} - {new Date(noteObj.repliedAt).toLocaleString()}
                </li>
              ))
            ) : (
              <span>No notes Replies available</span>
            )}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalCloseReadMoreReplies}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const textareaStyle = {
  width: "100%",
  height: "100px",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "16px",
  resize: "vertical",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  color: "#fff",
  backgroundColor: "#000",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

export default TaskPage;
