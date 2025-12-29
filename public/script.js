// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 为每个照片容器添加鼠标拖拽滚动功能
    const photoContainers = document.querySelectorAll('.photo-container');
    
    photoContainers.forEach(container => {
        // 实现无限循环滚动效果
        const photoItems = container.querySelectorAll('.photo-item');
        
        // 克隆第一批照片项并添加到容器末尾，实现无缝循环
        photoItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            container.appendChild(clone);
        });
        
        // 再克隆一次，确保足够的重复项
        photoItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            container.appendChild(clone);
        });
        
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // 鼠标按下事件
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('active');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            // 停止自动滚动
            stopAutoScroll();
        });
        
        // 鼠标离开事件
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('active');
            // 恢复自动滚动
            scrollPosition = container.scrollLeft;
            smoothScroll();
        });
        
        // 鼠标抬起事件
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('active');
            // 恢复自动滚动
            scrollPosition = container.scrollLeft;
            smoothScroll();
        });
        
        // 鼠标移动事件
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2; // 滚动速度
            container.scrollLeft = scrollLeft - walk;
        });
        
        // 添加触摸事件支持移动端
        container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            // 停止自动滚动
            stopAutoScroll();
        });
        
        container.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const x = touch.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
        
        container.addEventListener('touchend', () => {
            // 恢复自动滚动
            scrollPosition = container.scrollLeft;
            smoothScroll();
        });
        
        // 实现更流畅的自动滚动
        let scrollPosition = 0;
        let scrollSpeed = 0.5; // 每帧滚动像素数
        let animationId;
        
        // 平滑滚动函数
        function smoothScroll() {
            scrollPosition += scrollSpeed;
            
            // 检查是否需要重置滚动位置以实现无限循环
            if (scrollPosition >= container.scrollWidth / 3) {
                scrollPosition = 0;
            }
            
            container.scrollLeft = scrollPosition;
            animationId = requestAnimationFrame(smoothScroll);
        }
        
        // 停止自动滚动
        function stopAutoScroll() {
            cancelAnimationFrame(animationId);
        }
        
        // 鼠标进入时停止自动滚动，离开时恢复
        container.addEventListener('mouseenter', stopAutoScroll);
        container.addEventListener('mouseleave', () => {
            scrollPosition = container.scrollLeft;
            smoothScroll();
        });
        
        // 页面加载完成后开始自动滚动
        smoothScroll();
    });
    
    // 为照片项添加点击放大效果
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach(item => {
        // 添加悬停效果
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) translateZ(20px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) translateZ(0) scale(1)';
        });
        
        item.addEventListener('click', function() {
            // 添加点击反馈
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 创建模态框
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            // 获取点击的照片信息
            const imgSrc = this.querySelector('img').src;
            const imgAlt = this.querySelector('img').alt;
            
            // 创建模态框内容
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <div class="modal-caption">${imgAlt}</div>
                </div>
            `;
            
            // 添加到页面
            document.body.appendChild(modal);
            
            // 点击模态框外部或图片关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.tagName === 'IMG') {
                    document.body.removeChild(modal);
                }
            });
        });
    });
});

// 添加平滑滚动效果
window.addEventListener('load', function() {
    const containers = document.querySelectorAll('.photo-container');
    
    containers.forEach(container => {
        // 添加平滑滚动行为
        container.style.scrollBehavior = 'smooth';
        
        // 监听滚动事件，添加惯性滚动效果
        let scrollTimeout;
        container.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            container.style.scrollBehavior = 'auto';
            
            scrollTimeout = setTimeout(() => {
                container.style.scrollBehavior = 'smooth';
            }, 100);
        });
    });
});