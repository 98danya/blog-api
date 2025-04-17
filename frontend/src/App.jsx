import { Routes, Route } from "react-router-dom";
import Index from "./client/pages/Index";
import Login from "./client/pages/Login";
import Register from "./client/pages/Register";
import PostDetail from "./client/pages/PostDetail";
import Dashboard from "./admin/pages/Dashboard";
import NewPost from "./admin/pages/NewPost";
import EditPost from "./admin/pages/EditPost";
import DarkModeToggle from "./global/pages/DarkModeToggle";

const App = () => {
  return (
    <>
      <DarkModeToggle />
      <Routes>
        {/* Client routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts/:id" element={<PostDetail />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/new-post" element={<NewPost />} />
        <Route path="/admin/edit-post/:id" element={<EditPost />} />
      </Routes>
    </>
  );
};

export default App;
