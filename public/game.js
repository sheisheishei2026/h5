const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const debugX = document.getElementById('debugX');
const debugY = document.getElementById('debugY');
const permissionBtn = document.getElementById('permissionBtn');
const controlsDiv = document.getElementById('controls');

// 游戏状态
let ball = {
    x: 0,
    y: 0,
    radius: 20,
    vx: 0,
    vy: 0,
    color: '#317EFB'
};

let tilt = {
    beta: 0,  // 前后倾斜 (-180 ~ 180)
    gamma: 0  // 左右倾斜 (-90 ~ 90)
};

// 调整画布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 重置球的位置到中心
    if (ball.x === 0 && ball.y === 0) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 游戏循环
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据倾斜更新速度 (简单的物理模拟)
    // gamma 控制 X 轴 (左右倾斜)
    // beta 控制 Y 轴 (前后倾斜)
    ball.vx += tilt.gamma * 0.05; 
    ball.vy += tilt.beta * 0.05;

    // 摩擦力
    ball.vx *= 0.98;
    ball.vy *= 0.98;

    // 更新位置
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 边界碰撞检测
    let collided = false;

    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -0.6; // 反弹
        collided = true;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.6;
        collided = true;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -0.6;
        collided = true;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.6;
        collided = true;
    }

    // 如果发生碰撞且速度足够大（避免静止贴边时一直震动），触发振动
    if (collided && (Math.abs(ball.vx) > 1 || Math.abs(ball.vy) > 1)) {
        if (navigator.vibrate) {
            navigator.vibrate(20); // 短震 20ms
        }
    }

    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    
    // 高光效果
    ctx.beginPath();
    ctx.arc(ball.x - 5, ball.y - 5, ball.radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    // 更新调试信息
    debugX.textContent = Math.round(tilt.gamma);
    debugY.textContent = Math.round(tilt.beta);

    requestAnimationFrame(gameLoop);
}

// 处理设备方向事件
function handleOrientation(event) {
    // 限制最大倾斜角度，防止球跑太快
    let g = event.gamma; // 左右
    let b = event.beta;  // 前后

    // 简单的限制范围
    if (g > 90) g = 90;
    if (g < -90) g = -90;
    if (b > 90) b = 90;
    if (b < -90) b = -90;

    tilt.gamma = g;
    tilt.beta = b;
}

// 开始游戏按钮
permissionBtn.addEventListener('click', () => {
    // iOS 13+ 需要请求权限
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    permissionBtn.style.display = 'none'; // 隐藏按钮
                } else {
                    alert('权限被拒绝，无法获取传感器数据');
                }
            })
            .catch(console.error);
    } else {
        // 非 iOS 13+ 设备
        window.addEventListener('deviceorientation', handleOrientation);
        permissionBtn.style.display = 'none';
    }
});

// 启动循环
gameLoop();

