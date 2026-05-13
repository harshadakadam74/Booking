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
import Apartments from './components/PropertyType_Details/Apartments'
import Resorts from './components/PropertyType_Details/Resorts'
import Villas from './components/PropertyType_Details/Villas'
import Cabins from './components/PropertyType_Details/Cabins'
import Cottages from './components/PropertyType_Details/Cottages'
import GlampingSites from './components/PropertyType_Details/GlampingSites'
import ServicedApartments from './components/PropertyType_Details/ServicedApartments'
import Deals from './components/ExploreDeals_Details/Deals'
import BookPage from './Pages/BookPage'
import BookPlace from './Pages/BookPlace'
import Payment from './Pages/Payment'
import PaymentSuccess from './Pages/PaymentSuccess'
import UserAccount from './Pages/UserAccount'
import ListProperty from './Pages/ListProperty'
import AccountBookings from './Pages/Account/Bookings'
import AccountFavorites from './Pages/Account/Favorites'
import AccountPayments from './Pages/Account/Payments'
import AccountSettings from './Pages/Account/Settings'
import PlaceholderPage from './Pages/PlaceholderPage'



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
          <Route path='/apartments' element={<Apartments />}></Route>
          <Route path='/resorts' element={<Resorts />}></Route>
          <Route path='/villas' element={<Villas />}></Route>
          <Route path='/cabins' element={<Cabins />}></Route>
          <Route path='/cottages' element={<Cottages />}></Route>
          <Route path='/glamping-sites' element={<GlampingSites />}></Route>
          <Route path='/serviced-apartments' element={<ServicedApartments />}></Route>
          <Route path='/deals' element={<Deals />}></Route>
          <Route path='/book' element={<BookPage />}></Route>
          <Route path='/book-place' element={<BookPlace />}></Route>
          <Route path='/payment' element={<Payment />}></Route>
          <Route path='/payment-success' element={<PaymentSuccess />}></Route>
          <Route path='/account' element={<UserAccount />}></Route>
          <Route path='/account/bookings' element={<AccountBookings />}></Route>
          <Route path='/account/favorites' element={<AccountFavorites />}></Route>
          <Route path='/account/payments' element={<AccountPayments />}></Route>
          <Route path='/account/settings' element={<AccountSettings />}></Route>
          <Route path='/list-property' element={<ListProperty />}></Route>

          {/* Support Routes */}
          <Route path='/trips' element={<PlaceholderPage title="Manage Your Trips" description="View and manage all your upcoming and past bookings" />}></Route>
          <Route path='/support' element={<PlaceholderPage title="Contact Customer Service" description="Get help with your bookings and account" />}></Route>
          <Route path='/safety' element={<PlaceholderPage title="Safety Resource Centre" description="Learn about our safety measures and travel tips" />}></Route>

          {/* Discover Routes */}
          <Route path='/genius' element={<PlaceholderPage title="Genius Loyalty Programme" description="Exclusive benefits for our most valued customers" />}></Route>
          <Route path='/articles' element={<PlaceholderPage title="Travel Articles" description="Inspiring stories and travel guides" />}></Route>
          <Route path='/business' element={<PlaceholderPage title="Booking.com for Business" description="Corporate travel solutions" />}></Route>
          <Route path='/awards' element={<PlaceholderPage title="Traveller Review Awards" description="Celebrating the best properties worldwide" />}></Route>
          <Route path='/agents' element={<PlaceholderPage title="Booking.com for Travel Agents" description="Partner with us as a travel agent" />}></Route>

          {/* Terms and Settings Routes */}
          <Route path='/privacy' element={<PlaceholderPage title="Privacy Notice" description="How we protect your personal information" />}></Route>
          <Route path='/terms' element={<PlaceholderPage title="Terms of Service" description="Legal terms and conditions" />}></Route>
          <Route path='/accessibility' element={<PlaceholderPage title="Accessibility Statement" description="Our commitment to accessibility" />}></Route>
          <Route path='/grievance' element={<PlaceholderPage title="Grievance Officer" description="Contact our grievance officer" />}></Route>
          <Route path='/slavery' element={<PlaceholderPage title="Modern Slavery Statement" description="Our stance against modern slavery" />}></Route>
          <Route path='/human-rights' element={<PlaceholderPage title="Human Rights Statement" description="Our human rights commitments" />}></Route>

          {/* Partners Routes */}
          <Route path='/extranet' element={<PlaceholderPage title="Extranet Login" description="Partner portal for property owners" />}></Route>
          <Route path='/partner-help' element={<PlaceholderPage title="Partner Help" description="Support for our partners" />}></Route>
          <Route path='/affiliate' element={<PlaceholderPage title="Become an Affiliate" description="Join our affiliate program" />}></Route>

          {/* About Routes */}
          <Route path='/about' element={<PlaceholderPage title="About FastBooking" description="Learn about our company and mission" />}></Route>
          <Route path='/how-we-work' element={<PlaceholderPage title="How We Work" description="Our business model and operations" />}></Route>
          <Route path='/sustainability' element={<PlaceholderPage title="Sustainability" description="Our environmental initiatives" />}></Route>
          <Route path='/press' element={<PlaceholderPage title="Press Centre" description="Latest news and press releases" />}></Route>
          <Route path='/careers' element={<PlaceholderPage title="Careers" description="Join our team" />}></Route>
          <Route path='/investors' element={<PlaceholderPage title="Investor Relations" description="Financial information and reports" />}></Route>
          <Route path='/contact' element={<PlaceholderPage title="Corporate Contact" description="Get in touch with our team" />}></Route>
          <Route path='/content-guidelines' element={<PlaceholderPage title="Content Guidelines and Reporting" description="Our content standards and reporting procedures" />}></Route>

          <Route path='/*' element={<NotFound />}></Route>
        </Routes>
        <Footer />
      </BrowserRouter>

    </div>
  )
}

export default App
