import React, { useState } from 'react';

const NotificationVibration = () => {
    const [vibrateMsg, setVibrateMsg] = useState('');

    const sendNotification = () => {
        if (!('Notification' in window)) {
            alert('此浏览器不支持通知功能');
            return;
        }

        const showNotify = () => {
            new Notification('你好!', {
                body: '这是一条来自 React PWA 的测试通知',
                icon: '/icons/icon-192.svg'
            });
        };

        if (Notification.permission === 'granted') {
            showNotify();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotify();
                }
            });
        } else {
            alert('您之前拒绝了通知权限，请在设置中开启');
        }
    };

    const vibrate = (pattern, text) => {
        if (!navigator.vibrate) {
            setVibrateMsg("❌ 设备不支持振动 API (如 iOS Safari)");
            return;
        }
        navigator.vibrate(pattern);
        setVibrateMsg(`✅ 已发送振动指令: ${text}`);
        setTimeout(() => setVibrateMsg(''), 2000);
    };

    return (
        <section className="card">
            <h2>🔔 通知与振动</h2>
            <div className="api-demo">
                <h3>通知 API</h3>
                <button onClick={sendNotification} style={{marginRight: '10px'}}>📨 发送通知</button>
                
                <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}} />
                
                <h3>振动 API</h3>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button onClick={() => vibrate(200, "一次短震")}>📳 200ms</button>
                    <button onClick={() => vibrate([100, 100, 100, 1000, 100, 100, 100, 1000], "心跳模式")}>💓 心跳</button>
                    <button onClick={() => vibrate(0, "停止")} style={{backgroundColor: '#ff4444'}}>🛑 停止</button>
                </div>
                {vibrateMsg && <div style={{marginTop: '10px', fontSize: '0.9rem'}}>{vibrateMsg}</div>}
            </div>
        </section>
    );
};

export default NotificationVibration;
