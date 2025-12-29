import React, { useState } from 'react';

const Geolocation = () => {
    const [output, setOutput] = useState('等待获取...');

    const getLocation = () => {
        setOutput("正在获取位置...");
        if (!navigator.geolocation) {
            setOutput("您的浏览器不支持地理定位");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setOutput(
                    `纬度: ${latitude.toFixed(6)}\n` +
                    `经度: ${longitude.toFixed(6)}\n` +
                    `精度: ${accuracy} 米`
                );
            },
            (error) => {
                let msg = "获取失败";
                switch(error.code) {
                    case error.PERMISSION_DENIED: msg = "用户拒绝了位置请求"; break;
                    case error.POSITION_UNAVAILABLE: msg = "位置信息不可用"; break;
                    case error.TIMEOUT: msg = "请求超时"; break;
                }
                setOutput(`${msg} (Error: ${error.message})`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <section className="card">
            <h2>📍 地理定位</h2>
            <div className="api-demo">
                <button onClick={getLocation}>获取当前位置</button>
                <div className="output-box" style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{__html: output.replace(/\n/g, '<br/>')}}></div>
            </div>
        </section>
    );
};

export default Geolocation;
