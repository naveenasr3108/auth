import { useState } from "react";
import { fetchProtected } from "../services/fetchProtected";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateTask() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await fetchProtected("/tasks", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success(
        "Task created successfully!"
      );

      // small delay for toast visibility
      setTimeout(() => {
        navigate("/tasks");
      }, 1200);

    } catch {
      toast.error(
        "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* FORM CARD */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          padding: "35px",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* TOP */}
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Create Task
          </h1>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            Add a new task to your board
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={form.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* DESCRIPTION */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Description
            </label>

            <textarea
              name="description"
              placeholder="Task description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          {/* ASSIGNEE */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Assignee
            </label>

            <input
              type="text"
              name="assignee"
              placeholder="Assign to..."
              value={form.assignee}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* DUE DATE */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Due Date
            </label>

            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* PRIORITY */}
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Priority
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "14px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderRadius: "14px",
                background: "#111827",
                color: "white",
                cursor: "pointer",
                fontSize: "15px",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#111827";
              }}
            >
              {loading
                ? "Creating..."
                : "Create Task"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/tasks")
              }
              style={{
                flex: 1,
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "14px",
                background: "white",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}