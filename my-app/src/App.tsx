import { useState } from 'react'
import './App.css'
import { useEffect } from 'react'

type Task = {  
  id: number;
  title: string;
  completed: boolean;
};

type TaskInputProps = {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

type TaskListProps = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className="App">
      <h2>🛒 Shopping List</h2>
      <TaskInput setTasks={setTasks} />
      <TaskList tasks={tasks} setTasks={setTasks} />
    </div>
  );
}

function TaskInput({ setTasks }: TaskInputProps) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim() === "") return;
    setTasks(prev => [...prev, { id: Date.now(), title: text, completed: false }]);
    setText("");
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a product..."
      />
      <button id="add" onClick={handleAdd}>Add</button>
    </div>
  );
}

function TaskList({ tasks, setTasks }: TaskListProps) {
  const handleDelete = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <span>
      {tasks.map((task) => (
        <p key={task.id} style={{ color: task.completed ? "gray" : "white", textDecoration: task.completed ? "line-through" : "none" }}>
          {task.title}
          <button id="delete" onClick={() => handleDelete(task.id)}>❌</button>
          <button id="bought" onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}>
            {task.completed ? "🔄️" : "💲"}
          </button>
        </p>
      ))}
    </span>
  );
}

export default App