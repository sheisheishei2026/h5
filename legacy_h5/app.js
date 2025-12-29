// ===============================
// 1. 待办列表逻辑
// ===============================

const initialData = [
    "体验 HTML5 相机",
    "测试地理定位",
    "摇一摇手机测试传感器",
    "尝试录制一段语音",
    "连接蓝牙设备",
    "发送一条系统通知",
    "体验手机振动",
    "浏览本地文件夹"
];

const listContainer = document.getElementById('listContainer');
const newItemInput = document.getElementById('newItem');
const addBtn = document.getElementById('addBtn');

function renderList(items) {
    listContainer.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => {
            items.splice(index, 1);
            renderList(items);
        };
        
        li.appendChild(deleteBtn);
        listContainer.appendChild(li);
    });
}

addBtn.addEventListener('click', () => {
    const text = newItemInput.value.trim();
    if (text) {
        initialData.push(text);
        renderList(initialData);
        newItemInput.value = '';
    }
});

renderList(initialData);

// ===============================
// 2. 相机与相册逻辑
// ===============================
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreviewContainer.innerHTML = ''; // 清除旧图
            imagePreviewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

cameraInput.addEventListener('change', handleImageSelect);
galleryInput.addEventListener('change', handleImageSelect);

// ===============================
// 3. 文件系统逻辑 (展示目录树)
// ===============================
const dirBtn = document.getElementById('dirBtn');
const folderInput = document.getElementById('folderInput');
const dirOutput = document.getElementById('dirOutput');

// 点击按钮触发 input 点击
dirBtn.addEventListener('click', () => {
    folderInput.click();
});

// 处理文件夹选择
folderInput.addEventListener('change', (event) => {
    const files = event.target.files;
    
    if (files.length === 0) {
        dirOutput.innerHTML = '<p style="color: #999; text-align: center;">未选择文件夹</p>';
        return;
    }

    dirOutput.innerHTML = '正在构建目录树...';

    // 1. 构建树结构数据
    const tree = {};
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = file.webkitRelativePath || file.name;
        const parts = path.split('/');
        
        let currentLevel = tree;
        
        // 遍历路径部分，构建嵌套对象
        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                if (index === parts.length - 1) {
                    // 是文件
                    currentLevel[part] = { __type: 'file', fileObj: file };
                } else {
                    // 是文件夹
                    currentLevel[part] = { __type: 'folder', children: {} };
                }
            }
            
            // 移动到下一层
            if (index < parts.length - 1) {
                currentLevel = currentLevel[part].children;
            }
        });
    }

    // 2. 渲染树
    dirOutput.innerHTML = '';
    const rootUl = document.createElement('ul');
    rootUl.className = 'tree-view';
    
    // 渲染函数
    function renderNode(node, container, name) {
        const li = document.createElement('li');
        
        if (node.__type === 'file') {
            li.innerHTML = `<span class="file-icon">📄</span><span class="file-name">${name}</span> <span style="font-size:0.8em;color:#999">(${formatSize(node.fileObj.size)})</span>`;
        } else {
            // 文件夹
            const folderLabel = document.createElement('div');
            folderLabel.innerHTML = `<span class="folder-icon">📁</span><span class="folder-name">${name}</span>`;
            li.appendChild(folderLabel);
            
            const childrenUl = document.createElement('ul');
            // 递归渲染子节点
            Object.keys(node.children).forEach(key => {
                renderNode(node.children[key], childrenUl, key);
            });
            li.appendChild(childrenUl);
        }
        
        container.appendChild(li);
    }

    // 从根节点开始渲染 (通常 webkitRelativePath 的第一部分是选中的文件夹名)
    // 这里的 tree 的第一层 key 就是根文件夹名
    Object.keys(tree).forEach(rootName => {
        // 对于 webkitdirectory，通常只会有一个根，但逻辑上支持多个
        if (tree[rootName].__type === 'folder') {
             renderNode(tree[rootName], rootUl, rootName);
        } else {
             // 根目录下的文件 (不太可能，除非选的是文件)
             renderNode(tree[rootName], rootUl, rootName);
        }
    });

    dirOutput.appendChild(rootUl);
});

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 兼容性检查提示
if (!('webkitdirectory' in HTMLInputElement.prototype)) {
    const warning = document.createElement('div');
    warning.style.color = 'orange';
    warning.style.fontSize = '0.8rem';
    warning.textContent = '警告: 您的浏览器可能不支持文件夹选择 (webkitdirectory)，可能只能选择文件。';
    dirOutput.appendChild(warning);
}



// ===============================
// 4. 音乐播放与录音逻辑
// ===============================
const audioInput = document.getElementById('audioInput');
const audioPlayer = document.getElementById('audioPlayer');
const audioName = document.getElementById('audioName');
const volumeSlider = document.getElementById('volumeSlider');

// 播放选择的文件
audioInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audioPlayer.src = url;
        audioPlayer.style.display = 'block';
        audioName.textContent = `正在播放: ${file.name}`;
    }
});

// 音量控制
volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

// 录音功能
const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const recordingStatus = document.getElementById('recordingStatus');

let mediaRecorder;
let audioChunks = [];

startRecordBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';
            audioName.textContent = "录音已完成，点击播放试听";
            
            // 停止所有轨道，释放麦克风
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        
        startRecordBtn.disabled = true;
        startRecordBtn.style.backgroundColor = '#ccc';
        stopRecordBtn.disabled = false;
        stopRecordBtn.style.backgroundColor = '#ff4444'; // 红色表示停止
        recordingStatus.textContent = "正在录音...";

    } catch (err) {
        console.error("无法获取麦克风权限:", err);
        recordingStatus.textContent = "无法获取麦克风权限，请确保在 HTTPS 或 Localhost 下运行，并允许访问麦克风。";
    }
});

stopRecordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        startRecordBtn.disabled = false;
        startRecordBtn.style.backgroundColor = '#317EFB';
        stopRecordBtn.disabled = true;
        stopRecordBtn.style.backgroundColor = '#ccc';
        recordingStatus.textContent = "";
    }
});

// ===============================
// 5. 蓝牙设备逻辑 (Web Bluetooth)
// ===============================
const btBtn = document.getElementById('btBtn');
const btOutput = document.getElementById('btOutput');

btBtn.addEventListener('click', async () => {
    if (!navigator.bluetooth) {
        btOutput.textContent = "您的浏览器不支持 Web Bluetooth API";
        return;
    }

    try {
        btOutput.textContent = "正在扫描设备... (请在弹出的窗口中选择设备)";
        
        // 扫描所有设备 (acceptAllDevices: true 必须配合 optionalServices 使用，或者只读取基本信息)
        // 注意：出于隐私，必须指定过滤条件或接受所有。
        // 这里演示扫描所有设备并获取电池服务（如果支持）
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service']
        });

        btOutput.innerHTML = `已选择设备: <strong>${device.name || '未知设备'}</strong><br>ID: ${device.id}`;
        
        // 连接设备 (演示)
        btOutput.innerHTML += `<br>正在尝试连接 GATT Server...`;
        const server = await device.gatt.connect();
        btOutput.innerHTML += `<br>连接成功!`;

    } catch (error) {
        console.log('Bluetooth error: ', error);
        btOutput.textContent = `操作取消或失败: ${error.message}`;
    }
});

// ===============================
// 6. 通知与振动逻辑
// ===============================
const notifyBtn = document.getElementById('notifyBtn');
const vibrateBtn = document.getElementById('vibrateBtn');
const vibratePatternBtn = document.getElementById('vibratePatternBtn');
const vibrateStopBtn = document.getElementById('vibrateStopBtn');

// 通知功能
notifyBtn.addEventListener('click', () => {
    if (!('Notification' in window)) {
        alert('此浏览器不支持通知功能');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification('你好!', {
            body: '这是一条来自 PWA 的测试通知',
            icon: '/icons/icon-192.svg'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('你好!', {
                    body: '感谢授权，这是一条测试通知',
                    icon: '/icons/icon-192.svg'
                });
            }
        });
    } else {
        alert('您之前拒绝了通知权限，请在设置中开启');
    }
});

// 振动功能
vibrateBtn.addEventListener('click', () => {
    if (navigator.vibrate) {
        // 振动 200ms
        navigator.vibrate(200);
    } else {
        console.log("设备不支持振动 API (或是在 iOS 上)");
    }
});

vibratePatternBtn.addEventListener('click', () => {
    if (navigator.vibrate) {
        // 振动模式: [振动, 暂停, 振动, 暂停, ...]
        // 模拟心跳: 100ms 震, 100ms 停, 100ms 震, 1000ms 停 ...
        navigator.vibrate([100, 100, 100, 1000, 100, 100, 100, 1000]);
    }
});

vibrateStopBtn.addEventListener('click', () => {
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
});

// ===============================
// 7. 地理定位逻辑
// ===============================
const geoBtn = document.getElementById('geoBtn');
const geoOutput = document.getElementById('geoOutput');

geoBtn.addEventListener('click', () => {
    geoOutput.textContent = "正在获取位置...";
    if (!navigator.geolocation) {
        geoOutput.textContent = "您的浏览器不支持地理定位";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            geoOutput.innerHTML = `
                纬度: ${latitude.toFixed(6)}<br>
                经度: ${longitude.toFixed(6)}<br>
                精度: ${accuracy} 米
            `;
        },
        (error) => {
            console.error("Geolocation error:", error);
            let msg = "获取失败";
            switch(error.code) {
                case error.PERMISSION_DENIED: msg = "用户拒绝了位置请求。请在浏览器设置或系统设置中允许访问位置。"; break;
                case error.POSITION_UNAVAILABLE: msg = "位置信息不可用。可能是设备没有GPS信号或网络定位失败。"; break;
                case error.TIMEOUT: msg = "请求超时。请重试。"; break;
            }
            geoOutput.innerHTML = `${msg}<br><small style="color:red">Error: ${error.message}</small>`;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

// ===============================
// 8. 传感器逻辑 (加速度计)
// ===============================
const sensorBtn = document.getElementById('sensorBtn');
const accX = document.getElementById('accX');
const accY = document.getElementById('accY');
const accZ = document.getElementById('accZ');

let isSensorRunning = false;

function handleMotion(event) {
    // 包含重力的加速度
    const { x, y, z } = event.accelerationIncludingGravity;
    accX.textContent = x ? x.toFixed(2) : '0';
    accY.textContent = y ? y.toFixed(2) : '0';
    accZ.textContent = z ? z.toFixed(2) : '0';
}

sensorBtn.addEventListener('click', () => {
    // iOS 13+ 需要请求权限
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    sensorBtn.textContent = "传感器已开启";
                    sensorBtn.disabled = true;
                } else {
                    alert('权限被拒绝');
                }
            })
            .catch(console.error);
    } else {
        // 非 iOS 13+ 设备通常直接支持
        if (!isSensorRunning) {
            window.addEventListener('devicemotion', handleMotion);
            isSensorRunning = true;
            sensorBtn.textContent = "传感器已开启";
            sensorBtn.disabled = true;
        }
    }
});
