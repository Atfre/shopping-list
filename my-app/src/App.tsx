import { useReducer, useState } from 'react'
import { useEffect } from 'react'
import './App.css'

type Item = {  
  id: number;
  title: string;
  bought: boolean;
};

type Action =
  | { type: "ADD"; payload: string }
  | { type: "REMOVE"; payload: number }
  | { type: "BUY"; payload: number };


function App() {
  const [items, dispatch] = useReducer(ItemReducer, [], loadItems);

  const addItem = (title: string) => {
    if (title.trim() === "") return;
    dispatch({ type: "ADD", payload: title });
  }

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE", payload: id });
  }

  const toggleBought = (id: number) => {
    dispatch({ type: "BUY", payload: id });
  }

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  return (
    <div className="App">
      <h2>🛒 Shopping List</h2>
      <ItemInput onAdd={addItem} />
      <ItemList 
        items={items} 
        onDelete={removeItem}
        onToggleBought={toggleBought}
      />
    </div>
  );
}

function ItemReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "ADD":
      if (action.payload.trim() === "") return state;
      return [
        ...state,
        { id: Date.now(), title: action.payload, bought: false }
      ];
    case "REMOVE":
      return state.filter(item => item.id !== action.payload);
    case "BUY":
      return state.map(item =>
        item.id === action.payload ? { ...item, bought: !item.bought } : item
      );
    default:
      return state;
  }
}

function ItemInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <div>
      <input
        placeholder="Type a product..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => {
        onAdd(text);
        setText("");
      }}>
        Add
      </button>
    </div>
  );
}

function ItemList({
  items,
  onDelete,
  onToggleBought
}: {
  items: Item[];
  onDelete: (id: number) => void;
  onToggleBought: (id: number) => void;
}) {
  return (
    <>
      {items.map(item => (
        <p key={item.id} style={{ color: item.bought ? "gray" : "white", textDecoration: item.bought ? "line-through" : "none" }}>
          {item.title}
          <button id="delete" onClick={() => onDelete(item.id)}>❌</button>
          <button id="bought" onClick={() => onToggleBought(item.id)}>
            {item.bought ? "Undo" : "Buy"}
          </button>
        </p>
      ))}
    </>
  );
}

function loadItems(): Item[] {
  const data = localStorage.getItem("items");
  return data ? JSON.parse(data) : [];
}

export default App