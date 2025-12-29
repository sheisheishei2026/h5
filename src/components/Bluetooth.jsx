import React, { useState } from 'react';

const Bluetooth = () => {
    const [output, setOutput] = useState('等待操作...');

    const scanDevices = async () => {
        if (!navigator.bluetooth) {
            setOutput("❌ 您的浏览器不支持 Web Bluetooth API (或未在 HTTPS 环境下)");
            return;
        }

        try {
            setOutput("正在扫描设备... (请在弹出的窗口中选择设备)");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service']
            });

            setOutput(`✅ 已选择设备: ${device.name || '未知设备'} (ID: ${device.id})`);
            
            setOutput(prev => prev + "\n正在尝试连接 GATT Server...");
            const server = await device.gatt.connect();
            setOutput(prev => prev + "\n✅ 连接成功!");
            
        } catch (error) {
            console.log('Bluetooth error: ', error);
            if (error.name === 'NotFoundError') {
                setOutput("操作取消");
            } else {
                setOutput(`❌ 连接失败: ${error.message}`);
            }
        }
    };

    return (
        <section className="card">
            <h2>🔵 蓝牙设备</h2>
            <div className="api-demo">
                <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '10px'}}>
                    注：Web 无法直接开关系统蓝牙或调节系统音量，但可以连接附近的 BLE 设备。
                </p>
                <button onClick={scanDevices}>🔍 扫描蓝牙设备</button>
                <div className="output-box" style={{whiteSpace: 'pre-wrap', color: output.startsWith('❌') ? 'red' : 'inherit'}}>{output}</div>
            </div>
        </section>
    );
};

export default Bluetooth;
