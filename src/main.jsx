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
import StudentLogin from './components/StudentPortal/StudentLogin.jsx';
import ForgotPassword from './components/StudentPortal/ForgotPassword.jsx';
//import StudentDashboard from './components/StudentPortal/StudentDashboard.jsx';
import StudentLayout from './components/StudentPortal/StudentLayout.jsx';
import LiveLectures from './components/StudentPortal/LiveLectures.jsx';
//import ERPSidebar from './components/StudentPortal/ERPSidebar.jsx';
import ERPLayout from './components/StudentPortal/ERPLayout';
import StudentProfile from './components/StudentPortal/StudentProfile';
import FeeLedger from './components/StudentPortal/FeeLedger';
import StudyMaterial from './components/StudentPortal/StudyMaterial.jsx'
import { FaCertificate } from 'react-icons/fa'
import AddLecture from './components/Admin/AddLecture.jsx'
import Certificates from './components/StudentPortal/Certificates.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route 
      path='/' 
      element={<Layout />} 
      errorElement={<UnderDevelopment />}
    >
      {/* Public Routes */}
      <Route path='' element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='founder' element={<Founder />} />
      <Route path='halloffame' element={<AlumniSuccessGallery />} />
      <Route path='contact' element={<Contact />} />
      <Route path='courses' element={<CourseSection />} />
      <Route path='student-login' element={<StudentLogin />} />
      <Route path='forgot-password' element={<ForgotPassword />} />
      

      <Route path="erp" element={<ERPLayout />}>
        {/* These paths are relative to /erp/ */}
        <Route path="profile" element={<StudentProfile />} />
        <Route path="study-material" element={<StudyMaterial />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="live-lectures" element={<LiveLectures />} />
        <Route path="fee-ledger" element={<FeeLedger />} />
      </Route>

      {/* Admin and Other Routes */}
      <Route path='registration' element={<RegistrationForm />} />
      <Route path='admin/login' element={<AdminLogin />} />
      <Route 
        path='admin/dashboard' 
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
        
      />
      <Route path="add-lecture" element={<AddLecture />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)