// 人民币爱心轨迹下落 - 樱花般流畅飘落版
// 改动说明：①图片由抖音外链改为本站资源 js/money.png（避免失效，符合本站内容要求）；②z-index 由 -1 改为 9999（否则被页面背景盖住看不到）；③图片路径按脚本所在目录自动解析
(function() {
    // 脚本所在目录（供本站图片定位）
    var SCRIPT_DIR = (function () {
        var s = document.currentScript || document.scripts[document.scripts.length - 1];
        if (s && s.src) return s.src.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
        return '';
    })();

    const style = document.createElement('style');
    style.textContent = `
       .money-wrap {
             position: fixed;
             top: 0;
             left: 0;
             width: 100vw;
             height: 120vh;
             z-index: 9999;
             pointer-events: none;
             overflow: hidden;
         }
         .money {
            position: absolute;
            width: 38px;
            height: 38px;
            background-size: 100% 100%;
            transform: translate3d(0, 0, 0);
            will-change: transform, opacity;
            /* 改用樱花飘落的缓动函数，下落更轻盈 */
            animation: loveFallSmooth 12s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            filter: blur(0px);
        }

        @keyframes loveFallSmooth {
            0% {
                transform: translate3d(var(--x), var(--y-start), 0) rotate(0deg) scale(1);
                opacity: 1;
                filter: blur(0px);
            }
            35% {
                /* 加入左右随机摇摆偏移，模拟樱花飘动 */
                transform: translate3d(calc(var(--x-end) + var(--random-sway)), 35vh, 0) rotate(var(--rotate-1)) scale(1);
                opacity: 1;
                filter: blur(0px);
            }
            70% {
                transform: translate3d(calc(var(--x-end) - var(--random-sway)), 70vh, 0) rotate(var(--rotate-2)) scale(0.97);
                opacity: 0.6;
                filter: blur(0.5px);
            }
            100% {
                transform: translate3d(calc(var(--x-end) + var(--random-sway)/2), 115vh, 0) rotate(var(--rotate-3)) scale(0.92);
                opacity: 0;
                filter: blur(1px);
            }
        }
    `;
    document.head.appendChild(style);

    const config = {
        imgSrc: SCRIPT_DIR + 'money.png',
        count: 80,
        heartSize: 180,
        heartCenterX: window.innerWidth / 2,
        heartCenterY: -230,
        tMin: 0.45 * Math.PI,
        tMax: 1.45 * Math.PI,
        endXOffset: 10,
        // 新增：樱花飘落的随机参数范围
        swayRange: 20,   // 左右摇摆幅度
        rotateRange: 15  // 旋转角度范围
    };

    const wrap = document.createElement('div');
    wrap.className = 'money-wrap';
    document.body.appendChild(wrap);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.imgSrc;
    img.onload = createHeartMoney;
    img.onerror = () => console.error('人民币图片加载失败：' + config.imgSrc);

    function getHeartPoint(t) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        return {
            x: config.heartCenterX + x * (config.heartSize / 16),
            y: config.heartCenterY + y * (config.heartSize / 16)
        };
    }

    function createHeartMoney() {
        let created = 0;
        const batch = 4;
        const interval = 220;
        const timer = setInterval(() => {
            for (let i = 0; i < batch; i++) {
                if (created >= config.count) {
                    clearInterval(timer);
                    return;
                }
                const t = config.tMin + Math.random() * (config.tMax - config.tMin);
                const point = getHeartPoint(t);
                const endX = point.x + (Math.random() - 0.5) * config.endXOffset;

                // 生成随机摇摆和旋转参数，每片人民币轨迹都不同
                const randomSway = Math.random() * config.swayRange;
                const rotate1 = Math.random() * config.rotateRange;
                const rotate2 = Math.random() * config.rotateRange * 2;
                const rotate3 = Math.random() * config.rotateRange * 3;

                const money = document.createElement('div');
                money.className = 'money';
                // 绑定随机参数到CSS变量
                money.style.setProperty('--x', `${point.x}px`);
                money.style.setProperty('--y-start', `${point.y}px`);
                money.style.setProperty('--x-end', `${endX}px`);
                money.style.setProperty('--random-sway', `${randomSway}px`);
                money.style.setProperty('--rotate-1', `${rotate1}deg`);
                money.style.setProperty('--rotate-2', `${rotate2}deg`);
                money.style.setProperty('--rotate-3', `${rotate3}deg`);
                money.style.backgroundImage = `url(${config.imgSrc})`;
                wrap.appendChild(money);

                money.addEventListener('animationend', () => money.remove());
                created++;
            }
        }, interval);
    }
})();
