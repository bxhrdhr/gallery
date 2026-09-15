(function() {
    var s = document.createElement('style');
    s.textContent = "@keyframes imgBreathe { 0%, 100% { transform: scale(1); filter: brightness(0.9) saturate(1); } 50% { transform: scale(1.1); filter: brightness(1.05) saturate(1.2); } } .breathe-act { animation: imgBreathe 4s ease-in-out infinite !important; will-change: transform, filter; } .card img { transition: none !important; }";
    document.head.appendChild(s);
    var obs = new IntersectionObserver(function(ens) {
        ens.forEach(function(e) {
            var img = e.target.querySelector('img');
            if(!img) return;
            if(e.isIntersecting) {
                img.classList.add('breathe-act');
            } else {
                img.classList.remove('breathe-act');
            }
        });
    }, { threshold: 0.01, rootMargin: '100px' });
    var t = setInterval(function() {
        var items = document.querySelectorAll('.img-wrap');
        if(items.length > 0) {
            clearInterval(t);
            items.forEach(function(el) { obs.observe(el); });
        }
    }, 500);
})();
