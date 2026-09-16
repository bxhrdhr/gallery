<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>落叶特效 - 修正版</title>
    <style>
        /* 基础样式：使页面透明且不拦截事件，适合作为覆盖层 */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: transparent !important;
            pointer-events: none !important;
            overflow: hidden;
        }
        body * {
            pointer-events: none !important;
        }
        canvas {
            pointer-events: none !important;
            display: block;
        }
    </style>
</head>
<body>
    <!-- Canvas画布将由此JS代码动态创建并插入到这里 -->

    <script>
        // ========================
        // 落叶特效组件 (修正版)
        // ========================
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
            let isAnimating = false;

            // 3. 高清适配 + 防抖
            let resizeTimer = null;
            function resizeCanvas() {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const width = window.innerWidth;
                const height = window.innerHeight;

                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';

                ctx.scale(dpr, dpr);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'medium';
            }
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resizeCanvas, 100);
            });

            // 4. 树叶类
            class Leaf {
                constructor(imgW, imgH) {
                    this.imgW = imgW;
                    this.imgH = imgH;
                    this.reset();
                    this.swingAmplitude = Math.random() * 8 + 3;
                    this.swingPhase = Math.random() * Math.PI * 2;
                    this.isLanded = false;
                }

                reset() {
                    this.x = Math.random() * window.innerWidth;
                    this.y = Math.random() * -window.innerHeight * 0.5;
                    this.w = this.imgW * 0.2;
                    this.h = this.imgH * 0.2;
                    this.speedY = Math.random() * 1.5 + 0.8;
                    this.speedX = Math.random() * 1.2 - 0.6;
                    this.angle = Math.random() * Math.PI * 2;
                    this.rotateSpeed = Math.random() * 0.02 - 0.01;
                    this.alpha = Math.random() * 0.2 + 0.8;
                    this.fadeThreshold = 200;
                    this.targetAlpha = 0;
                    this.fadeSpeed = 0.005;
                    this.isLanded = false;
                }

                update() {
                    if (this.isLanded) return;
                    const swingOffset = Math.sin(this.swingPhase) * this.swingAmplitude * 0.04;
                    this.x += this.speedX + swingOffset;
                    this.y += this.speedY;
                    this.angle += this.rotateSpeed;
                    this.swingPhase += 0.04;

                    const distanceToBottom = window.innerHeight - this.y;
                    if (distanceToBottom < this.fadeThreshold) {
                        this.targetAlpha = (distanceToBottom / this.fadeThreshold) * 0.8;
                        this.alpha = Math.max(this.targetAlpha, this.alpha - this.fadeSpeed);
                    }
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

            // 5. 图片加载 - 【关键修正点：使用本地图片并添加错误处理】
            const leafImg = new Image();
            // crossOrigin 属性在加载本地图片时通常不需要，可以移除或保留
            // leafImg.crossOrigin = 'anonymous';

            let leafCount = 120; // 【关键修正点：将 const 改为 let，允许后续修改】

            const leaves = [];

            function initLeaves() {
                leaves.length = 0;
                if (!leafImg.complete) return;
                for (let i = 0; i < leafCount; i++) {
                    leaves.push(new Leaf(leafImg.width, leafImg.height));
                }
            }

            // 6. 动画循环
            function animate() {
                if (!isAnimating) return;
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
                if (activeCount === 0) {
                    cancelAnimationFrame(animationId);
                    canvas.style.display = 'none';
                    isAnimating = false;
                    return;
                }
                animationId = requestAnimationFrame(animate);
            }

            // 7. 初始化 - 【关键修正点：添加图片加载失败处理】
            leafImg.onload = function() {
                console.log('落叶图片加载成功，开始动画。');
                resizeCanvas();
                initLeaves();
                isAnimating = true;
                animate();
            };
            leafImg.onerror = function() {
                // 这里是调试的关键！如果控制台看到此错误，说明图片路径不对。
                console.error('落叶图片加载失败！请检查：');
                console.error('1. 图片文件 “leaf.png” 是否与本HTML文件在同一目录？');
                console.error('2. 文件名是否拼写正确（包括.png扩展名）？');
                console.error('3. 是否通过HTTP服务器访问（如 http://localhost:8080）而非双击文件打开？');
                // 可选：绘制一个红色方块作为错误提示
                ctx.fillStyle = 'red';
                ctx.fillRect(10, 10, 50, 50);
            };
            // 【关键修正点：使用本地图片路径】
            leafImg.src = './leaf.png'; // 确保同一目录下存在 leaf.png 文件

            // 初始执行
            resizeCanvas();

            // 8. 控制方法
            window.leafEffect = {
                setLeafCount: function(count) {
                    if (count < 20) count = 20;
                    leafCount = count; // 现在可以正确修改 leafCount 了
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
                    if (animationId) cancelAnimationFrame(animationId);
                    canvas?.parentNode?.removeChild(canvas);
                    document.getElementById('leafEffectStyle')?.remove();
                }
            };

        })();
        // ========================
        // 特效代码结束
        // ========================
    </script>
</body>
</html>
