import './App.css';
import MainPage from './MainPage/MainPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import CollectionsExplorePage from './pages/CollectionsExplorePage';
import CollectionDetailPage from './pages/CollectionDetailPage';

const router = createBrowserRouter([
  { path: '/', element: <MainPage /> },
  { path: '/Login', element: <AuthPage initialMode="login" /> },
  { path: '/Signup', element: <AuthPage initialMode="signup" /> },
  { path: '/Admin', element: <AdminDashboard /> },
  { path: '/collections', element: <CollectionsExplorePage /> },
  { path: '/collections/:id', element: <CollectionDetailPage /> },
  { path: '/profile/:username', element: <ProfilePage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/Profile', element: <ProfilePage /> },
]);



function App() {
  return (
    <RouterProvider router={router}/>
  )
    
}

export default App;
