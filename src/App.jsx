import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './PAGES/Login';
import Signup from './PAGES/Signup';
import Home from './PAGES/Home';
import CodeCompilerEditor from './components/CodeCompilerEditor';
import ProtectedRoute from './components/ProtectedRoute';
import UserFiles from './PAGES/UserFiles';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<CodeCompilerEditor />} />
        <Route path="/editor" element={<CodeCompilerEditor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/files" element={<UserFiles />} />
      </Routes>
    </Router>
  )
}

export default App
