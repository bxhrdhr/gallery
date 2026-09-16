(function() {
    const css = `
        .physical-water-ripple {
            position: fixed;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: transparent;
            pointer-events: none;
            box-shadow: inset 0 0 20px rgba(255,255,255,0.5), 0 0 15px rgba(255,255,255,0.3);
            transform: translate(-50%, -50%);
            animation: ripple-anim 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            z-index: 5;
        }
        @keyframes ripple-anim {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
            50% { opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(15); opacity: 0; }
        }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
    var MAX_RIPPLES = 8;
    document.addEventListener('click', function(e) {
        var all = document.querySelectorAll('.physical-water-ripple');
        if (all.length >= MAX_RIPPLES) {
            for (var k = 0; k <= all.length - MAX_RIPPLES; k++) if (all[k].parentNode) all[k].parentNode.removeChild(all[k]);
        }
        const ripple = document.createElement('div');
        ripple.className = 'physical-water-ripple';
        
        const x = e.clientX;
        const y = e.clientY;

        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 1500);
    }, true); 
})();
