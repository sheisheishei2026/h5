import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './MovieDetail.css'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [movie, setMovie] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    // 如果从列表页传递了movie数据，直接使用
    if (location.state?.movie) {
      setMovie(location.state.movie)
      setLoading(false)
      return
    }

    // 否则从JSON文件加载
    fetch(`${import.meta.env.BASE_URL}movie2.json`)
      .then(response => response.json())
      .then(data => {
        setMovies(data)
        if (data[parseInt(id)]) {
          setMovie(data[parseInt(id)])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load movie:', err)
        setLoading(false)
      })
  }, [id, location.state])

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-detail-container">
        <div className="error">电影不存在</div>
        <button className="back-button" onClick={() => navigate('/movies')} style={{width: '100%'}}>返回列表</button>
      </div>
    )
  }

  return (
    <div className="movie-detail-container">
      <button className="back-button" onClick={() => navigate('/movies')}>
        <span className="back-icon">←</span>
        <span className="back-text">返回列表</span>
      </button>

      <div className="movie-detail-content">
        <div className="movie-detail-poster">
          {movie.src ? (
            <img src={movie.src} alt={movie.title} onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="movie-poster-placeholder" style={{display: movie.src ? 'none' : 'flex'}}>
            <span>暂无封面</span>
          </div>
        </div>

        <div className="movie-detail-info">
          <h1 className="movie-detail-title">{movie.title || '未知标题'}</h1>
          
          <div className="movie-detail-meta">
            {movie.country && (
              <div className="meta-item">
                <span className="meta-label">国家/地区:</span>
                <span className="meta-value">{movie.country}</span>
              </div>
            )}
            {movie.director && (
              <div className="meta-item">
                <span className="meta-label">导演:</span>
                <span className="meta-value">{movie.director}</span>
              </div>
            )}
            {movie.mainActor && (
              <div className="meta-item">
                <span className="meta-label">主演:</span>
                <span className="meta-value">{movie.mainActor}</span>
              </div>
            )}
            {movie.updateTime && (
              <div className="meta-item">
                <span className="meta-label">年份:</span>
                <span className="meta-value">{movie.updateTime}</span>
              </div>
            )}
          </div>

          {movie.intro && (
            <div className="movie-detail-intro">
              <h3>简介</h3>
              <p>{movie.intro}</p>
            </div>
          )}

          {movie.m3u8 && (
            <div className="movie-detail-player">
              <h3>播放</h3>
              <div className="video-wrapper">
                {videoLoading && !videoError && (
                  <div className="video-loading">
                    <div className="loading-spinner"></div>
                    <p>视频加载中...</p>
                  </div>
                )}
                {videoError && (
                  <div className="video-error">
                    <p>⚠️ 视频加载失败</p>
                    <p className="error-hint">请尝试点击下方按钮在新窗口打开播放页面</p>
                  </div>
                )}
                <video 
                  ref={videoRef}
                  controls 
                  className="video-player"
                  preload="metadata"
                  onLoadedData={() => {
                    setVideoLoading(false)
                    setVideoError(false)
                  }}
                  onError={(e) => {
                    console.error('Video error:', e)
                    setVideoError(true)
                    setVideoLoading(false)
                  }}
                  onLoadStart={() => {
                    setVideoLoading(true)
                    setVideoError(false)
                  }}
                  playsInline
                  webkit-playsinline="true"
                >
                  <source src={movie.m3u8} type="application/x-mpegURL" />
                  您的浏览器不支持视频播放
                </video>
              </div>
              {movie.a2 && (
                <a 
                  href={movie.a2} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <span className="external-link-icon">🔗</span>
                  <span className="external-link-text">在新窗口打开播放页面</span>
                  <span className="external-link-arrow">↗</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetail

