import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import Contact from './components/Contact/Contact.jsx'
import Founder, { founderInfoLoader } from './components/Founder/Founder.jsx'
import CourseSection from './components/courses/CourseSection.jsx'
import UnderDevelopment from './components/UnderDevelopment.jsx'
import AffiliationSection from './components/university/AffiliationSection.jsx'
import RegistrationForm from './components/Registration/RegistrationForm.jsx'
import UniversityDegrees from './components/university/UniversityDegrees.jsx'
import chatBot from './components/chatbot.jsx';
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import ProtectedRoute from './components/Admin/ProtectedRoute.jsx';
import AlumniSuccessGallery from "./components/AlumniSuccessGallery";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route 
      path='/' 
      element={<Layout />} 
      errorElement={<UnderDevelopment />}
    >
      <Route path='' element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />
      <Route path='courses' element={<CourseSection />} />
      <Route path='courses/:categoryId' element={<CourseSection />} />
      <Route path='founder' element={<Founder />} loader={founderInfoLoader} />
      <Route path='niit-university' element={<AffiliationSection />} />
      
      {/* UPDATED ROUTES: 
          1. 'registration' matches the navigate('/registration') from AdminDashboard.
          2. 'register/:courseId' preserves your existing course-specific links.
      */}
      <Route path='registration' element={<RegistrationForm />} />
      <Route path='register/:courseId' element={<RegistrationForm />} />
      
      <Route path='university-degrees' element={<UniversityDegrees />} />
      <Route path='chatbot' element={<chatBot />} />
      <Route path='admin/login' element={<AdminLogin />} />
      <Route path="/achievements" element={<AlumniSuccessGallery />} />
      <Route 
        path='admin/dashboard' 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)