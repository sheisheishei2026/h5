import React, { useState, useRef } from 'react';

const AudioPlayer = () => {
    const [audioSrc, setAudioSrc] = useState('');
    const [status, setStatus] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioSrc(url);
            setStatus(`正在播放: ${file.name}`);
        }
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus("您的浏览器不支持录音或未在 HTTPS 环境下");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                setAudioSrc(url);
                setStatus("录音完成");
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setStatus("正在录音...");
        } catch (err) {
            console.error(err);
            setStatus("无法获取麦克风权限");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <section className="card">
            <h2>🎵 音乐播放与录音</h2>
            <div className="api-demo">
                <label style={{display: 'inline-block', padding: '10px 20px', backgroundColor: '#317EFB', color: 'white', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', width: '100%', textAlign: 'center', boxSizing: 'border-box'}}>
                    📂 选择音乐文件
                    <input type="file" accept="audio/*" style={{display: 'none'}} onChange={handleFileSelect} />
                </label>
                
                <div style={{marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button onClick={startRecording} disabled={isRecording} style={{flex: '1 1 auto', minWidth: 0}}>🎤 开始录音</button>
                    <button onClick={stopRecording} disabled={!isRecording} style={{backgroundColor: isRecording ? '#ff4444' : '#ccc', flex: '1 1 auto', minWidth: 0}}>⏹ 停止</button>
                </div>
                
                <p style={{color: '#666', fontSize: '0.9rem'}}>{status}</p>
                
                {audioSrc && (
                    <audio controls src={audioSrc} style={{width: '100%', marginTop: '10px'}} />
                )}
            </div>
        </section>
    );
};

export default AudioPlayer;
