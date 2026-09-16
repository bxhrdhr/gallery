// 落叶特效组件 - 流畅版
(function() {
    'use strict';

    // 1. 动态创建并插入CSS样式
    const style = document.createElement('style');
    style.textContent = `
        #leafCanvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            pointer-events: none;
        }
    `;
    if (!document.querySelector('#leafEffectStyle')) {
        style.id = 'leafEffectStyle';
        document.head.appendChild(style);
    }

    // 2. 创建Canvas元素
    let canvas = document.getElementById('leafCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'leafCanvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isAnimating = false; // 防止重复启动动画

    // 3. 高清适配 + 性能优化：防抖resize
    let resizeTimer = null;
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制最大dpr，减少计算压力
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // 降低平滑质量，提升性能
    }

    // 防抖处理：避免resize频繁触发
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 100);
    });

    // 4. 树叶类 - 优化渐隐逻辑 + 减少冗余计算
    class Leaf {
        constructor(imgW, imgH) {
            this.imgW = imgW;
            this.imgH = imgH;
            this.reset();
            this.swingAmplitude = Math.random() * 8 + 3; // 减小摆动幅度，更自然
            this.swingPhase = Math.random() * Math.PI * 2;
            this.isLanded = false;
        }

        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * -window.innerHeight * 0.5; // 初始位置更分散，避免扎堆
            this.w = this.imgW * 0.2;
            this.h = this.imgH * 0.2;
            this.speedY = Math.random() * 1.5 + 0.8; // 速度更平缓
            this.speedX = Math.random() * 1.2 - 0.6;
            this.angle = Math.random() * Math.PI * 2;
            this.rotateSpeed = Math.random() * 0.02 - 0.01; // 旋转更慢
            this.alpha = Math.random() * 0.2 + 0.8; // 初始透明度更高
            this.fadeThreshold = 200; // 增大渐隐触发距离，渐变更久
            this.targetAlpha = 0; // 目标透明度，用于平滑过渡
            this.fadeSpeed = 0.005; // 渐隐速度，越小越慢越自然
            this.isLanded = false;
        }

        update() {
            if (this.isLanded) return;

            // 减少计算量：合并重复的三角函数计算
            const swingOffset = Math.sin(this.swingPhase) * this.swingAmplitude * 0.04;
            this.x += this.speedX + swingOffset;
            this.y += this.speedY;
            this.angle += this.rotateSpeed;
            this.swingPhase += 0.04; // 减小步长，摆动更顺滑

            // 平滑渐隐：线性过渡到目标透明度
            const distanceToBottom = window.innerHeight - this.y;
            if (distanceToBottom < this.fadeThreshold) {
                this.targetAlpha = (distanceToBottom / this.fadeThreshold) * 0.8;
                this.alpha = Math.max(this.targetAlpha, this.alpha - this.fadeSpeed);
            }

            // 完全透明或落地后标记
            if (this.y > window.innerHeight + this.h || this.alpha <= 0) {
                this.isLanded = true;
            }
        }

        draw() {
            if (this.isLanded || this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(leafImg, -this.w / 2, -this.h / 2, this.w, this.h);
            ctx.restore();
        }
    }

    // 5. 图片加载
    // 本站图片：脚本同目录下的 money.png（由脚本 URL 自动解析，避免外链失效）
    var SCRIPT_DIR = (function () {
        var s = document.currentScript || document.scripts[document.scripts.length - 1];
        if (s && s.src) return s.src.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
        return '';
    })();
    const leafImg = new Image();
    leafImg.crossOrigin = 'anonymous';
    leafImg.src = SCRIPT_DIR + 'money.png';

    const leaves = [];
    const leafCount = 120; // 减少树叶数量，降低渲染压力

    function initLeaves() {
        leaves.length = 0;
        if (!leafImg.complete) return;
        for (let i = 0; i < leafCount; i++) {
            leaves.push(new Leaf(leafImg.width, leafImg.height));
        }
    }

    // 6. 动画循环 - 性能优化：避免空转
    function animate() {
        if (!isAnimating) return;
        // 批量绘制：先清屏，再统一更新绘制
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeCount = 0;
        for (let i = 0; i < leaves.length; i++) {
            const leaf = leaves[i];
            if (!leaf.isLanded) {
                leaf.update();
                leaf.draw();
                activeCount++;
            }
        }
        // 无活跃树叶时停止动画
        if (activeCount === 0) {
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
            isAnimating = false;
            return;
        }
        animationId = requestAnimationFrame(animate);
    }

    // 7. 初始化
    leafImg.onload = function() {
        resizeCanvas();
        initLeaves();
        isAnimating = true;
        animate();
    };

    // 初始执行
    resizeCanvas();

    // 8. 控制方法
    window.leafEffect = {
        setLeafCount: function(count) {
            if (count < 20) count = 20;
            leafCount = count;
            initLeaves();
        },
        restart: function() {
            canvas.style.display = 'block';
            leaves.forEach(leaf => leaf.reset());
            isAnimating = true;
            animate();
        },
        destroy: function() {
            isAnimating = false;
            cancelAnimationFrame(animationId);
            canvas?.parentNode?.removeChild(canvas);
            document.getElementById('leafEffectStyle')?.parentNode?.removeChild(document.getElementById('leafEffectStyle'));
        }
    };

})();
