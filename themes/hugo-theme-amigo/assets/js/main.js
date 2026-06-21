let artalkInstances = [];

/* ==========================================================================
   全局音频管理器 - 保证 PJAX 切换页面时音乐不中断
   ========================================================================== */
const AudioManager = {
    _audio: null,
    _playing: false,
    _src: null,
    _currentTime: 0,

    get audio() {
        if (!this._audio) {
            this._audio = new Audio();
            this._audio.preload = 'metadata';
            this._audio.style.display = 'none';
            document.body.appendChild(this._audio);
            this._audio.addEventListener('play', () => { this._playing = true; });
            this._audio.addEventListener('pause', () => { this._playing = false; });
            this._audio.addEventListener('timeupdate', () => {
                this._currentTime = this._audio.currentTime;
            });
        }
        return this._audio;
    },

    get isPlaying() { return this._playing; },
    get src() { return this._src; },

    load(src) {
        this._src = src;
        this.audio.src = src;
        this.audio.load();
    },

    play() {
        this.audio.play().catch(() => {});
    },

    pause() {
        this.audio.pause();
    },

    // 将全局 audio 关联到播放器 UI（绑定 UI 事件）
    attach(player) {
        const a = this.audio;
        // 移除旧的 UI 事件监听（通过命名空间标记）
        a._player = player;
    },

    detach() {
        if (this._audio) {
            this._audio._player = null;
        }
    }
};

// 点赞数缓存管理
const LikesCache = {
    prefix: 'likes_',

    // 获取文章的点赞数缓存
    get(pageKey) {
        try {
            const cached = sessionStorage.getItem(this.prefix + pageKey);
            if (cached) {
                const data = JSON.parse(cached);
                return data.count || 0;
            }
        } catch (e) {
            console.warn('读取点赞缓存失败:', e);
        }
        return null;
    },

    // 设置文章的点赞数缓存
    set(pageKey, count) {
        try {
            sessionStorage.setItem(this.prefix + pageKey, JSON.stringify({
                count: count,
                time: Date.now()
            }));
        } catch (e) {
            console.warn('设置点赞缓存失败:', e);
        }
    },

    // 清除文章的点赞数缓存
    clear(pageKey) {
        try {
            sessionStorage.removeItem(this.prefix + pageKey);
        } catch (e) {
            console.warn('清除点赞缓存失败:', e);
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    initMoments();
    initArtalk();
    initTwikoo();
    initLightbox();
    initMenu();
    initTheme();
    initThemeToggle();
    initHeaderMedia();
    initLivePhotoShortcodes();
    initArchiveFilter();
    initHomeSearch();
    initDanmaku();
    initMusicPlayers();
    initLivePhotoCards();
    initMusicCardPlayers();
    initMotionPhotos();
    initVideoPlayers();
    initVoiceMessages();
});

// 页面跳转前，先把 Artalk 评论实例给销毁掉，省得占内存
document.addEventListener("pjax:send", function() {
    artalkInstances.forEach(inst => {
        if (inst && typeof inst.destroy === 'function') {
            inst.destroy();
        }
    });
    artalkInstances = [];
    document.querySelectorAll('.twikoo-comments-area').forEach(el => {
        el.innerHTML = '';
        delete el.dataset.twikooInit;
    });
});

// 页面加载完了（包括 PJAX 跳完后），重新初始化一波
document.addEventListener("pjax:complete", function() {
    initMoments();
    initArtalk();
    initTwikoo();
    initLightbox();
    initMenu();
    initThemeToggle();
    initHeaderMedia();
    initLivePhotoShortcodes();
    initArchiveFilter();
    initHomeSearch();
    initDanmaku();
    initLivePhotoCards();
    initMotionPhotos();
    initVideoPlayers();
    initVoiceMessages();
    // 音乐播放器：如果正在播放则只关联 UI，不重新初始化
    if (AudioManager.isPlaying) {
        attachPlayingMusicPlayer();
    } else {
        initMusicPlayers();
        initMusicCardPlayers();
    }
});

function initMenu() {
    // 选一下菜单开关和遮罩层
    const toggle = document.querySelector('#menu-toggle');
    const overlay = document.querySelector('#menu-overlay');
    
    if (!toggle || !overlay) {
        // console.log('找不到菜单元素');
        return;
    }

    // 克隆一下再替换，主要是为了清掉之前的事件监听器，防止重复绑定
    const newToggle = toggle.cloneNode(true);
    if (toggle.parentNode) {
        toggle.parentNode.replaceChild(newToggle, toggle);
    }
    
    // 遮罩层也一样，克隆一份干净的
    const newOverlay = overlay.cloneNode(true);
    if (overlay.parentNode) {
        overlay.parentNode.replaceChild(newOverlay, overlay);
    }

    const toggleMenu = (e) => {
        e.preventDefault(); // 别让 a 标签乱跳
        const isActive = newOverlay.classList.contains('active');
        if (isActive) {
            newOverlay.classList.remove('active');
            document.body.style.overflow = ''; // 恢复滚动
        } else {
            newOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // 菜单开了就别让背景滚了
        }
    };

    newToggle.addEventListener('click', toggleMenu);
    
    newOverlay.addEventListener('click', (e) => {
        if (e.target === newOverlay) {
            toggleMenu(e); // 点遮罩层外面也关掉
        }
    });
}

function initTwikoo() {
    const containers = document.querySelectorAll('.twikoo-comments-area');
    if (!containers.length || !window.amigoConfig) return;
    if (window.amigoConfig.commentMode !== 'twikoo') return;

    const envId = window.amigoConfig.twikooEnvId;
    if (!envId || !window.twikoo || typeof window.twikoo.init !== 'function') return;

    containers.forEach(el => {
        if (el.dataset.twikooInit) return;
        el.dataset.twikooInit = '1';

        const path = el.dataset.pageKey || location.pathname;
        const config = { envId, el, path };
        if (window.amigoConfig.twikooLang) config.lang = window.amigoConfig.twikooLang;

        el.innerHTML = '';
        window.twikoo.init(config);
    });
}

/* ==========================================================================
   主题管理（深色/浅色模式）
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 应用主题的函数
    function apply(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // 初始化时：有本地存储就用本地的，没有就用系统的
    if (savedTheme) {
        apply(savedTheme === 'dark');
    } else {
        apply(mediaQuery.matches);
    }

    // 监听系统主题变化：如果用户没手动设置过，就跟随系统
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            apply(e.matches);
        }
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const isDark = current === 'dark';
    const targetDark = !isDark;
    
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (typeof Qmsg !== 'undefined') Qmsg.info('切到亮色模式啦');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (typeof Qmsg !== 'undefined') Qmsg.success('切到深色模式啦');
    }

    // 评论框也得跟着变色
    artalkInstances.forEach(inst => {
        if (inst && typeof inst.setDarkMode === 'function') {
            inst.setDarkMode(targetDark);
        }
    });

    // 如果用了 Giscus 评论，也给它发个消息改主题
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
        const theme = targetDark ? 'dark' : 'light';
        giscusFrame.contentWindow.postMessage(
            { giscus: { setConfig: { theme: theme } } },
            'https://giscus.app'
        );
    }
}

// 点击头像就能切换主题，挺方便的
document.addEventListener('click', (e) => {
    if (e.target.closest('.header-avatar')) {
        toggleTheme();
    }
});

// 监听系统主题变化，要是用户没手动改过，就跟着系统走
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
});

function initThemeToggle() {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(btn => {
        // 老规矩，克隆一份清掉监听器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTheme();
        });
    });
}

function initLightbox() {
    // 图片浏览器初始化
    if (window.ViewImage) {
        ViewImage.init('.moment-gallery img, .article-gallery img, .article-text img');
    }
}

function initHomeSearch() {
    var header = document.querySelector('.home-header');
    if (!header) return;
    var input = document.getElementById('home-search-input');
    var clearBtn = document.getElementById('home-search-clear');
    if (!input || !clearBtn) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.moments-feed .moment-card'));
    var timer = null;

    function applyFilter(q) {
        var query = (q || '').trim().toLowerCase();
        var anyVisible = false;
        cards.forEach(function(card) {
            var authorEl = card.querySelector('.moment-author');
            var textEl = card.querySelector('.moment-text');
            var timeEl = card.querySelector('.moment-time');
            var locationEl = card.querySelector('.moment-location');
            var tagsEl = card.querySelector('.moment-tags');
            
            var author = authorEl ? authorEl.textContent.trim().toLowerCase() : '';
            var text = textEl ? textEl.textContent.trim().toLowerCase() : '';
            var time = timeEl ? timeEl.textContent.trim().toLowerCase() : '';
            var location = locationEl ? locationEl.textContent.trim().toLowerCase() : '';
            var tags = tagsEl ? tagsEl.textContent.trim().toLowerCase() : '';
            
            var hit = !query || 
                      author.indexOf(query) !== -1 || 
                      text.indexOf(query) !== -1 || 
                      time.indexOf(query) !== -1 || 
                      location.indexOf(query) !== -1 ||
                      tags.indexOf(query) !== -1;
            
            card.style.display = hit ? '' : 'none';
            if (hit) anyVisible = true;
        });
        clearBtn.style.display = input.value ? 'flex' : 'none';
        var emptyTip = document.getElementById('home-search-empty');
        if (!emptyTip) {
            emptyTip = document.createElement('div');
            emptyTip.id = 'home-search-empty';
            emptyTip.style.margin = '10px 0';
            emptyTip.style.color = 'var(--text-muted)';
            emptyTip.style.textAlign = 'center';
            emptyTip.style.display = 'none';
            var feed = document.querySelector('.moments-feed');
            if (feed) feed.prepend(emptyTip);
        }
        emptyTip.textContent = '未找到匹配的内容';
        emptyTip.style.display = anyVisible ? 'none' : 'block';
    }

    var newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    input = newInput;

    var newClear = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newClear, clearBtn);
    clearBtn = newClear;

    input.addEventListener('input', function() {
        if (timer) clearTimeout(timer);
        var value = input.value;
        timer = setTimeout(function() { applyFilter(value); }, 150);
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            input.value = '';
            applyFilter('');
        }
    });

    clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        input.value = '';
        applyFilter('');
    });

    // 监听标签点击，自动填充搜索框并过滤
    var feed = document.querySelector('.moments-feed');
    if (feed) {
        feed.addEventListener('click', function(e) {
            // 点击标签
            if (e.target.classList.contains('moment-tag')) {
                e.preventDefault();
                e.stopPropagation();
                var tagName = e.target.textContent.replace('#', '').trim();
                input.value = tagName;
                applyFilter(tagName);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // 点击地点
            else if (e.target.classList.contains('moment-location')) {
                e.preventDefault();
                e.stopPropagation();
                var locName = e.target.textContent.trim();
                input.value = locName;
                applyFilter(locName);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    applyFilter('');
}
function initArchiveFilter() {
    var container = document.querySelector('.archive-view');
    if (!container) return;

    var header = document.getElementById('archive-header');
    var blocks = container.querySelectorAll('.archive-year-block');
    var card = document.getElementById('archive-author-card');
    var cardName = card ? card.querySelector('.archive-author-name') : null;
    var cardMeta = card ? card.querySelector('.archive-author-meta') : null;
    var cardAvatar = card ? card.querySelector('.archive-author-avatar img') : null;

    if (!header || !blocks.length) return;

    var params = new URLSearchParams(window.location.search);
    var author = params.get('author');
    author = author ? author.trim() : '';

    if (!author) {
        header.textContent = '所有文章';
        blocks.forEach(function(block) {
            block.style.display = '';
            var items = block.querySelectorAll('.archive-item');
            items.forEach(function(item) {
                item.style.display = '';
            });
        });
        if (card) {
            card.style.display = 'none';
        }
        return;
    }

    var target = author.toLowerCase();
    var totalVisible = 0;

    var avatarSrc = '';
    var allItems = container.querySelectorAll('.archive-item');
    allItems.forEach(function(item) {
        var a = item.getAttribute('data-author') || '';
        a = a.trim().toLowerCase();
        if (!avatarSrc && a && a === target) {
            avatarSrc = item.getAttribute('data-avatar') || '';
        }
    });

    blocks.forEach(function(block) {
        var items = block.querySelectorAll('.archive-item');
        var anyVisible = false;

        items.forEach(function(item) {
            var a = item.getAttribute('data-author') || '';
            a = a.trim().toLowerCase();
            if (a && a === target) {
                item.style.display = '';
                anyVisible = true;
                totalVisible++;
            } else {
                item.style.display = 'none';
            }
        });

        block.style.display = anyVisible ? '' : 'none';
    });

    if (totalVisible > 0) {
        header.textContent = '作者：' + author + ' 的文章';
        if (card) {
            card.style.display = 'flex';
        }
        if (cardName) {
            cardName.textContent = author;
        }
        if (cardMeta) {
            cardMeta.textContent = '文章数：' + totalVisible;
        }
        if (cardAvatar && avatarSrc) {
            cardAvatar.src = avatarSrc;
        }
    } else {
        header.textContent = '暂无作者 “' + author + '” 的文章，已显示全部文章';
        blocks.forEach(function(block) {
            block.style.display = '';
            var items = block.querySelectorAll('.archive-item');
            items.forEach(function(item) {
                item.style.display = '';
            });
        });
        if (card) {
            card.style.display = 'none';
        }
    }
}

function initArtalk() {
    const containers = document.querySelectorAll('.moment-comments-area');
    if (!containers.length || !window.amigoConfig) return;

    containers.forEach(el => {
        // 别重复初始化了
        if (el.dataset.artalkInit) return;

        const pageKey = el.dataset.pageKey;
        if (!pageKey) return;

        // 看看是首页列表（只读风格）还是详情页（完整交互）
        const isFeed = el.classList.contains('feed-comments');

        try {
            let ArtalkConstructor = window.Artalk;
            if (typeof ArtalkConstructor !== 'function' && ArtalkConstructor.default) {
                ArtalkConstructor = ArtalkConstructor.default;
            }

            const config = {
                el: el,
                pageKey: pageKey,
                pageTitle: document.title,
                server: window.amigoConfig.artalkServer,
                site: window.amigoConfig.artalkSite,
                darkMode: document.documentElement.getAttribute('data-theme') === 'dark',
                useBackendConf: true,
                flatMode: true, // 朋友圈风格一律用平铺模式
                nestMax: 1,
                gravatar: {
                   mirror: 'https://weavatar.com/avatar/'
                }
            };

            // 首页列表稍微改改配置
            if (isFeed) {
                // 首页隐藏编辑器什么的
            } else {
                // 详情页保持默认
            }

            const artalk = new ArtalkConstructor(config);

            artalk.on('list-loaded', (comments) => {
                let dataList = [];
                if (Array.isArray(comments)) {
                    dataList = comments;
                } else if (comments && Array.isArray(comments.data)) {
                    dataList = comments.data;
                }

                if (window.__amigoDanmakuPush && dataList.length) {
                    window.__amigoDanmakuPush(dataList);
                }

                // 计算点赞数并缓存
                const likeCount = dataList.filter(c => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = c.content;
                    const text = tempDiv.textContent.trim();
                    const htmlContent = c.content || '';
                    return (text === '[LIKE]' || text === '/like' || htmlContent.includes('[LIKE]'));
                }).length;

                // 缓存点赞数到 sessionStorage
                LikesCache.set(pageKey, likeCount);

                if (isFeed) {
                    renderWeChatFeed(artalk, el, dataList);
                } else {
                    processWeChatStyle(el, false);
                }

                // 修改评论统计，只显示评论数量，不显示点赞数量
                setTimeout(() => {
                    const commentCountEl = el.querySelector('.atk-comment-count');
                    if (commentCountEl) {
                        const normalComments = dataList.filter(c => {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = c.content;
                            const text = tempDiv.textContent.trim();
                            const htmlContent = c.content || '';
                            return !(text === '[LIKE]' || text === '/like' || htmlContent.includes('[LIKE]'));
                        });
                        const countNum = commentCountEl.querySelector('.atk-comment-count-num');
                        if (countNum) {
                            countNum.textContent = normalComments.length;
                        }
                    }
                }, 100);
            });

            // 文章详情页：初始化功能
            if (!isFeed) {
                // 1. 使用DOM拦截方式验证邮箱（更可靠）
                setTimeout(() => {
                    initEmailValidationForSingle(el);
                }, 300);

                // 2. 评论列表加载后过滤访客评论
                artalk.on('list-loaded', (data) => {
                    // 延迟处理，确保DOM已渲染
                    setTimeout(() => {
                        filterVisitorComments(el);
                    }, 100);
                });
            }

            artalkInstances.push(artalk);
            el.dataset.artalkInit = "true";

            // 绑定点赞按钮
            if (isFeed) {
                // 首页列表点赞
                const card = el.closest('.moment-card');
                if (card) {
                    const likeBtn = card.querySelector('.btn-like');
                    if (likeBtn) {
                         likeBtn.addEventListener('click', (e) => {
                             e.stopPropagation();
                             e.preventDefault();

                             // 点完赞把那个弹出小框关了
                             const popover = likeBtn.closest('.action-popover');
                             if (popover) popover.classList.remove('is-visible');

                             handleLikeAction(artalk);
                         });
                    }
                }
            } else {
                // 文章详情页点赞
                initSingleLikeButton(artalk);
            }

        } catch (e) {
            console.error('Artalk 初始化失败了：', e);
        }
    });
}

/**
 * 初始化文章详情页的点赞按钮
 */
function initSingleLikeButton(artalkInstance) {
    const likeBtn = document.getElementById('single-like-btn');
    if (!likeBtn || likeBtn.dataset.likeInit) return;

    likeBtn.dataset.likeInit = 'true';

    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 添加点赞动画效果
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').className = 'ri-heart-3-fill';

        handleLikeAction(artalkInstance);

        // 恢复按钮状态（延迟一下，让用户看到反馈）
        setTimeout(() => {
            likeBtn.classList.remove('liked');
            likeBtn.querySelector('i').className = 'ri-heart-line';
        }, 2000);
    });
}

/**
 * 检查邮箱是否是访客邮箱（禁止评论）
 * @param {string} email - 邮箱地址
 * @returns {boolean} - true表示是访客邮箱，应该禁止
 */
function isVisitorEmail(email) {
    if (!email) return false;

    // 检查常见的访客邮箱模式
    const visitorPatterns = [
        /^visitor\d+@example\.com$/i,  // visitor123@example.com
        /^guest\d+@example\.com$/i,    // guest123@example.com
        /^anonymous@/i,                 // anonymous@anydomain
        /^temp@/i,                      // temp@anydomain
        /^test@/i,                      // test@anydomain
    ];

    return visitorPatterns.some(pattern => pattern.test(email));
}

/**
 * 显示邮箱验证警告提示
 * @param {string} message - 提示信息
 */
function showEmailWarning(message) {
    console.log('[邮箱验证] 显示警告:', message);

    // 移除已有的提示
    const existingToast = document.querySelector('.email-warning-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建新的提示
    const toast = document.createElement('div');
    toast.className = 'email-warning-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 生成随机访客名字
 * @returns {string} 路过的访客XXXX格式的名字
 */
function generateRandomChineseName() {
    const randomNum = Math.floor(Math.random() * 10000);
    return '路过的访客' + String(randomNum).padStart(4, '0');
}

/**
 * 生成访客邮箱
 * @param {string} name - 昵称
 * @returns {string} 邮箱地址
 */
function generateVisitorEmail(name) {
    // 根据名字生成固定邮箱，确保同一访客头像一致
    const randomNum = name.replace('路过的访客', '');
    return `visitor${randomNum}@example.com`;
}

/**
 * 过滤访客评论，只显示真实评论
 * @param {HTMLElement} artalkEl - Artalk评论区容器元素
 */
function filterVisitorComments(artalkEl) {
    if (!artalkEl) return;

    // 查找所有评论项
    const commentItems = artalkEl.querySelectorAll('.atk-comment');

    commentItems.forEach(item => {
        // 查找邮箱信息（如果有显示的话）
        const contentEl = item.querySelector('.atk-content');
        if (!contentEl) return;

        const content = contentEl.innerHTML;

        // 检查是否是点赞评论（包含 [LIKE] 标记）
        const isLike = content.includes('[LIKE]') ||
                       content.includes('/like') ||
                       contentEl.textContent.trim() === '[LIKE]' ||
                       contentEl.textContent.trim() === '/like';

        if (isLike) {
            // 隐藏点赞评论（在文章详情页不显示）
            item.style.display = 'none';
        }
    });
}

/**
 * 为文章详情页的Artalk评论区初始化邮箱验证（DOM拦截方式）
 * @param {HTMLElement} artalkEl - Artalk评论区容器元素
 */
function initEmailValidationForSingle(artalkEl) {
    if (!artalkEl || artalkEl.dataset.emailValidationInit) return;

    console.log('[邮箱验证] 初始化DOM拦截方式');

    // 查找发送按钮
    const sendBtn = artalkEl.querySelector('.atk-send-btn');
    if (!sendBtn) {
        console.warn('[邮箱验证] 未找到发送按钮，500ms后重试');
        setTimeout(() => initEmailValidationForSingle(artalkEl), 500);
        return;
    }

    // 使用捕获阶段拦截点击事件
    sendBtn.addEventListener('click', function(e) {
        console.log('[邮箱验证] 发送按钮被点击');

        // 查找邮箱输入框
        const emailInput = artalkEl.querySelector('input.atk-email');
        if (!emailInput) {
            console.warn('[邮箱验证] 未找到邮箱输入框');
            return;
        }

        const email = emailInput.value.trim();
        console.log('[邮箱验证] 邮箱值:', email);

        // 检查是否是访客邮箱
        if (isVisitorEmail(email)) {
            console.log('[邮箱验证] 检测到访客邮箱，阻止提交');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            showEmailWarning('访客邮箱不允许评论，请使用真实邮箱地址');

            // 恢复按钮状态
            setTimeout(() => {
                sendBtn.disabled = false;
                sendBtn.textContent = '发送';
            }, 100);

            return false;
        }

        console.log('[邮箱验证] 邮箱验证通过');
    }, true); // 使用捕获阶段

    artalkEl.dataset.emailValidationInit = 'true';
    console.log('[邮箱验证] DOM拦截初始化完成');
}


/**
 * 获取IP归属地（中文）
 */
async function getIPLocation() {
    try {
        const response = await fetch('https://www.ip9.com.cn/?source=api');
        const data = await response.json();
        if (data.addr) {
            return data.addr;
        }
        return '';
    } catch (e) {
        console.warn('获取IP归属地失败:', e);
        return '';
    }
}

/**
 * 处理点赞动作
 * 其实就是发条内容带 [LIKE] 的评论，咱们后面再把它渲染成爱心
 */
async function handleLikeAction(artalkInstance) {
    // 看看用户是谁，没名字就随机分配一个真实风格的中文名字
    let user = artalkInstance.ctx.get('user').getData();
    let currentNick = user.nick;
    let currentEmail = user.email;

    if (!currentNick) {
        currentNick = generateRandomChineseName();
        currentEmail = generateVisitorEmail(currentNick);

        try {
            artalkInstance.ctx.get('user').update({
                nick: currentNick,
                email: currentEmail
            });
        } catch (e) { console.warn('更新用户信息失败了', e); }
    }

    // 获取IP归属地
    const ipLocation = await getIPLocation();

    // 下面是一堆尝试获取编辑器并提交点赞的逻辑
    
    // 尝试 1：直接拿编辑器
    let editor = artalkInstance.editor;
    
    // 尝试 2：调方法拿
    if (!editor && typeof artalkInstance.getEditor === 'function') {
        editor = artalkInstance.getEditor();
    }
    
    // 尝试 3：从 Context 里挖（针对 2.8.x 版本）
    if (!editor && artalkInstance.ctx && typeof artalkInstance.ctx.get === 'function') {
        try {
            editor = artalkInstance.ctx.get('editor');
        } catch (e) {
            console.warn('从 ctx 里没挖到编辑器', e);
        }
    }

    // 检查一下编辑器好不好使
    if (editor && (typeof editor.getContent !== 'function' || typeof editor.setContent !== 'function')) {
        console.warn('编辑器找到了但方法不对，当没找到处理', editor);
        editor = null;
    }
    
    // 如果真没编辑器（比如只读模式），那就直接调 API 发评论
    if (!editor) {
        console.warn('没找到编辑器，尝试直接调 API 点赞');
        
        if (typeof Qmsg !== 'undefined') Qmsg.loading('正在点赞...', { autoClose: true });

        // 生成点赞内容，包含IP归属地
        const likeContent = ipLocation
            ? `${ipLocation}的访客觉得这个文章很赞 <span style="display:none">[LIKE]</span>`
            : '觉得这个文章很赞 <span style="display:none">[LIKE]</span>';

        const payload = {
            nick: currentNick,
            name: currentNick, 
            email: currentEmail,
            link: user.link || '',
            content: likeContent,
            page_key: artalkInstance.conf.pageKey,
            page_title: artalkInstance.conf.pageTitle,
            site_name: artalkInstance.conf.site
        };

        const onSuccess = () => {
             if (typeof Qmsg !== 'undefined') Qmsg.success('点赞成功！');
             // 清除缓存，让下次加载时重新获取
             LikesCache.clear(artalkInstance.conf.pageKey);
             artalkInstance.reload(); // 刷一下列表
        };

        const onError = (err) => {
            console.error('点赞失败了：', err);
            const msg = '点赞失败了：' + (err.message || err);
            if (typeof Qmsg !== 'undefined') Qmsg.error(msg); else alert(msg);
        };

        // 先试试 Artalk 自带的 http 工具
        try {
            const http = artalkInstance.ctx.get('http');
            if (http && typeof http.post === 'function') {
                 http.post('/comments', payload).then(onSuccess).catch(err => { throw err; });
                 return;
            }
        } catch (e) {
             console.warn('Artalk 内部 API 用不了，换原生 fetch 试试', e);
        }

        // 原生 fetch 兜底
        try {
            const serverUrl = artalkInstance.conf.server.replace(/\/$/, '');
            const apiUrl = `${serverUrl}/api/v2/comments`; 
            const headers = { 'Content-Type': 'application/json' };
            if (user.token) headers['Authorization'] = `Bearer ${user.token}`;

            fetch(apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.msg || '未知错误') }); return res.json(); })
            .then(onSuccess)
            .catch(onError);
            return;
        } catch (e) { onError(e); }

        return;
    }

    // 有编辑器的话就简单了，填内容，提交！
    const originalContent = editor.getContent();
    const likeContent = ipLocation
        ? `${ipLocation}的访客觉得这个文章很赞 <span style="display:none">[LIKE]</span>`
        : '觉得这个文章很赞 <span style="display:none">[LIKE]</span>';

    // 清除缓存，让下次加载时重新获取
    LikesCache.clear(artalkInstance.conf.pageKey);

    editor.setContent(likeContent);
    editor.submit();
}

/**
 * 格式化时间，搞成微信那种“刚刚”、“几分钟前”
 */
function formatWeChatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < 2 * day) {
        return '昨天';
    } else {
        return (date.getMonth() + 1) + '月' + date.getDate() + '日';
    }
}

/**
 * 渲染微信朋友圈风格的评论列表
 * 把 Artalk 默认那套 DOM 藏起来，用我们自己生成的这套
 */
function renderWeChatFeed(artalkInstance, container, comments) {
    // 1. 藏起原生的列表和编辑器
    const originalList = container.querySelector('.atk-list');
    const originalEditor = container.querySelector('.atk-main-editor');
    if (originalList) originalList.style.display = 'none';
    if (originalEditor) originalEditor.style.display = 'none';

    // 隐藏Artalk自带的评论统计（包含点赞数量）
    const commentCountEl = container.querySelector('.atk-comment-count');
    if (commentCountEl) {
        commentCountEl.style.display = 'none';
    }

    // 2. 准备我们自己的容器
    let customContainer = container.querySelector('.wechat-custom-render');
    if (!customContainer) {
        customContainer = document.createElement('div');
        customContainer.className = 'wechat-custom-render';
        container.appendChild(customContainer);
    } else {
        customContainer.innerHTML = ''; // 清空旧的
    }

    // 3. 把点赞和普通评论分出来
    const likeNicks = [];
    const normalComments = [];
    const commentMap = new Map();

    comments.forEach(c => {
        commentMap.set(c.id, c.nick);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = c.content;
        const text = tempDiv.textContent.trim();
        const htmlContent = c.content || '';

        // 看看有没有点赞标记
        if (text === '[LIKE]' || text === '/like' || htmlContent.includes('[LIKE]')) {
            likeNicks.push(c.nick);
        } else {
            normalComments.push(c);
        }
    });

    // 4. 渲染”赞”那一部分
    let likesArea = container.querySelector('.moment-likes');

    if (!likesArea) {
        likesArea = document.createElement('div');
        likesArea.className = 'moment-likes';

        const icon = document.createElement('i');
        icon.className = 'ri-heart-line';
        likesArea.appendChild(icon);

        const listSpan = document.createElement('span');
        listSpan.className = 'moment-likes-list';
        likesArea.appendChild(listSpan);

        container.prepend(likesArea);
    }

    const likesListSpan = likesArea.querySelector('.moment-likes-list');

    // 优先使用缓存的点赞数，如果没有则使用实时计算的
    const pageKey = artalkInstance.conf.pageKey;
    const cachedCount = LikesCache.get(pageKey);
    const likeCount = cachedCount !== null ? cachedCount : likeNicks.length;

    const hasLikes = likeCount > 0;
    const hasComments = normalComments.length > 0;
    const hasActivity = hasLikes || hasComments;

    if (hasLikes) {
        likesArea.style.display = 'flex';
        likesListSpan.textContent = likeCount + ' 人觉得很赞';

        if (!hasComments) {
            likesArea.style.borderBottom = 'none';
            likesArea.style.marginBottom = '0';
            likesArea.style.paddingBottom = '0';
        } else {
            likesArea.style.borderBottom = '';
            likesArea.style.marginBottom = '';
            likesArea.style.paddingBottom = '';
        }
    } else {
        likesArea.style.display = 'none';
    }

    // 5. 渲染真正的评论
    if (normalComments.length > 0) {
        const listUl = document.createElement('div');
        listUl.className = 'wechat-comments-list';

        normalComments.forEach(c => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'wechat-comment-item';
            
            let replyTargetNick = null;
            const tempC = document.createElement('div');
            tempC.innerHTML = c.content;
            
            // 看看是不是回复某人的
            const replyAtNode = tempC.querySelector('.atk-reply-at');
            if (replyAtNode) {
                let rText = replyAtNode.textContent.trim();
                // Remove '@' if present
                if (rText.startsWith('@')) {
                    rText = rText.substring(1);
                }
                replyTargetNick = rText;
                
                // CRITICAL: Remove the node from content so it doesn't duplicate
                replyAtNode.remove();
            }

            // Priority 1: Direct field (Artalk standard)
            if (!replyTargetNick && c.reply_nick) {
                replyTargetNick = c.reply_nick;
            } 
            // Priority 2: Nested object (Artalk 2.x some versions)
            else if (!replyTargetNick && c.reply_user && c.reply_user.nick) {
                replyTargetNick = c.reply_user.nick;
            }
            // Priority 3: UA data (sometimes stored here)
            else if (!replyTargetNick && c.ua && c.ua.reply_nick) {
                replyTargetNick = c.ua.reply_nick;
            }
            // Priority 4: Look up by rid/pid
            else if (!replyTargetNick && c.rid && c.rid !== 0) {
                // Try to find the parent comment
                // If pid exists, use it (direct parent), otherwise use rid (root)
                const targetId = c.pid || c.rid;
                if (commentMap.has(targetId)) {
                    replyTargetNick = commentMap.get(targetId);
                }
            }

            // 主体部分（昵称 + 回复对象 + 内容）放在一块，方便右侧放时间
            const mainSpan = document.createElement('span');
            mainSpan.className = 'wechat-main';

            // Nickname
            const nickSpan = document.createElement('span');
            nickSpan.className = 'wechat-nick';
            nickSpan.textContent = c.nick;
            mainSpan.appendChild(nickSpan);

            // Reply Logic
            if (replyTargetNick) {
                const replyText = document.createTextNode('回复');
                const targetSpan = document.createElement('span');
                targetSpan.className = 'wechat-nick';
                targetSpan.textContent = replyTargetNick;
                
                mainSpan.appendChild(replyText);
                mainSpan.appendChild(targetSpan);
            }

            // Colon (Always present before content)
            const colonSpan = document.createElement('span');
            colonSpan.className = 'wechat-colon';
            colonSpan.textContent = ' : ';
            mainSpan.appendChild(colonSpan);

            // Content
            const contentSpan = document.createElement('span');
            contentSpan.className = 'wechat-content';
            
            // Unwrap <p>
            const ps = tempC.querySelectorAll('p');
            if (ps.length > 0) {
               ps.forEach(p => {
                   const s = document.createElement('span');
                   s.innerHTML = p.innerHTML;
                   p.replaceWith(s);
               });
            }
            contentSpan.innerHTML = tempC.innerHTML;
            mainSpan.appendChild(contentSpan);

            // 时间
            let timeSpan = null;
            if (c.date) {
                timeSpan = document.createElement('span');
                timeSpan.className = 'wechat-time';
                timeSpan.textContent = formatWeChatTime(c.date);
            }

            itemDiv.appendChild(mainSpan);
            if (timeSpan) itemDiv.appendChild(timeSpan);
            
            listUl.appendChild(itemDiv);
        });

        customContainer.appendChild(listUl);
    }

    // 6. Handle Container Visibility (Empty State)
    if (!hasLikes && !hasComments) {
        container.style.display = 'none';
    } else {
        // Show with animation (was display:none in CSS)
        container.style.display = 'block';
        container.style.animation = 'fadeIn 0.3s ease-out';
    }
}


/**
 * Process Artalk list to match WeChat Official Account style (Single Page)
 * Mainly filters out "Like" comments which shouldn't appear in the article comment list.
 */
function processWeChatStyle(container, isFeed) {
    if (isFeed) return; // Feed uses renderWeChatFeed instead

    // 先隐藏整个列表，避免闪烁
    const list = container.querySelector('.atk-list');
    if (list) {
        list.style.visibility = 'hidden';
    }

    // 使用 MutationObserver 监听 DOM 变化，过滤点赞评论
    const filterLikes = () => {
        const items = container.querySelectorAll('.atk-item');
        let hasVisibleItems = false;

        items.forEach(item => {
            // 如果已经处理过，跳过
            if (item.dataset.likeFiltered) return;

            const contentEl = item.querySelector('.atk-content');
            if (!contentEl) return;

            const htmlContent = contentEl.innerHTML;
            const textContent = contentEl.textContent.trim();

            // Check for [LIKE] marker in text or hidden span
            const isLike = textContent === '[LIKE]' ||
                           textContent === '/like' ||
                           htmlContent.includes('[LIKE]');

            if (isLike) {
                item.style.display = 'none';
                item.dataset.likeFiltered = 'true';
            } else {
                hasVisibleItems = true;
                item.dataset.likeFiltered = 'true';
            }
        });

        // 显示列表（过滤完成后）
        if (list) {
            list.style.visibility = 'visible';
        }

        return hasVisibleItems;
    };

    // 立即尝试过滤
    const hasItems = filterLikes();

    // 如果没有找到项目，设置一个短延迟再试一次（等待 Artalk 渲染）
    if (!hasItems) {
        setTimeout(filterLikes, 100);
    }
}

// Old function replaced by processWeChatStyle
// function formatArtalkReplies(container, isFeed) { ... }

function initHeaderMedia() {
    var header = document.querySelector('.moments-header');
    if (!header || !window.amigoConfig) return;
    // 若已包含视频，跳过动态图逻辑
    if (header.querySelector('video.moments-header-video')) return;

    var list = (window.amigoConfig.headerMediaList || []).filter(function(src) {
        return typeof src === 'string' && /\.(avif|jpg|jpeg|png|gif|webp)$/i.test(src);
    });
    var single = window.amigoConfig.headerMedia || '';
    var isImage = /\.(avif|jpg|jpeg|png|gif|webp)$/i.test(single);
    var isVideo = /\.(mp4|webm|ogg)$/i.test(single);

    // 1) 多图轮播（参考：朴素实现）
    if (list.length >= 2 && !isVideo) {
        var dynamic = header.querySelector('.moments-header-dynamic');
        if (!dynamic) {
            dynamic = document.createElement('div');
            dynamic.className = 'moments-header-dynamic';
            header.appendChild(dynamic);
        } else {
            dynamic.innerHTML = '';
        }

        var slides = [];
        list.forEach(function(src, idx) {
            var img = document.createElement('img');
            img.className = 'slide' + (idx === 0 ? ' active' : '');
            img.src = src;
            img.alt = 'header slide';
            img.loading = 'eager';
            dynamic.appendChild(img);
            slides.push(img);
        });

        var i = 0;
        function next() {
            var cur = i;
            var nxt = (i + 1) % slides.length;
            slides[cur].classList.remove('active');
            slides[nxt].classList.add('active');
            i = nxt;
            setTimeout(next, 6000);
        }
        setTimeout(next, 6000);
        return;
    }

    // 2) 单图 Live Photo：同名视频触发播放（mouseenter / touch）
    if (isImage && !isVideo) {
        // 生成同名视频路径（.mp4）
        var videoSrc = single.replace(/\.(avif|jpg|jpeg|png|gif|webp)$/i, '.mp4');
        var video = document.createElement('video');
        video.className = 'moments-header-live';
        video.src = videoSrc;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.loop = true;
        video.preload = 'metadata';
        // 允许声音，因交互触发，不受自动播放限制；如需静音可改为 video.muted = true;
        video.muted = false;

        var available = true;
        video.addEventListener('error', function() {
            available = false;
            if (video && video.parentNode) video.parentNode.removeChild(video);
        }, { once: true });
        video.addEventListener('play', function() {
            video.classList.add('playing');
        });
        video.addEventListener('pause', function() {
            video.classList.remove('playing');
        });

        header.appendChild(video);

        function playLive() {
            if (!available) return;
            // 交互触发播放，带声音
            var p = video.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function() {});
            }
        }
        function stopLive() {
            if (!available) return;
            video.pause();
            try { video.currentTime = 0; } catch(e) {}
        }

        header.addEventListener('mouseenter', playLive);
        header.addEventListener('mouseleave', stopLive);
        header.addEventListener('touchstart', function() {
            playLive();
        }, { passive: true });
        header.addEventListener('touchend', function() {
            stopLive();
        }, { passive: true });
        header.addEventListener('touchcancel', function() {
            stopLive();
        }, { passive: true });
        return;
    }
}

function initLivePhotoShortcodes() {
    document.querySelectorAll('.live-photo').forEach(function(livePhoto) {
        if (livePhoto.__liveBound) return;
        livePhoto.__liveBound = true;

        var video = livePhoto.querySelector('video.live-photo-video') || livePhoto.querySelector('video');
        var posterImg = livePhoto.querySelector('img.live-photo-poster') || livePhoto.querySelector('img');
        var toggleBtn = livePhoto.querySelector('.live-photo-toggle-btn');
        var muteBtn = livePhoto.querySelector('.live-photo-mute-btn');
        var warning = livePhoto.querySelector('.warning');

        if (!video || !toggleBtn || !muteBtn) return;

        var HOVER_DELAY = 500;
        var hoverTimer = null;
        var isManuallyControlled = toggleBtn.getAttribute('data-state') === 'live';
        var isLoaded = false;

        function setWarning(text) {
            if (!warning) return;
            warning.textContent = text || '';
            if (text) warning.classList.add('show');
            else warning.classList.remove('show');
        }

        function syncAspectFromPoster() {
            if (!posterImg) return;
            var w = posterImg.naturalWidth || 0;
            var h = posterImg.naturalHeight || 0;
            if (!w || !h) return;
            livePhoto.style.setProperty('--live-photo-aspect', w + ' / ' + h);
        }

        if (posterImg && posterImg.complete) {
            syncAspectFromPoster();
        } else if (posterImg) {
            posterImg.addEventListener('load', function() {
                syncAspectFromPoster();
            }, { once: true });
        }

        function ensureLoaded() {
            if (isLoaded) return;
            isLoaded = true;
            var src = (video.dataset && video.dataset.src) ? video.dataset.src : '';
            if (src && !video.getAttribute('src')) {
                video.setAttribute('src', src);
                video.src = src;
            }
            try { video.load(); } catch (e) {}
        }

        function setMuted(isMuted) {
            video.muted = !!isMuted;
            if (isMuted) video.setAttribute('muted', '');
            else video.removeAttribute('muted');
            muteBtn.setAttribute('data-muted', isMuted ? 'true' : 'false');
        }

        function getMuted() {
            return muteBtn.getAttribute('data-muted') !== 'false';
        }

        if (!video.hasAttribute('muted')) setMuted(true);
        else setMuted(getMuted());

        function stopVideo(force) {
            if (!force && isManuallyControlled) return;
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            livePhoto.classList.remove('is-playing');
            setWarning('');
            try { video.pause(); } catch (e) {}
            try { video.currentTime = 0; } catch (e) {}
        }

        async function playVideo(opts) {
            ensureLoaded();
            setWarning('');

            var wantUnmute = opts && opts.unmute === true;
            if (wantUnmute) setMuted(false);
            else setMuted(getMuted());

            try { video.currentTime = 0; } catch (e) {}

            try {
                var p = video.play();
                if (p && typeof p.catch === 'function') await p;
                livePhoto.classList.add('is-playing');
                return;
            } catch (e) {
                if (!video.muted) {
                    setMuted(true);
                    try {
                        var p2 = video.play();
                        if (p2 && typeof p2.catch === 'function') await p2;
                        livePhoto.classList.add('is-playing');
                        return;
                    } catch (e2) {}
                }

                if (e && e.name === 'AbortError') return;
                if (e && e.name === 'NotAllowedError') {
                    setWarning('浏览器未允许视频自动播放权限，无法播放实况照片。');
                } else if (e && e.name === 'NotSupportedError') {
                    setWarning('视频未加载完成或浏览器不支持播放此视频格式。');
                } else {
                    setWarning('其它错误：' + e);
                }
            }
        }

        function scheduleHoverPlay() {
            if (isManuallyControlled) return;
            if (hoverTimer) clearTimeout(hoverTimer);
            hoverTimer = setTimeout(function() {
                playVideo({ unmute: false });
            }, HOVER_DELAY);
        }

        livePhoto.addEventListener('mouseenter', function() {
            scheduleHoverPlay();
        });
        livePhoto.addEventListener('mouseleave', function() {
            stopVideo(false);
        });

        livePhoto.addEventListener('touchstart', function() {
            scheduleHoverPlay();
        }, { passive: true });
        livePhoto.addEventListener('touchend', function() {
            stopVideo(false);
        }, { passive: true });
        livePhoto.addEventListener('touchcancel', function() {
            stopVideo(false);
        }, { passive: true });

        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            isManuallyControlled = !isManuallyControlled;
            toggleBtn.setAttribute('data-state', isManuallyControlled ? 'live' : 'static');

            if (isManuallyControlled) {
                playVideo({ unmute: false });
            } else {
                stopVideo(true);
            }
        });

        muteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            var nextMuted = !getMuted();
            setMuted(nextMuted);

            if (!nextMuted && (isManuallyControlled || livePhoto.classList.contains('is-playing'))) {
                playVideo({ unmute: true });
            }
        });

        video.addEventListener('pause', function() {
            if (!isManuallyControlled) {
                livePhoto.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function() {
            if (!isManuallyControlled) {
                stopVideo(true);
            }
        });
    });
}

function initDanmaku() {
    const root = document.getElementById('danmaku-root');
    if (!root || !window.amigoConfig) return;
    if (window.__amigoDanmakuInit) return;

    const cfg = window.amigoConfig;
    if (cfg.commentMode !== 'artalk' || cfg.enableDanmaku === false) return;

    window.__amigoDanmakuInit = true;

    const trackCount = 6;
    const tracks = [];
    for (let i = 0; i < trackCount; i++) {
        const trackEl = document.createElement('div');
        trackEl.className = 'danmaku-track';
        root.appendChild(trackEl);
        tracks.push({ el: trackEl, busy: false });
    }

    let queue = [];
    let lastFire = 0;
    let gapMs = 1000;

    function cleanContent(html) {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const replyEls = temp.querySelectorAll('.atk-reply-at');
        replyEls.forEach(function(node) {
            node.remove();
        });
        let text = temp.textContent || '';
        text = text.replace(/\[LIKE\]/gi, '').replace(/\/like/gi, '');
        text = text.replace(/\s+/g, ' ');
        return text.trim();
    }

    function normalizeItem(raw) {
        if (!raw) return null;
        const html = raw.content || raw.content_html || raw.comment || '';
        const text = cleanContent(html);
        if (!text) return null;
        const nick = raw.nick || raw.name || '游客';
        const date = raw.date || raw.created_at || raw.createdAt || '';
        return { nick: nick, text: text, date: date };
    }

    window.__amigoDanmakuPush = function(list) {
        if (!Array.isArray(list)) return;
        list.forEach(function(raw) {
            const item = normalizeItem(raw);
            if (!item) return;
            queue.push(item);
            if (queue.length > 200) {
                queue.splice(0, queue.length - 200);
            }
        });
    };

    function pushToTrack(track, item) {
        const el = document.createElement('div');
        el.className = 'danmaku-item';

        const nickSpan = document.createElement('span');
        nickSpan.className = 'danmaku-nick';
        nickSpan.textContent = item.nick;

        const sepSpan = document.createElement('span');
        sepSpan.className = 'danmaku-sep';
        sepSpan.textContent = ':';

        const textSpan = document.createElement('span');
        textSpan.className = 'danmaku-text';
        textSpan.textContent = item.text;

        el.appendChild(nickSpan);
        el.appendChild(sepSpan);
        el.appendChild(textSpan);

        track.el.appendChild(el);

        const duration = 12 + Math.random() * 6;
        el.style.animation = 'danmaku-move ' + duration + 's linear forwards';

        setTimeout(function() {
            if (track.el.contains(el)) {
                track.el.removeChild(el);
            }
            track.busy = false;
        }, duration * 1000 + 200);
    }

    function loop() {
        if (document.hidden) {
            setTimeout(loop, 2000);
            return;
        }

        if (queue.length) {
            const now = Date.now();
            if (now - lastFire >= gapMs) {
                const available = tracks.find(t => !t.busy);
                if (available) {
                    const rootHeight = root.clientHeight || 200;
                    const maxTop = Math.max(0, rootHeight - 28);
                    const top = Math.random() * maxTop;
                    available.el.style.top = top + 'px';
                    const item = queue.shift();
                    available.busy = true;
                    pushToTrack(available, item);
                    lastFire = now;
                    gapMs = 900 + Math.floor(Math.random() * 600);
                }
            }
        }

        setTimeout(loop, 300);
    }

    setTimeout(loop, 1000);
}

/**
 * 格式化时间显示（微信朋友圈风格）
 * 今天：显示"今天"或具体时间
 * 昨天：显示"昨天"
 * 本周：显示星期几
 * 更早：显示具体日期
 */
function formatMomentTimes() {
    const timeElements = document.querySelectorAll('.moment-time[data-moment-time]');

    timeElements.forEach(el => {
        const timeStr = el.dataset.momentTime;
        if (!timeStr) return;

        const date = new Date(timeStr);
        const now = new Date();

        // 计算时间差
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // 获取今天的日期
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 判断是否是今天
        const isToday = date >= today;
        // 判断是否是昨天
        const isYesterday = date >= yesterday && date < today;

        // 获取星期几
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekDay = weekDays[date.getDay()];

        // 格式化时间
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeStr24 = `${hours}:${minutes}`;

        let displayText = '';

        if (isToday) {
            // 今天：显示时间
            displayText = timeStr24;
        } else if (isYesterday) {
            // 昨天：显示"昨天"
            displayText = '昨天';
        } else if (diffDays < 7) {
            // 本周内：显示星期几
            displayText = weekDay;
        } else {
            // 更早：显示具体日期
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            const currentYear = now.getFullYear();

            if (year === currentYear) {
                // 今年：显示月日
                displayText = `${month}月${day}日`;
            } else {
                // 其他年份：显示年月日
                displayText = `${year}年${month}月${day}日`;
            }
        }

        el.textContent = displayText;
    });
}

function initMoments() {
    // 0. 格式化时间显示（微信朋友圈风格）
    formatMomentTimes();

    // 1. Handle Text Expand/Collapse
    const posts = document.querySelectorAll('.moment-card');

    posts.forEach(card => {
        const textWrapper = card.querySelector('.moment-text-wrapper');
        if (!textWrapper) return;

        const textDiv = textWrapper.querySelector('.moment-text');
        const toggleBtn = textWrapper.querySelector('.text-toggle');

        if (textDiv && toggleBtn) {
            const livePhotos = Array.prototype.slice.call(textDiv.querySelectorAll('.live-photo'));
            if (livePhotos.length) {
                let liveWrap = card.querySelector('.moment-livephotos');
                if (!liveWrap) {
                    liveWrap = document.createElement('div');
                    liveWrap.className = 'moment-livephotos moment-gallery';
                } else {
                    liveWrap.className = 'moment-livephotos moment-gallery';
                    liveWrap.innerHTML = '';
                }

                if (livePhotos.length === 1) {
                    const single = document.createElement('div');
                    single.className = 'gallery-single';
                    single.appendChild(livePhotos[0]);
                    liveWrap.appendChild(single);
                } else {
                    const grid = document.createElement('div');
                    const len = livePhotos.length;
                    grid.className = 'gallery-grid ' + ((len === 2 || len === 4) ? 'cols-2' : 'cols-3');

                    livePhotos.forEach(function(node) {
                        const item = document.createElement('div');
                        item.className = 'gallery-item';
                        item.appendChild(node);
                        grid.appendChild(item);
                    });

                    liveWrap.appendChild(grid);
                }

                textWrapper.insertAdjacentElement('afterend', liveWrap);
            }

            // 检测实况照片、音乐卡片和视频，有的话取消折叠
            const motionPhotos = textDiv.querySelectorAll('.amigo-motion-photo-mark');
            const musicCards = textDiv.querySelectorAll('.amigo-music-card-mark');
            const videoContainers = textDiv.querySelectorAll('.amigo-video-container');

            // 清理旧状态
            textDiv.classList.remove('has-motion-photos', 'has-music-card', 'has-video', 'has-voice');
            textWrapper.classList.remove('has-motion-photos', 'has-music-card', 'has-video', 'has-voice');
            textDiv.removeAttribute('data-motion-count');

            if (motionPhotos.length) {
                textDiv.classList.add('has-motion-photos');
                textWrapper.classList.add('has-motion-photos');
                textDiv.dataset.motionCount = String(motionPhotos.length);
                // 设置网格列数
                const cols = Math.min(motionPhotos.length, 3);
                const colsMd = Math.min(motionPhotos.length, 2);
                const colsSm = 1;
                textDiv.style.setProperty('--motion-photo-columns', String(cols));
                textDiv.style.setProperty('--motion-photo-columns-md', String(colsMd));
                textDiv.style.setProperty('--motion-photo-columns-sm', String(colsSm));
            }

            if (musicCards.length) {
                textDiv.classList.add('has-music-card');
                textWrapper.classList.add('has-music-card');
            }

            if (videoContainers.length) {
                textDiv.classList.add('has-video');
                textWrapper.classList.add('has-video');
            }

            const voiceMsgs = textDiv.querySelectorAll('.amigo-voice-bubble');
            if (voiceMsgs.length) {
                textDiv.classList.add('has-voice');
                textWrapper.classList.add('has-voice');
            }

            // Reset state for re-init
            textDiv.classList.add('is-collapsed');
            toggleBtn.style.display = 'none';
            toggleBtn.innerText = '全文';

            // 如果有实况照片、音乐卡片、视频或语音，不需要折叠
            const hasSpecialContent = motionPhotos.length > 0 || musicCards.length > 0 || videoContainers.length > 0 || voiceMsgs.length > 0;

            // Check overflow after a small delay to ensure rendering
            setTimeout(() => {
                if (hasSpecialContent) {
                    // 有特殊内容时不显示全文按钮
                    toggleBtn.style.display = 'none';
                } else {
                    const isOverflowing = textDiv.scrollHeight > textDiv.clientHeight;
                    if (isOverflowing) {
                        toggleBtn.style.display = 'inline-block';
                    }
                }
            }, 100);

            // Toggle Click Handler
            toggleBtn.onclick = function() {
                const isCollapsed = textDiv.classList.contains('is-collapsed');
                if (isCollapsed) {
                    textDiv.classList.remove('is-collapsed');
                    toggleBtn.innerText = '收起';
                } else {
                    textDiv.classList.add('is-collapsed');
                    toggleBtn.innerText = '全文';
                    // Scroll back to card top if user collapsed a long text
                    const cardTop = card.getBoundingClientRect().top + window.scrollY - 80;
                    if (window.scrollY > cardTop) {
                        window.scrollTo({ top: cardTop, behavior: 'smooth' });
                    }
                }
            };
        }
    });

    // 2. Handle Action Menu (Popover)
    // Close all popovers when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-wrapper')) {
            document.querySelectorAll('.action-popover').forEach(el => {
                el.classList.remove('is-visible');
            });
        }
    });

    const actionWrappers = document.querySelectorAll('.action-wrapper');
    actionWrappers.forEach(wrapper => {
        const toggleBtn = wrapper.querySelector('.action-toggle');
        const popover = wrapper.querySelector('.action-popover');

        if (toggleBtn && popover) {
            toggleBtn.onclick = function(e) {
                e.stopPropagation(); // Prevent document click

                // Close others first
                document.querySelectorAll('.action-popover').forEach(el => {
                    if (el !== popover) el.classList.remove('is-visible');
                });

                // Toggle current
                popover.classList.toggle('is-visible');
            };
        }
    });
}

/* ==========================================================================
   紧凑音乐卡片播放器 (music-card)
   ========================================================================== */

class MusicCardPlayer {
    constructor(container, attachOnly) {
        this.container = container;
        this.isPlaying = false;
        this.isSeeking = false;

        this.src = container.dataset.src;
        this.name = container.dataset.name;
        this.artist = container.dataset.artist;
        this.isApi = container.dataset.isApi === 'true';
        this.resolvedSrc = this.isApi ? null : this.src;

        this.audio = AudioManager.audio;
        this.playBtn = container.querySelector('.amigo-music-card__play');
        this.seekInput = container.querySelector('.amigo-music-card__seek');
        this.seekThumb = container.querySelector('.amigo-music-card__seek-thumb');
        this.seekWrap = container.querySelector('.amigo-music-card__seek-wrap');
        this.timeCurrent = container.querySelector('.amigo-music-card__time--current');
        this.timeDuration = container.querySelector('.amigo-music-card__time--duration');

        this.bindEvents();

        if (this.resolvedSrc && AudioManager.src === this.resolvedSrc) {
            AudioManager.attach(this);
            if (AudioManager.isPlaying) {
                this.syncUI();
            } else {
                this.onLoadedMetadata();
                this.onTimeUpdate();
            }
        } else if (attachOnly) {
            // attachOnly used by PJAX resume; only attach when src matches
        } else {
            this.resetUI();
        }
    }

    async fetchAndSetAudioUrl(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.url) {
                this.resolvedSrc = data.url;
                return data.url;
            }
        } catch (e) {
            console.error('fetch audio url failed:', e);
        }
        return null;
    }

    bindEvents() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }

        const art = this.container.querySelector('.amigo-music-card__art');
        if (art) {
            art.addEventListener('click', () => this.togglePlay());
        }

        if (this.seekInput) {
            this.seekInput.addEventListener('input', (e) => {
                if (!this.isActive()) return;
                this.isSeeking = true;
                this.updateSeekVisual(e.target.value / 1000);
            });
            this.seekInput.addEventListener('change', (e) => {
                if (this.isActive() && this.audio && this.audio.duration) {
                    this.audio.currentTime = (e.target.value / 1000) * this.audio.duration;
                }
                this.isSeeking = false;
            });
        }

        this.audio.addEventListener('timeupdate', () => { if (this.isActive()) this.onTimeUpdate(); });
        this.audio.addEventListener('loadedmetadata', () => { if (this.isActive()) this.onLoadedMetadata(); });
        this.audio.addEventListener('ended', () => { if (this.isActive()) this.onEnded(); });
        this.audio.addEventListener('play', () => {
            if (this.isActive()) {
                this.onPlay();
            } else {
                this.resetUI();
            }
        });
        this.audio.addEventListener('pause', () => { if (this.isActive()) this.onPause(); });
    }

    isActive() {
        return AudioManager._audio && AudioManager._audio._player === this;
    }

    syncUI() {
        this.isPlaying = AudioManager.isPlaying;
        this.container.setAttribute('data-playing', this.isPlaying ? 'true' : 'false');
        if (this.playBtn) this.playBtn.setAttribute('aria-pressed', this.isPlaying ? 'true' : 'false');
        if (this.audio.duration) {
            this.onLoadedMetadata();
            this.onTimeUpdate();
        }
    }

    resetUI() {
        this.isPlaying = false;
        this.container.setAttribute('data-playing', 'false');
        if (this.playBtn) this.playBtn.setAttribute('aria-pressed', 'false');
        this.container.style.setProperty('--music-progress', '0%');
        if (this.seekInput) this.seekInput.value = 0;
        if (this.timeCurrent) this.timeCurrent.textContent = '0:00';
        if (this.timeDuration) this.timeDuration.textContent = '--:--';
    }

    async togglePlay() {
        if (this.isActive()) {
            if (AudioManager.isPlaying) {
                AudioManager.pause();
            } else {
                AudioManager.play();
            }
            return;
        }

        this.takeOver();

        let src = this.resolvedSrc;
        if (!src && this.isApi && this.src) {
            src = await this.fetchAndSetAudioUrl(this.src);
        }
        if (!src) return;

        if (AudioManager.src !== src) {
            AudioManager.load(src);
        }
        AudioManager.play();
    }

    takeOver() {
        const prev = AudioManager._audio && AudioManager._audio._player;
        if (prev && prev !== this && typeof prev.resetUI === 'function') {
            prev.resetUI();
        }
        AudioManager.pause();
        AudioManager.attach(this);
    }

    onPlay() {
        this.isPlaying = true;
        this.container.setAttribute('data-playing', 'true');
        if (this.playBtn) this.playBtn.setAttribute('aria-pressed', 'true');
    }

    onPause() {
        this.isPlaying = false;
        this.container.setAttribute('data-playing', 'false');
        if (this.playBtn) this.playBtn.setAttribute('aria-pressed', 'false');
    }

    onEnded() {
        this.isPlaying = false;
        this.container.setAttribute('data-playing', 'false');
        if (this.playBtn) this.playBtn.setAttribute('aria-pressed', 'false');
        if (this.audio) this.audio.currentTime = 0;
        this.updateSeekVisual(0);
    }

    onTimeUpdate() {
        if (this.isSeeking || !this.audio || !this.audio.duration) return;
        const progress = this.audio.currentTime / this.audio.duration;
        this.updateSeekVisual(progress);
        if (this.timeCurrent) {
            this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    onLoadedMetadata() {
        if (this.timeDuration && this.audio) {
            this.timeDuration.textContent = this.formatTime(this.audio.duration);
        }
    }

    updateSeekVisual(progress) {
        const pct = Math.max(0, Math.min(1, progress)) * 100;
        this.container.style.setProperty('--music-progress', pct + '%');
        if (this.seekInput) this.seekInput.value = Math.round(progress * 1000);
        if (this.timeCurrent && this.audio && this.audio.duration) {
            this.timeCurrent.textContent = this.formatTime(progress * this.audio.duration);
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}

function initMusicCardPlayers() {
    const cards = document.querySelectorAll('.amigo-music-card[data-amigo-music-card]');
    cards.forEach(card => {
        if (!card.dataset.cardInit) {
            new MusicCardPlayer(card);
            card.dataset.cardInit = 'true';
        }
    });
}

function attachPlayingMusicPlayer() {
    const cards = document.querySelectorAll('.amigo-music-card[data-amigo-music-card]');
    cards.forEach(card => {
        if (!card.dataset.cardInit) {
            new MusicCardPlayer(card, true);
            card.dataset.cardInit = 'true';
        }
    });

    const player = document.querySelector('.music-player');
    if (player && !player.dataset.musicInit) {
        new MusicPlayer(player, true);
        player.dataset.musicInit = 'true';
    }
}

/* ==========================================================================
   视频播放器功能 (video shortcode)
   ========================================================================== */

function initVideoPlayers() {
    document.querySelectorAll('.amigo-video-container:not(.amigo-video-bilibili)').forEach(container => {
        if (container.dataset.videoInit) return;
        container.dataset.videoInit = 'true';

        const video = container.querySelector('.amigo-video');
        const playBtn = container.querySelector('.amigo-video-play-btn');
        const muteBtn = container.querySelector('.amigo-video-mute-btn');
        const fullscreenBtn = container.querySelector('.amigo-video-fullscreen-btn');
        const progressBar = container.querySelector('.amigo-video-progress');
        const progressFill = container.querySelector('.amigo-video-progress-bar');
        const timeEl = container.querySelector('.amigo-video-time');

        if (!video) return;

        const formatTime = (s) => {
            if (!s || isNaN(s)) return '0:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        };

        const updatePlayIcon = () => {
            const icon = playBtn.querySelector('i');
            icon.className = video.paused ? 'ri-play-fill' : 'ri-pause-fill';
        };

        // 点击容器播放/暂停
        container.addEventListener('click', (e) => {
            if (e.target.closest('.amigo-video-controls')) return;
            video.paused ? video.play() : video.pause();
        });

        // 播放按钮
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.paused ? video.play() : video.pause();
        });

        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);
        video.addEventListener('ended', () => {
            updatePlayIcon();
            progressFill.style.width = '0';
        });

        // 进度条
        video.addEventListener('timeupdate', () => {
            if (!video.duration) return;
            const pct = (video.currentTime / video.duration) * 100;
            progressFill.style.width = pct + '%';
            timeEl.textContent = formatTime(video.currentTime);
        });

        progressBar.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            video.currentTime = pct * video.duration;
        });

        // 静音
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            muteBtn.querySelector('.ri-volume-up-line').style.display = video.muted ? 'none' : '';
            muteBtn.querySelector('.ri-volume-mute-line').style.display = video.muted ? '' : 'none';
        });

        // 全屏
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen().catch(() => {});
            }
        });
    });
}

/* ==========================================================================
   微信语音消息功能 (voice shortcode)
   ========================================================================== */

function initVoiceMessages() {
    document.querySelectorAll('.amigo-voice-bubble').forEach(el => {
        if (el.dataset.voiceInit) return;
        el.dataset.voiceInit = 'true';

        const src = el.dataset.src;
        if (!src) return;

        const durationEl = el.querySelector('.amigo-voice-duration');
        let audio = null;
        let isPlaying = false;

        // 立即加载音频获取真实时长
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.addEventListener('loadedmetadata', () => {
            if (probe.duration && !isNaN(probe.duration)) {
                durationEl.textContent = Math.round(probe.duration) + '″';
            }
        });
        probe.src = src;

        const stop = () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            isPlaying = false;
            el.classList.remove('is-playing');
        };

        el.addEventListener('click', () => {
            if (!audio) {
                audio = new Audio(src);
                audio.addEventListener('ended', stop);
            }

            if (isPlaying) {
                stop();
            } else {
                document.querySelectorAll('.amigo-voice-bubble.is-playing').forEach(other => {
                    if (other !== el) {
                        other.classList.remove('is-playing');
                        if (other._voiceAudio) {
                            other._voiceAudio.pause();
                            other._voiceAudio.currentTime = 0;
                        }
                    }
                });
                audio.play().catch(() => {});
                isPlaying = true;
                el.classList.add('is-playing');
                el._voiceAudio = audio;
            }
        });
    });
}

/* ==========================================================================
   Motion Photo 实况照片功能
   ========================================================================== */

class MotionPhoto {
    constructor(container) {
        this.container = container;
        this.video = container.querySelector('.live-photo-video');
        this.toggleBtn = container.querySelector('.live-photo-toggle-btn');
        this.muteBtn = container.querySelector('.live-photo-mute-btn');

        this.isPlaying = false;
        this.isMuted = true;
        this.isLocked = false; // 手动锁定播放状态

        this.hoverDelay = parseInt(container.dataset.hoverDelay) || 500;
        this.hoverTimer = null;

        // 懒加载视频
        this.videoLoaded = false;
        this.loadVideo();

        this.bindEvents();
    }

    loadVideo() {
        if (!this.video) return;
        const dataSrc = this.video.dataset.src;
        if (dataSrc && !this.video.src) {
            this.video.src = dataSrc;
            this.videoLoaded = true;
        }
    }

    bindEvents() {
        // 悬停播放
        this.container.addEventListener('mouseenter', () => {
            if (this.isLocked) return;
            this.hoverTimer = setTimeout(() => {
                this.play();
            }, this.hoverDelay);
        });

        this.container.addEventListener('mouseleave', () => {
            clearTimeout(this.hoverTimer);
            if (this.isLocked) return;
            this.pause();
        });

        // 移动端触摸
        this.container.addEventListener('touchstart', () => {
            if (this.isLocked) return;
            this.hoverTimer = setTimeout(() => {
                this.play();
            }, this.hoverDelay);
        }, { passive: true });

        // LIVE 按钮切换锁定
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.isLocked = !this.isLocked;
                if (this.isLocked) {
                    this.play();
                    this.toggleBtn.dataset.state = 'playing';
                    this.toggleBtn.setAttribute('aria-pressed', 'true');
                } else {
                    this.pause();
                    this.toggleBtn.dataset.state = 'static';
                    this.toggleBtn.setAttribute('aria-pressed', 'false');
                }
            });
        }

        // 静音按钮
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        // 视频事件
        if (this.video) {
            this.video.addEventListener('play', () => {
                this.isPlaying = true;
                this.container.classList.add('is-playing');
            });
            this.video.addEventListener('pause', () => {
                this.isPlaying = false;
                this.container.classList.remove('is-playing');
            });
        }
    }

    play() {
        if (!this.video || this.isPlaying) return;
        this.video.currentTime = 0;
        this.video.play().catch(() => {});
    }

    pause() {
        if (!this.video || !this.isPlaying) return;
        this.video.pause();
        this.video.currentTime = 0;
    }

    toggleMute() {
        if (!this.video) return;
        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;
        if (this.muteBtn) {
            this.muteBtn.dataset.muted = this.isMuted.toString();
            // 切换图标
            const mutedIcon = this.muteBtn.querySelector('.icon-muted');
            const unmutedIcon = this.muteBtn.querySelector('.icon-unmuted');
            if (mutedIcon) mutedIcon.style.display = this.isMuted ? 'block' : 'none';
            if (unmutedIcon) unmutedIcon.style.display = this.isMuted ? 'none' : 'block';
        }
    }
}

function initMotionPhotos() {
    const containers = document.querySelectorAll('.live-photo-container');
    containers.forEach(container => {
        if (!container.dataset.motionInit) {
            new MotionPhoto(container);
            container.dataset.motionInit = 'true';
        }
    });
}

/* ==========================================================================
   音乐播放器功能
   ========================================================================== */

class MusicPlayer {
    constructor(container, attachOnly) {
        this.container = container;
        this.audio = AudioManager.audio;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this._attachOnly = attachOnly;

        this.init();
    }

    init() {
        this.src = this.container.dataset.src;
        this.cover = this.container.dataset.cover;
        this.name = this.container.dataset.name;
        this.artist = this.container.dataset.artist;

        // 检查是否有播放列表
        const playlistEl = this.container.querySelector('.music-playlist');
        if (playlistEl) {
            try {
                this.playlist = JSON.parse(playlistEl.textContent);
                if (this.playlist.length > 0) {
                    this.src = this.playlist[0].src;
                    this.cover = this.playlist[0].cover;
                    this.name = this.playlist[0].name;
                    this.artist = this.playlist[0].artist;
                }
            } catch (e) {
                console.error('播放列表解析失败:', e);
            }
        } else if (this.src) {
            this.playlist = [{
                src: this.src,
                cover: this.cover,
                name: this.name,
                artist: this.artist
            }];
        }

        // 获取DOM元素
        this.coverImg = this.container.querySelector('.music-cover');
        this.nameEl = this.container.querySelector('.music-name');
        this.artistEl = this.container.querySelector('.music-artist');
        this.progressCurrent = this.container.querySelector('.music-progress-current');
        this.timeCurrent = this.container.querySelector('.music-time-current');
        this.timeTotal = this.container.querySelector('.music-time-total');
        this.progressBar = this.container.querySelector('.music-progress-bar');

        this.playBtns = [
            this.container.querySelector('.music-btn-play'),
            this.container.querySelector('.music-btn-play-main')
        ].filter(Boolean);

        this.prevBtn = this.container.querySelector('.music-btn-prev');
        this.nextBtn = this.container.querySelector('.music-btn-next');

        this.bindEvents();
        AudioManager.attach(this);

        if (this._attachOnly && AudioManager.isPlaying) {
            // 正在播放，只同步 UI
            this.syncUI();
        } else if (this.src) {
            this.loadTrack(this.src);
        }
    }

    syncUI() {
        this.isPlaying = true;
        this.container.classList.add('playing');
        this.updatePlayButton();
        if (this.audio.duration) {
            this.updateDuration();
            this.updateProgress();
        }
    }

    bindEvents() {
        this.playBtns.forEach(btn => {
            btn.addEventListener('click', () => this.togglePlay());
        });

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => {
                const rect = this.progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = percent * this.audio.duration;
            });
        }

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
    }

    loadTrack(src) {
        AudioManager.load(src);
    }

    togglePlay() {
        if (this.isPlaying) {
            AudioManager.pause();
        } else {
            AudioManager.play();
        }
    }

    prev() {
        if (this.playlist.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.updateTrack();
        this.play();
    }

    next() {
        if (this.playlist.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.updateTrack();
        this.play();
    }

    updateTrack() {
        const track = this.playlist[this.currentIndex];
        if (!track) return;

        this.src = track.src;
        this.cover = track.cover;
        this.name = track.name;
        this.artist = track.artist;

        if (this.coverImg) this.coverImg.src = this.cover;
        if (this.nameEl) this.nameEl.textContent = this.name;
        if (this.artistEl) this.artistEl.textContent = this.artist;

        this.loadTrack(this.src);
    }

    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            if (this.progressCurrent) this.progressCurrent.style.width = percent + '%';
            if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        if (this.timeTotal) this.timeTotal.textContent = this.formatTime(this.audio.duration);
    }

    onTrackEnd() {
        if (this.playlist.length > 1) {
            this.next();
        } else {
            this.isPlaying = false;
            this.container.classList.remove('playing');
            this.updatePlayButton();
        }
    }

    onPlay() {
        this.isPlaying = true;
        this.container.classList.add('playing');
        this.updatePlayButton();
    }

    onPause() {
        this.isPlaying = false;
        this.container.classList.remove('playing');
        this.updatePlayButton();
    }

    updatePlayButton() {
        const icon = this.isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
        this.playBtns.forEach(btn => {
            const i = btn.querySelector('i');
            if (i) i.className = icon;
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}

function initMusicPlayers() {
    const players = document.querySelectorAll('.music-player');
    players.forEach(player => {
        if (!player.dataset.musicInit) {
            new MusicPlayer(player);
            player.dataset.musicInit = 'true';
        }
    });
}

/* ==========================================================================
   精美 Live 动图卡片功能
   ========================================================================== */

class LivePhotoCard {
    constructor(container) {
        this.container = container;
        this.isPlaying = false;
        this.isMuted = true;

        this.init();
    }

    init() {
        this.src = this.container.dataset.src;
        this.videoSrc = this.container.dataset.video;

        this.video = this.container.querySelector('.live-card-video');
        this.playBtn = this.container.querySelector('.live-card-play-btn');
        this.volumeBtn = this.container.querySelector('.live-card-volume');
        this.loopBtn = this.container.querySelector('.live-card-loop');
        this.progressBar = this.container.querySelector('.live-card-progress-bar');

        this.volumeIcons = this.volumeBtn ? {
            up: this.volumeBtn.querySelector('.ri-volume-up-line'),
            mute: this.volumeBtn.querySelector('.ri-volume-mute-line')
        } : null;

        this.bindEvents();

        if (this.video) {
            this.video.muted = true;
        }
    }

    bindEvents() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }

        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.live-card-controls') || e.target.closest('.live-card-play-btn')) {
                return;
            }
            this.togglePlay();
        });

        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        if (this.loopBtn) {
            this.loopBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLoop();
            });
        }

        if (this.video) {
            this.video.addEventListener('timeupdate', () => this.updateProgress());
            this.video.addEventListener('ended', () => this.onVideoEnd());
            this.video.addEventListener('play', () => this.onPlay());
            this.video.addEventListener('pause', () => this.onPause());
        }
    }

    togglePlay() {
        if (!this.video) return;

        if (this.isPlaying) {
            this.video.pause();
        } else {
            this.video.currentTime = 0;
            this.video.play().catch(e => console.error('播放失败:', e));
        }
    }

    toggleMute() {
        if (!this.video) return;

        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;

        if (this.volumeIcons) {
            this.volumeIcons.up.style.display = this.isMuted ? 'none' : 'block';
            this.volumeIcons.mute.style.display = this.isMuted ? 'block' : 'none';
        }
    }

    toggleLoop() {
        if (!this.video) return;

        const isLoop = this.video.loop;
        this.video.loop = !isLoop;

        if (this.loopBtn) {
            this.loopBtn.dataset.loop = (!isLoop).toString();
            this.loopBtn.style.color = !isLoop ? 'var(--theme-color)' : 'white';
        }
    }

    updateProgress() {
        if (this.video && this.progressBar && this.video.duration) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.style.width = percent + '%';
        }
    }

    onVideoEnd() {
        this.isPlaying = false;
        this.container.classList.remove('playing');
    }

    onPlay() {
        this.isPlaying = true;
        this.container.classList.add('playing');
    }

    onPause() {
        this.isPlaying = false;
        this.container.classList.remove('playing');
    }
}

function initLivePhotoCards() {
    const cards = document.querySelectorAll('.live-card');
    cards.forEach(card => {
        if (!card.dataset.liveInit) {
            new LivePhotoCard(card);
            card.dataset.liveInit = 'true';
        }
    });
}
