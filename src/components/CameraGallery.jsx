import React, { useState, useRef } from 'react';

const CameraGallery = () => {
    const [preview, setPreview] = useState(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        // 重置 input 值，确保下次选择同一文件时也能触发 onChange
        event.target.value = '';
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    return (
        <section className="card">
            <h2>📷 相机与相册</h2>
            <div className="api-demo">
                <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <button 
                        onClick={handleCameraClick}
                        style={{padding: '12px 24px', backgroundColor: '#317EFB', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '16px', fontWeight: '500', flex: '1 1 auto', minWidth: 0}}
                    >
                        📸 拍照
                    </button>
                    <input 
                        ref={cameraInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        style={{display: 'none'}} 
                        onChange={handleImageSelect} 
                    />
                    
                    <button 
                        onClick={handleGalleryClick}
                        style={{padding: '12px 24px', backgroundColor: '#317EFB', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '16px', fontWeight: '500', flex: '1 1 auto', minWidth: 0}}
                    >
                        🖼️ 选图
                    </button>
                    <input 
                        ref={galleryInputRef}
                        type="file" 
                        accept="image/*" 
                        style={{display: 'none'}} 
                        onChange={handleImageSelect} 
                    />
                </div>
                {preview && (
                    <div style={{marginTop: '16px'}}>
                        <img src={preview} alt="Preview" style={{maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} />
                    </div>
                )}
            </div>
        </section>
    );
};

export default CameraGallery;
