import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Game2048 = () => {
    const [board, setBoard] = useState(Array(4).fill().map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Initialize game
    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        const newBoard = Array(4).fill().map(() => Array(4).fill(0));
        addNewTile(newBoard);
        addNewTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
    };

    const addNewTile = (currentBoard) => {
        const emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) {
                    emptyTiles.push({ r, c });
                }
            }
        }
        if (emptyTiles.length > 0) {
            const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    // Movement logic
    const move = (direction) => {
        if (gameOver) return;

        let newBoard = JSON.parse(JSON.stringify(board));
        let moved = false;
        let addedScore = 0;

        const rotateBoard = (b) => {
            const N = b.length;
            const res = Array(N).fill().map(() => Array(N).fill(0));
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    res[c][N - 1 - r] = b[r][c];
                }
            }
            return res;
        };

        // Normalize to left movement
        let rotations = 0;
        if (direction === 'up') rotations = 3; // Rotate 270 (or -90) to make 'up' become 'left'
        else if (direction === 'right') rotations = 2;
        else if (direction === 'down') rotations = 1;

        for (let i = 0; i < rotations; i++) {
            newBoard = rotateBoard(newBoard);
        }

        // Process Left Move
        for (let r = 0; r < 4; r++) {
            let row = newBoard[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    addedScore += row[i];
                    row.splice(i + 1, 1);
                }
            }
            while (row.length < 4) {
                row.push(0);
            }
            if (JSON.stringify(newBoard[r]) !== JSON.stringify(row)) {
                moved = true;
            }
            newBoard[r] = row;
        }

        // Rotate back
        for (let i = 0; i < (4 - rotations) % 4; i++) {
            newBoard = rotateBoard(newBoard);
        }

        if (moved) {
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(prev => prev + addedScore);
            if (checkGameOver(newBoard)) {
                setGameOver(true);
            }
        }
    };

    const checkGameOver = (currentBoard) => {
        // Check for empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) return false;
            }
        }
        // Check for merges
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (c < 3 && currentBoard[r][c] === currentBoard[r][c+1]) return false;
                if (r < 3 && currentBoard[r][c] === currentBoard[r+1][c]) return false;
            }
        }
        return true;
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch(e.key) {
                case 'ArrowUp': move('up'); break;
                case 'ArrowDown': move('down'); break;
                case 'ArrowLeft': move('left'); break;
                case 'ArrowRight': move('right'); break;
                default: return;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [board, gameOver]);

    // Touch support (basic swipe)
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) { // Threshold
                if (dx > 0) move('right');
                else move('left');
            }
        } else {
            if (Math.abs(dy) > 30) {
                if (dy > 0) move('down');
                else move('up');
            }
        }
    };

    const getTileColor = (value) => {
        const colors = {
            0: '#cdc1b4',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    };

    const getTextColor = (value) => {
        return value > 4 ? '#f9f6f2' : '#776e65';
    };

    return (
        <div style={{
            minHeight: '100vh', 
            backgroundColor: '#faf8ef', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '20px',
            touchAction: 'none' // Prevent scrolling while swiping
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        >
            <div style={{width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <Link to="/" style={{textDecoration: 'none', fontSize: '2rem', fontWeight: 'bold', color: '#776e65'}}>2048</Link>
                <div style={{backgroundColor: '#bbada0', padding: '5px 15px', borderRadius: '6px', color: 'white', textAlign: 'center'}}>
                    <div style={{fontSize: '0.8rem', textTransform: 'uppercase'}}>Score</div>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{score}</div>
                </div>
            </div>

            <div style={{
                backgroundColor: '#bbada0',
                padding: '10px',
                borderRadius: '6px',
                position: 'relative'
            }}>
                {/* Grid Background */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
                    {board.map((row, r) => row.map((val, c) => (
                        <div key={`${r}-${c}`} style={{
                            width: '70px',
                            height: '70px',
                            backgroundColor: getTileColor(val),
                            borderRadius: '3px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: val > 100 ? '1.5rem' : '2rem',
                            fontWeight: 'bold',
                            color: getTextColor(val),
                            transition: 'all 0.1s ease'
                        }}>
                            {val !== 0 ? val : ''}
                        </div>
                    )))}
                </div>

                {gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(238, 228, 218, 0.73)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '6px'
                    }}>
                        <h2 style={{fontSize: '3rem', color: '#776e65', margin: '0 0 20px 0'}}>Game Over!</h2>
                        <button onClick={initGame} style={{
                            backgroundColor: '#8f7a66',
                            color: 'white',
                            padding: '10px 20px',
                            fontSize: '1.2rem',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}>Try Again</button>
                    </div>
                )}
            </div>

            <div style={{marginTop: '20px', color: '#776e65', textAlign: 'center'}}>
                <p>Use <strong>arrow keys</strong> or <strong>swipe</strong> to combine tiles.</p>
                <Link to="/" style={{color: '#776e65', textDecoration: 'underline'}}>Return Home</Link>
            </div>
        </div>
    );
};

export default Game2048;

