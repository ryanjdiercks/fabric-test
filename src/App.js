import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import CanvasComponent from './pages/collision';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<CanvasComponent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
