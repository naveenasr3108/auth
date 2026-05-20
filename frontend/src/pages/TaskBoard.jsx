import { useEffect, useState } from "react";
import { fetchProtected } from "../services/fetchProtected";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  // Load Tasks
  const loadTasks = async () => {
    try {
      const data = await fetchProtected("/tasks");
      setTasks(data);
    } catch {
      // Mock fallback
      setTasks([
        {
          id: 1,
          title: "Setup backend",
          status: "todo",
          assignee: "You",
          priority: "High",
          dueDate: "2026-08-01",
        },
        {
          id: 2,
          title: "Create UI",
          status: "inprogress",
          assignee: "Alex",
          priority: "Medium",
          dueDate: "2026-08-02",
        },
        {
          id: 3,
          title: "Deploy app",
          status: "done",
          assignee: "Sam",
          priority: "Low",
          dueDate: "2026-08-05",
        },
      ]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Task Filters
  const todo = tasks.filter(
    (t) => t.status === "todo"
  );

  const inProgress = tasks.filter(
    (t) => t.status === "inprogress"
  );

  const done = tasks.filter(
    (t) => t.status === "done"
  );

  // Column Style
  const columnStyle = {
    flex: 1,
    background: "#e5e7eb",
    borderRadius: "20px",
    padding: "18px",
    minHeight: "500px",
  };

  // Priority Colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ef4444";

      case "Medium":
        return "#f59e0b";

      case "Low":
        return "#10b981";

      default:
        return "#6b7280";
    }
  };

  // Task Card
  const TaskCard = ({ task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
    } = useDraggable({
      id: task.id.toString(),
    });

    const style = {
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : undefined,
      cursor: "grab",
      background: "white",
      padding: "18px",
      borderRadius: "18px",
      marginBottom: "14px",
      transition: "0.25s",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            "translateY(-3px)";
          e.currentTarget.style.boxShadow =
            "0 10px 20px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "translateY(0)";
          e.currentTarget.style.boxShadow =
            "none";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h3
            style={{
              color: "#111827",
              fontSize: "18px",
            }}
          >
            {task.title}
          </h3>

          <div
            style={{
              background:
                getPriorityColor(task.priority),
              color: "white",
              padding: "6px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {task.priority}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          <p>
            👤 {task.assignee}
          </p>

          <p>
            📅 {task.dueDate}
          </p>
        </div>
      </div>
    );
  };

  // Droppable Column
  const DroppableColumn = ({
    id,
    title,
    tasks,
  }) => {
    const { setNodeRef } = useDroppable({
      id,
    });

    return (
      <div
        ref={setNodeRef}
        style={columnStyle}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              color: "#111827",
            }}
          >
            {title}
          </h2>

          <div
            style={{
              background: "#d1d5db",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "14px",
            }}
          >
            {tasks.length}
          </div>
        </div>

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
          />
        ))}
      </div>
    );
  };

  // Drag Logic
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id.toString() === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "35px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "38px",
              color: "#111827",
              marginBottom: "6px",
            }}
          >
            Task Board
          </h1>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            Manage and track team tasks
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={loadTasks}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "12px",
              background: "white",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "white";
            }}
          >
            Refresh
          </button>

          <button
            onClick={() =>
              navigate("/create-task")
            }
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "12px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
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
            + Create Task
          </button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          <DroppableColumn
            id="todo"
            title="To Do"
            tasks={todo}
          />

          <DroppableColumn
            id="inprogress"
            title="In Progress"
            tasks={inProgress}
          />

          <DroppableColumn
            id="done"
            title="Done"
            tasks={done}
          />
        </div>
      </DndContext>
    </div>
  );
}