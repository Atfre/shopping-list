import { useReducer, useState } from 'react'
import { useEffect } from 'react'
import './App.css'

type Item = {  
  id: number;
  title: string;
  quantity: number;
  bought: boolean;
};

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

type Action =
  | { type: "ADD"; payload: string }
  | { type: "REMOVE"; payload: number }
  | { type: "BUY"; payload: number }
  | { type: "CLEAR_BOUGHT" }
  | { type: "ADD_FROM_STORE"; payload: Product };


function App() {
  const [items, dispatch] = useLocalStorageReducer(ItemReducer, "items", []);

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

  const clearBought = () => {
    dispatch({ type: "CLEAR_BOUGHT" });
  }

  return (
    <div className="App">
      <h2>📝 Shopping App</h2>
      <ItemInput onAdd={addItem} />
      <ItemList 
        items={items} 
        onDelete={removeItem}
        onToggleBought={toggleBought}
      />
      <button onClick={clearBought}>Clear Bought Products</button>
      <hr />
      <h2>🛒 Store</h2>
      <h3>A selection of our best products!</h3>
      <ProductList onAddFromApi={dispatch} />
    </div>
  );
}

function useLocalStorageReducer<S, A>( reducer: React.Reducer<S, A>, key: string, initialState: S ) {
  const initializer = (initialValue: S) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialValue;
  }

  const [state, dispatch] = useReducer(reducer, initialState, initializer);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, dispatch] as const;
}

function ItemReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "ADD":
      if (action.payload.trim() === "") return state;
      return [
        ...state,
        {
          id: Date.now(), title: action.payload, quantity: 0, bought: false
        }
      ];
    case "REMOVE":
      return state.filter(item => item.id !== action.payload);
    case "BUY":
      return state.map(item =>
        item.id === action.payload ? { ...item, bought: !item.bought } : item
      );
    case "CLEAR_BOUGHT":
      return state.filter(item => !item.bought);
    case "ADD_FROM_STORE": {
      const existing = state.find(item => item.id === action.payload.id);

      if (existing) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...state,
        {
          id: action.payload.id,
          title: action.payload.title,
          quantity: 1,
          bought: false
        }
      ];
    }
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
        <div className="item" key={item.id} style={{ color: item.bought ? "gray" : "white", textDecoration: item.bought ? "line-through" : "none" }}>
          {item.title} (x{item.quantity})
          <div className="item-buttons">
            <button id="delete" onClick={() => onDelete(item.id)}>Delete</button>
            <button id="bought" onClick={() => onToggleBought(item.id)}>
              {item.bought ? "Undo" : "Buy"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function ProductList({onAddFromApi}: { onAddFromApi: React.Dispatch<Action> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://fakestoreapi.com/products");

        if (!response.ok) {
          throw new Error("Network error");
        }

        const data: Product[] = await response.json();
        setProducts(data.slice(0, 5));

      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {products.map((product) => (
        <div key={product.id}>
          <h4>{product.title}</h4>
          <i>{product.description}</i>
          <p>${product.price} MX</p>
          <button onClick={() => onAddFromApi({ type: "ADD_FROM_STORE", payload: product })}>
            Add
          </button>
          <hr />
        </div>
      ))}
    </>
  );
}

export default App