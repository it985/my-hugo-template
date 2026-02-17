
// 存一下全局滚动监听器，方便后面清理，省得重复绑定
let scrollHandler = null;

function initScrollEffect() {
    const singleHeader = document.querySelector('.single-header');
    const homeHeader = document.querySelector('.home-header');
    
    // 如果之前已经绑定过了，先解绑，防止内存泄漏
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
    }

    if (!singleHeader && !homeHeader) return;

    scrollHandler = () => {
        const scrolled = window.scrollY > 20;
        
        if (singleHeader) {
            if (scrolled) singleHeader.classList.add('scrolled');
            else singleHeader.classList.remove('scrolled');
        }
        
        if (homeHeader) {
            // 首页滑下来也加个毛玻璃效果
            if (scrolled) homeHeader.classList.add('scrolled');
            else homeHeader.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    // 刚进页面先跑一遍，看看是不是已经滚在半路了
    scrollHandler();
}

function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('menu-overlay');
    
    if (!toggle || !overlay) return;

    // 直接用 onclick，这样每次初始化都会覆盖旧的，不怕重复绑定
    toggle.onclick = (e) => {
        e.stopPropagation();
        overlay.classList.toggle('active');
    };

    // 点遮罩层或者点里面的链接，就把菜单关了
    overlay.onclick = (e) => {
        if (e.target === overlay || e.target.tagName === 'A') {
            overlay.classList.remove('active');
        }
    };
}

function initHelpers() {
    // 滚动效果
    initScrollEffect();
    
    // 菜单
    initMenu();

    // 朋友圈动态的逻辑（展开全文、点赞弹出框啥的）
    if (typeof initMoments === 'function') {
        initMoments();
    }
}

// 整个页面加载完后的初始化逻辑
document.addEventListener("DOMContentLoaded", function() {
    initHelpers();

    // 配置 PJAX，实现无刷新跳转
    if (typeof Pjax !== 'undefined') {
        window.pjax = new Pjax({
            elements: "a", 
            selectors: ["head title", ".main-wrapper"],
            cacheBust: false,
            analytics: false
        });
    }

    // PJAX 发起请求时跑的逻辑
    document.addEventListener("pjax:send", function() {
        // 销毁滚动监听
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }
        // 菜单要是开着也给它关了
        const overlay = document.getElementById('menu-overlay');
        if (overlay) overlay.classList.remove('active');
        
        // 销毁图片浏览器，防止监听器残留
        if (typeof Fancybox !== 'undefined') {
            Fancybox.unbind("[data-fancybox]");
            Fancybox.close(); 
        }
    });

    // PJAX 跳转完后的逻辑
    document.addEventListener("pjax:complete", function() {
        // 稍微等一下下，确保 DOM 真的刷好了
        setTimeout(initHelpers, 50);
        
        // 如果有 Artalk 评论，看看需不需要重装
        if (window.amigoConfig && window.amigoConfig.artalkServer && window.Artalk) {
             if (document.querySelector('#comments-single')) {
                 // 这里具体的重装逻辑通常在 main.js 里 PJAX 监听里搞定了
             }
        }
    });
});
