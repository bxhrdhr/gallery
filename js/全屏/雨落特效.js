

// 创建下雨特效无需样式
function createRainEffect() {
    // 创建雨滴容器
    const rainContainer = document.createElement('div');
    rainContainer.style.position = 'fixed';
    rainContainer.style.top = '0';
    rainContainer.style.left = '0';
    rainContainer.style.width = '100%';
    rainContainer.style.height = '100%';
    rainContainer.style.pointerEvents = 'none';
    rainContainer.style.zIndex = '9999';
    document.body.appendChild(rainContainer);

    // 雨滴数量（根据窗口大小调整）
    
    
    const rainCount = Math.floor(window.innerWidth * window.innerHeight / 6000);
    
    
    // 创建雨滴
    for (let i = 0; i < rainCount; i++) {
        createRaindrop(rainContainer);
    }

    // 窗口大小改变时调整雨滴数量 pc端
    window.addEventListener('resize', function() {
    
    
        const newCount = Math.floor(window.innerWidth * window.innerHeight / 5000);
        
        
        const currentCount = rainContainer.childElementCount;
        
        if (newCount > currentCount) {
            for (let i = 0; i < newCount - currentCount; i++) {
                createRaindrop(rainContainer);
            }
        } else if (newCount < currentCount) {
            for (let i = 0; i < currentCount - newCount; i++) {
                if (rainContainer.firstChild) {
                    rainContainer.removeChild(rainContainer.firstChild);
                }
            }
        }
    });
}

// 创建单个雨滴
function createRaindrop(container) {
    const raindrop = document.createElement('div');
    raindrop.style.position = 'absolute';
    
    // 控制雨滴粗细宽度：随机区间 0.5px ~ 1.5px；乘号后面数字越大，雨滴整体越粗
    raindrop.style.width = Math.random() * 0.4 + 0.7 + 'px';
    
    // 控制雨滴垂直长度：随机区间 10px ~ 30px；修改乘数可改变雨滴长短，数值越大雨滴越长
    raindrop.style.height = Math.random() * 20 + 10 + 'px';
    
    // 控制雨滴颜色与透明度：前三个数字RGB控制颜色；后半段 0.3~0.8 随机透明度，系数越大整体越透亮
    raindrop.style.backgroundColor = 'rgba(174, 194, 224, ' + (Math.random() * 0.5 + 0.3) + ')';
    
    
    // 控制雨滴水平生成位置：在页面横向 0% ~ 100% 随机分布，实现左右铺满随机出现
    raindrop.style.left = Math.random() * 100 + '%';
    // 控制雨滴初始生成位置：屏幕顶部外侧 -20px，从可视区域外向下划入
    raindrop.style.top = -20 + 'px';
    // 控制雨滴圆角样式：仅底部左右圆角，模拟水滴尖端外形
    raindrop.style.borderRadius = '0 0 3px 3px';

    
    // 雨滴动画
    const animationDuration = Math.random() * 1 + 0.5;
    raindrop.style.animation = `rain-fall ${animationDuration}s linear infinite`;
    raindrop.style.animationDelay = Math.random() * 2 + 's';
    
    // 添加到容器
    container.appendChild(raindrop);
}

// 定义雨滴下落动画
const style = document.createElement('style');
style.textContent = `
    @keyframes rain-fall {
        0% {
            transform: translateY(-20px) translateX(0);
            opacity: 1;
        }
        70% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(${window.innerHeight + 20}px) translateX(${Math.random() * 50 - 25}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化下雨效果
createRainEffect();
