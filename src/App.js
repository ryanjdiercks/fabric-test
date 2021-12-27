import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import StressTest from './pages/Stress';
import FabricGrid from './pages/FabricGrid';
import CanvasComponent from './pages/collision';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<StressTest />} />
          <Route exact path="/grid" element={<FabricGrid />} />
          <Route exact path="/collision" element={<CanvasComponent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
