import React, { useEffect, useState } from "react";
import { UseAuth } from "../store/auth";
import './TaskToUser.css'
import Container from 'react-bootstrap/Container';
const TaskToUser = () => {
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { authorizationToken } = UseAuth();

    useEffect(() => {
        fetchAssignedTasks();
      }, []);

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
          setFilteredTasks(data);
        } catch (error) {
          console.log(error);
          
        }
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
          return nameMatch || emailMatch;
        });
        setFilteredTasks(filtered);
      }, [searchQuery, assignedTasks]);
    
      
    
    return (
        
          <div className="marginForleft">
           <div className="AdminUsers ">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Filter by Assignee"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
        <table>
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
              <th>Challenges/issues</th>
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
                      ?assignedTask.assignedTo.map(user => user.name).join(", ")
                      : "N/A"}
                </td>
                <td>{assignedTask.assignedByName}</td>
                <td>{new Date(assignedTask.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
      })}</td>
                <td>

                    {assignedTask.priority}
                </td>
                <td>{assignedTask.completeWithIn}</td>
                <td>{new Date(assignedTask.deadline).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
      })}</td>
                <td>{assignedTask.status}</td>
                <td>{assignedTask.completionNote}</td>
               
              </tr>
            ))}
          
          </tbody>
            ) : (
              <div>No tasks assigned.</div>
            )}
        </table>
   
      </div>
    );
};

export default TaskToUser;

