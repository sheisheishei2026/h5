import React from 'react'
import {HashRouter as Router, Route, Routes, Link} from 'react-router-dom'
import MovieList from './components/MovieList'
import MovieDetail from './components/MovieDetail'

function Home() {
  // 定义按钮配置，每个按钮都有不同的颜色
  const buttons = [
    {
      emoji: '🧮',
      text: '计算器',
      href: `${import.meta.env.BASE_URL}cal.html`,
      color: '#FF6B6B' // 红色
    },
    {
      emoji: '📱',
      text: 'h5 api',
      href: `${import.meta.env.BASE_URL}device-api.html`,
      color: '#4ECDC4' // 青色
    },
    {
      emoji: '📚',
      text: '学习',
      href: `${import.meta.env.BASE_URL}learn.html`,
      color: '#45B7D1' // 蓝色
    },
    {
      emoji: '📸',
      text: '写真',
      href: `${import.meta.env.BASE_URL}portfolio.html`,
      color: '#FFA07A' // 橙色
    },
    {
      emoji: '⚽',
      text: '滚球',
      href: `${import.meta.env.BASE_URL}game.html`,
      color: '#98D8C8' // 绿色
    },
    // {
    //   emoji: '🎬',
    //   text: '电影列表',
    //   href: '/movies',
    //   color: '#F7DC6F' // 黄色
    // }
  ]

  return (
    <div className="container fullscreen">
      <main className="fullscreen-main">
        <section className="card games-section fullscreen-section">
          <div className="button-list fullscreen-button-list">
            {buttons.map((btn, index) => {
              const ButtonContent = (
                <button
                  className="colorful-button fullscreen-button"
                  style={{
                    background: btn.color,
                    fontWeight: 'bold',
                    color: '#fff',
                    padding: '24px 20px',
                    fontSize: '20px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px ${btn.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    flex: '1'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 6px 20px ${btn.color}60`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = `0 4px 15px ${btn.color}40`
                  }}
                >
                  <span style={{fontSize: '32px'}}>{btn.emoji}</span>
                  <span>{btn.text}</span>
                </button>
              )

              // 如果是电影列表，使用 Link 组件
              if (btn.href === '/movies') {
                return (
                  <Link
                    key={index}
                    to={btn.href}
                    style={{textDecoration: 'none', display: 'flex', flex: '1'}}
                  >
                    {ButtonContent}
                  </Link>
                )
              }

              // 其他使用普通 a 标签
              return (
                <a
                  key={index}
                  href={btn.href}
                  style={{textDecoration: 'none', display: 'flex', flex: '1'}}
                >
                  {ButtonContent}
                </a>
              )
            })}
          </div>
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
        {/*<Route path="/2048" element={<Game2048 />} />*/}
        <Route path="/movies" element={<MovieList />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </Router>
  )
}

export default App
