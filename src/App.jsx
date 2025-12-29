import React from 'react'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TodoList from './components/TodoList'
import CameraGallery from './components/CameraGallery'
import AudioPlayer from './components/AudioPlayer'
import Bluetooth from './components/Bluetooth'
import NotificationVibration from './components/NotificationVibration'
import Geolocation from './components/Geolocation'
import Sensors from './components/Sensors'
import FileExplorer from './components/FileExplorer'
import Game2048 from './components/Game2048'
import MovieList from './components/MovieList'
import MovieDetail from './components/MovieDetail'

function Home() {
  return (
    <div className="container">
      {/*<header style={{textAlign: 'center', marginBottom: '32px', paddingTop: '8px'}}>*/}
      {/*  <h1 style={{margin: '0 0 8px 0', fontSize: '28px'}}>React API Demo</h1>*/}
      {/*</header>*/}
      <main>
        {/* Games Section */}
        <section className="card games-section">
            <h2>🎮 游戏</h2>
            <div className="api-demo" style={{display: 'flex', gap: '12px', flexWrap: 'nowrap'}}>
                <Link to="/2048" style={{textDecoration: 'none', flex: '1 1 auto', minWidth: 0}}>
                    <button style={{background: '#edc22e', fontWeight: 'bold', color: '#fff', padding: '5px', fontSize: '16px', width: '100%'}}>
                        🎲 2048
                    </button>
                </Link>
                <a href={`${import.meta.env.BASE_URL}cal.html`} style={{textDecoration: 'none', flex: '1 1 auto', minWidth: 0}}>
                    <button style={{background: '#f1a33c', fontWeight: 'bold', color: '#fff', padding: '5px', fontSize: '16px', width: '100%'}}>
                        🧮 计算器
                    </button>
                </a>
                <a href={`${import.meta.env.BASE_URL}camera.html`} style={{textDecoration: 'none', flex: '1 1 auto', minWidth: 0}}>
                    <button style={{background: '#f1a33c', fontWeight: 'bold', color: '#fff', padding: '5px', fontSize: '16px', width: '100%'}}>
                        🧮 camera
                    </button>
                </a>
                <a href={`${import.meta.env.BASE_URL}device-api.html`} style={{textDecoration: 'none', flex: '1 1 auto', minWidth: 0}}>
                    <button style={{background: '#f1a33c', fontWeight: 'bold', color: '#fff', padding: '5px', fontSize: '16px', width: '100%'}}>
                        🧮 h5 api
                    </button>
                </a>
                <Link to="/movies" style={{textDecoration: 'none', flex: '1 1 auto', minWidth: 0}}>
                    <button style={{background: '#e74c3c', fontWeight: 'bold', color: '#fff', padding: '5px', fontSize: '16px', width: '100%'}}>
                        🎬 电影列表
                    </button>
                </Link>
            </div>
        </section>



        <CameraGallery />
        {/*<FileExplorer />*/}
        <AudioPlayer />
        <Bluetooth />
        <NotificationVibration />
        <Geolocation />
        <Sensors />
          <TodoList />

          <section className="card">
          <div>main:   pwa应用，支持离线</div>
          <div>h5:     纯h5应用，有api调用</div>
          <div>react2: react应用，部署需要编译</div>
          </section>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </Router>
  )
}

export default App
