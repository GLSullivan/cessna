import './App.css';
import Cessna from './components/Cessna';
import Welcome from './components/Welcome';

function App() {
  return (
    <div className="App">
      <Welcome/>   
      <Cessna/>
      <div className="credit-block">Created by Greg Sullivan</div>
    </div>
  );
}

export default App;
