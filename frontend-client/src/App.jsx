import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import PostDetail from './pages/PostDetail';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/posts/:id" element={<PostDetail />} />
    </Routes>
  </Router>
);

export default App;