import React, { useState, useEffect } from 'react';

const Sensors = () => {
    const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
    const [isSensorRunning, setIsSensorRunning] = useState(false);

    const handleMotion = (event) => {
        const { x, y, z } = event.accelerationIncludingGravity;
        setAcc({
            x: x ? x.toFixed(2) : 0,
            y: y ? y.toFixed(2) : 0,
            z: z ? z.toFixed(2) : 0
        });
    };

    const startSensor = () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                        setIsSensorRunning(true);
                    } else {
                        alert('权限被拒绝');
                    }
                })
                .catch(console.error);
        } else {
            if (!isSensorRunning) {
                window.addEventListener('devicemotion', handleMotion);
                setIsSensorRunning(true);
            }
        }
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, []);

    return (
        <section className="card">
            <h2>🧭 传感器 (加速度)</h2>
            <div className="api-demo">
                <button onClick={startSensor} disabled={isSensorRunning}>
                    {isSensorRunning ? "传感器已开启" : "开启传感器权限"}
                </button>
                <div className="output-box">
                    X: <span>{acc.x}</span><br />
                    Y: <span>{acc.y}</span><br />
                    Z: <span>{acc.z}</span>
                </div>
            </div>
        </section>
    );
};

export default Sensors;
