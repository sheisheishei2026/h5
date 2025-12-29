import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './MovieList.css'

const ITEMS_PER_PAGE = 24 // 每页加载24个
const CACHE_KEY = 'movie2_cache'
const CACHE_TIMESTAMP_KEY = 'movie2_cache_timestamp'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时缓存

function MovieList() {
  const [allMovies, setAllMovies] = useState([])
  const [displayedMovies, setDisplayedMovies] = useState([])
  const [filteredMovies, setFilteredMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingProgress, setLoadingProgress] = useState('正在加载数据...')
  const observerRef = useRef(null)
  const loadingRef = useRef(null)
  const searchInputRef = useRef(null)

  // 安全地存储到 localStorage
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      // 如果存储失败（配额超限等），清除旧缓存并重试
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        try {
          // 尝试清除旧缓存
          localStorage.removeItem(CACHE_KEY)
          localStorage.removeItem(CACHE_TIMESTAMP_KEY)
          // 如果还是失败，就不缓存了
          try {
            localStorage.setItem(key, value)
            return true
          } catch {
            console.warn('localStorage quota exceeded, caching disabled')
            return false
          }
        } catch {
          console.warn('localStorage quota exceeded, caching disabled')
          return false
        }
      }
      return false
    }
  }

  // 加载数据 - 优化版本：快速显示 + 后台加载
  useEffect(() => {
    const loadMovies = async () => {
      try {
        // 检查缓存
        let cachedData = null
        let cacheTimestamp = null
        try {
          cachedData = localStorage.getItem(CACHE_KEY)
          cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        } catch (e) {
          console.warn('Failed to read cache:', e)
        }

        const now = Date.now()
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
          try {
            // 使用缓存数据 - 使用 requestIdleCallback 分批解析，快速显示
            const parseInBackground = (jsonString) => {
              return new Promise((resolve) => {
                // 立即显示前24个
                try {
                  const data = JSON.parse(jsonString)
                  // 快速显示前24个
                  setDisplayedMovies(data.slice(0, ITEMS_PER_PAGE))
                  setAllMovies(data)
                  setFilteredMovies(data)
                  setLoading(false)
                  setHasMore(data.length > ITEMS_PER_PAGE)
                  resolve(data)
                } catch (e) {
                  resolve(null)
                }
              })
            }
            
            const data = await parseInBackground(cachedData)
            if (data) return
          } catch (e) {
            try {
              localStorage.removeItem(CACHE_KEY)
              localStorage.removeItem(CACHE_TIMESTAMP_KEY)
            } catch {}
          }
        }

        // 从服务器加载 - 优化：异步解析，快速显示
        setLoadingProgress('正在下载数据...')
        const startTime = performance.now()
        
        const response = await fetch(`${import.meta.env.BASE_URL}movie2.json`)
        
        if (!response.ok) {
          throw new Error('Failed to load movies')
        }

        // 使用 response.text() 获取文本
        setLoadingProgress('正在解析数据...')
        const text = await response.text()
        const loadTime = performance.now() - startTime
        console.log(`JSON loaded in ${loadTime.toFixed(2)}ms`)

        // 使用异步解析，避免阻塞UI
        // 使用 requestIdleCallback 或 setTimeout 让浏览器有机会渲染
        const parseAsync = () => {
          return new Promise((resolve, reject) => {
            // 使用 setTimeout 将解析放到下一个事件循环
            setTimeout(() => {
              try {
                const parseStart = performance.now()
                const data = JSON.parse(text)
                const parseTime = performance.now() - parseStart
                console.log(`JSON parsed in ${parseTime.toFixed(2)}ms, total: ${(loadTime + parseTime).toFixed(2)}ms`)

                resolve(data)
              } catch (e) {
                reject(new Error('Failed to parse JSON'))
              }
            }, 0)
          })
        }

        const data = await parseAsync()
        
        // 立即显示前24个，让用户看到内容
        setDisplayedMovies(data.slice(0, ITEMS_PER_PAGE))
        setAllMovies(data)
        setFilteredMovies(data)
        setLoading(false)
        setHasMore(data.length > ITEMS_PER_PAGE)
        
        // 后台保存到缓存（不阻塞UI）
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {
            try {
              const dataString = JSON.stringify(data)
              safeSetItem(CACHE_KEY, dataString)
              safeSetItem(CACHE_TIMESTAMP_KEY, now.toString())
            } catch (e) {
              // 缓存失败不影响使用
            }
          })
        } else {
          setTimeout(() => {
            try {
              const dataString = JSON.stringify(data)
              safeSetItem(CACHE_KEY, dataString)
              safeSetItem(CACHE_TIMESTAMP_KEY, now.toString())
            } catch (e) {
              // 缓存失败不影响使用
            }
          }, 100)
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request aborted')
        } else {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadMovies()
  }, [])

  // 搜索功能
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    const trimmedQuery = query.trim().toLowerCase()
    
    if (!trimmedQuery) {
      // 清空搜索，显示所有电影
      setFilteredMovies(allMovies)
      setDisplayedMovies(allMovies.slice(0, ITEMS_PER_PAGE))
      setHasMore(allMovies.length > ITEMS_PER_PAGE)
      return
    }

    // 搜索逻辑：在标题、演员、简介、国家、年份中搜索
    const filtered = allMovies.filter(movie => {
      const title = (movie.title || '').toLowerCase()
      const mainActor = (movie.mainActor || '').toLowerCase()
      const intro = (movie.intro || '').toLowerCase()
      const country = (movie.country || '').toLowerCase()
      const updateTime = (movie.updateTime || '').toLowerCase()
      
      return title.includes(trimmedQuery) ||
             mainActor.includes(trimmedQuery) ||
             intro.includes(trimmedQuery) ||
             country.includes(trimmedQuery) ||
             updateTime.includes(trimmedQuery)
    })

    setFilteredMovies(filtered)
    setDisplayedMovies(filtered.slice(0, ITEMS_PER_PAGE))
    setHasMore(filtered.length > ITEMS_PER_PAGE)
  }, [allMovies])

  // 加载更多
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setTimeout(() => {
      const currentCount = displayedMovies.length
      const nextMovies = filteredMovies.slice(0, currentCount + ITEMS_PER_PAGE)
      setDisplayedMovies(nextMovies)
      setHasMore(nextMovies.length < filteredMovies.length)
      setLoadingMore(false)
    }, 100)
  }, [loadingMore, hasMore, displayedMovies.length, filteredMovies])

  // 无限滚动观察器
  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [hasMore, loading, loadMore])

  // 图片懒加载组件
  const LazyImage = React.memo(({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef(null)
    const timeoutRef = useRef(null)

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { rootMargin: '50px' }
      )

      if (imgRef.current) {
        observer.observe(imgRef.current)
      }

      return () => {
        observer.disconnect()
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    // 图片加载超时处理
    useEffect(() => {
      if (isInView && src && !isLoaded && !hasError) {
        // 设置8秒超时
        timeoutRef.current = setTimeout(() => {
          if (!isLoaded) {
            setHasError(true)
          }
        }, 8000)
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [isInView, src, isLoaded, hasError])

    const handleLoad = () => {
      setIsLoaded(true)
      setHasError(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    const handleError = () => {
      setHasError(true)
      setIsLoaded(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    // 如果没有src，直接显示占位符
    if (!src) {
      return (
        <div className="movie-poster" ref={imgRef}>
          <div className="movie-poster-placeholder">
            <span>暂无封面</span>
          </div>
        </div>
      )
    }

    // 如果图片加载失败，显示占位符
    if (hasError) {
      return (
        <div className="movie-poster" ref={imgRef}>
          <div className="movie-poster-placeholder">
            <span>暂无封面</span>
          </div>
        </div>
      )
    }

    return (
      <div className="movie-poster" ref={imgRef}>
        {!isLoaded && (
          <div className="movie-poster-placeholder">
            <span>加载中...</span>
          </div>
        )}
        {isInView && (
          <img
            src={src}
            alt={alt}
            style={{ display: isLoaded ? 'block' : 'none' }}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )}
        {isLoaded && (
          <div className="movie-poster-placeholder" style={{ display: 'none' }}>
            <span>暂无封面</span>
          </div>
        )}
      </div>
    )
  })

  if (loading) {
    return (
      <div className="movie-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{loadingProgress}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="movie-list-container">
        <div className="error">加载失败: {error}</div>
      </div>
    )
  }

  return (
    <div className="movie-list-container">
      <header className="movie-list-header">
        <h1>电影列表</h1>
        <p className="movie-count">
          {searchQuery.trim() 
            ? `找到 ${filteredMovies.length} 部电影（共 ${allMovies.length} 部）`
            : `共 ${allMovies.length} 部电影`
          }
        </p>
      </header>
      
      {/* 搜索框 */}
      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="搜索电影（标题、演员、简介、国家、年份）"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => {
                setSearchQuery('')
                handleSearch('')
                searchInputRef.current?.focus()
              }}
              aria-label="清除搜索"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果为空 */}
      {searchQuery.trim() && filteredMovies.length === 0 && (
        <div className="no-results">
          <p>😔 没有找到相关电影</p>
          <p className="no-results-hint">请尝试其他关键词</p>
        </div>
      )}

      <div className="movie-grid">
        {displayedMovies.map((movie, index) => {
          const globalIndex = allMovies.findIndex(m => m === movie)
          return (
            <Link
              key={`${globalIndex}-${index}`}
              to={`/movie/${globalIndex}`}
              state={{ movie }}
              className="movie-card"
            >
              <LazyImage
                src={movie.src}
                alt={movie.title}
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.title || '未知标题'}</h3>
                <div className="movie-meta">
                  {movie.country && <span className="movie-tag">{movie.country}</span>}
                  {movie.updateTime && <span className="movie-tag">{movie.updateTime}</span>}
                </div>
                {movie.intro && (
                  <p className="movie-intro">{movie.intro.substring(0, 100)}...</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      {hasMore && (
        <div ref={loadingRef} className="loading-more">
          {loadingMore ? '加载中...' : '滚动加载更多'}
        </div>
      )}
      {!hasMore && displayedMovies.length > 0 && (
        <div className="loading-more">
          {searchQuery.trim() 
            ? `已显示全部 ${filteredMovies.length} 个搜索结果`
            : `已加载全部 ${allMovies.length} 部电影`
          }
        </div>
      )}
    </div>
  )
}

export default MovieList

