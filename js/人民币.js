/* 人民币（金币）飘落特效 —— 优化版
 * 纯 JS、自包含（canvas 直接绘制金币，不依赖任何图片）
 * 修复：原文件是 HTML 无法作为脚本执行、leaf.png 不存在导致 404、resize 时 ctx.scale 累积放大
 */
(function () {
    'use strict';

    // 1. 注入样式（透明覆盖层，不拦截点击）
    if (!document.getElementById('coinFxStyle')) {
        var st = document.createElement('style');
        st.id = 'coinFxStyle';
        st.textContent = '#coinCanvas{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;}';
        document.head.appendChild(st);
    }

    // 2. 创建画布
    var canvas = document.getElementById('coinCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'coinCanvas';
        document.body.appendChild(canvas);
    }
    var ctx = canvas.getContext('2d');
    var animationId = null;
    var isAnimating = false;

    // 3. 高清适配（用 setTransform 避免重复 resize 累积放大）
    var resizeTimer = null;
    function resizeCanvas() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = window.innerWidth, h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 100);
    });

    // 4. 金币对象
    function Coin() {
        this.reset();
        this.swingAmplitude = Math.random() * 8 + 3;
        this.swingPhase = Math.random() * Math.PI * 2;
        this.isLanded = false;
    }
    Coin.prototype.reset = function () {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * -window.innerHeight * 0.5;
        this.r = Math.random() * 8 + 12;                 // 金币半径
        this.speedY = Math.random() * 1.5 + 0.8;
        this.speedX = Math.random() * 1.2 - 0.6;
        this.angle = Math.random() * Math.PI * 2;
        this.rotateSpeed = Math.random() * 0.02 - 0.01;
        this.alpha = Math.random() * 0.2 + 0.8;
        this.fadeThreshold = 200;
        this.targetAlpha = 0;
        this.fadeSpeed = 0.005;
        this.isLanded = false;
    };
    Coin.prototype.update = function () {
        if (this.isLanded) return;
        this.x += this.speedX + Math.sin(this.swingPhase) * this.swingAmplitude * 0.04;
        this.y += this.speedY;
        this.angle += this.rotateSpeed;
        this.swingPhase += 0.04;
        var d = window.innerHeight - this.y;
        if (d < this.fadeThreshold) {
            this.targetAlpha = (d / this.fadeThreshold) * 0.8;
            this.alpha = Math.max(this.targetAlpha, this.alpha - this.fadeSpeed);
        }
        if (this.y > window.innerHeight + this.r * 2 || this.alpha <= 0) {
            this.isLanded = true;
        }
    };
    Coin.prototype.draw = function () {
        if (this.isLanded || this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        // 金币本体：金色径向渐变圆
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        var g = ctx.createRadialGradient(-this.r * 0.3, -this.r * 0.3, this.r * 0.1, 0, 0, this.r);
        g.addColorStop(0, '#fff3c4');
        g.addColorStop(0.45, '#f7c948');
        g.addColorStop(1, '#c8901a');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = this.r * 0.12;
        ctx.strokeStyle = 'rgba(140,96,20,0.9)';
        ctx.stroke();
        // 内圈
        ctx.beginPath();
        ctx.arc(0, 0, this.r * 0.68, 0, Math.PI * 2);
        ctx.lineWidth = this.r * 0.06;
        ctx.strokeStyle = 'rgba(168,116,26,0.7)';
        ctx.stroke();
        // 人民币符号 ¥
        ctx.fillStyle = '#8a5a12';
        ctx.font = 'bold ' + Math.round(this.r * 1.05) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¥', 0, 1);
        ctx.restore();
    };

    // 5. 初始化与动画
    var coinCount = 120;
    var coins = [];
    function initCoins() {
        coins.length = 0;
        for (var i = 0; i < coinCount; i++) coins.push(new Coin());
    }
    function animate() {
        if (!isAnimating) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var active = 0;
        for (var i = 0; i < coins.length; i++) {
            var c = coins[i];
            if (!c.isLanded) { c.update(); c.draw(); active++; }
        }
        if (active === 0) {
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
            isAnimating = false;
            return;
        }
        animationId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    initCoins();
    canvas.style.display = 'block';
    isAnimating = true;
    animate();

    // 6. 控制接口（与后台/页面兼容）
    window.coinFx = window.leafEffect = {
        setLeafCount: function (n) {
            if (n < 20) n = 20;
            coinCount = n;
            initCoins();
        },
        setCoinCount: function (n) {
            if (n < 20) n = 20;
            coinCount = n;
            initCoins();
        },
        restart: function () {
            canvas.style.display = 'block';
            for (var i = 0; i < coins.length; i++) coins[i].reset();
            isAnimating = true;
            animate();
        },
        destroy: function () {
            isAnimating = false;
            if (animationId) cancelAnimationFrame(animationId);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            var s = document.getElementById('coinFxStyle');
            if (s && s.parentNode) s.parentNode.removeChild(s);
        }
    };
})();
