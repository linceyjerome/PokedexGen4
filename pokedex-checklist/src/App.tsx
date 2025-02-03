import { useState } from 'react';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <h1 className="text-3xl font-bold ">Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>Edit src/App.tsx and save to test HMR</p>
                <h1>booba</h1>
            </div>
        </div>
    );
}

export default App;
