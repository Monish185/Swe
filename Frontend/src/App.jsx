import { useEffect, useState } from 'react'
import './App.css'
import { Route,Routes, useLocation, useNavigate } from 'react-router-dom'
import GetStarted from './pages/GetStarted'
import RepoDetails from './pages/RepoDetails'
import Home from './pages/Home'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation();
  const navigate = useNavigate()

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if(token){
      localStorage.setItem('github_token',token);
      window.history.replaceState({},document.title,"/repos");
      navigate('/repos')
    }
  },[location,navigate])

  return (
    <>
      <Routes>
        <Route path='/' element={<GetStarted />} />
        <Route path='/repos' element={<Home />} />
        <Route path="/repo/:owner/:repo" element={<RepoDetails />} />
      </Routes>
    </>
  )
}

export default App
