import React from 'react'
import './App.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import NotFound from './components/NotFound'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Autentication/Login'
import Register from './Pages/Autentication/Register'
import Hotels from './components/PropertyType_Details/Hotels'



const App = () => {
  return (
    <div >

      <BrowserRouter>
        <Header />

        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/hotels' element={<Hotels />}></Route>
          <Route path='/*' element={<NotFound />}></Route>
        </Routes>
        <Footer />
      </BrowserRouter>

    </div>
  )
}

export default App
