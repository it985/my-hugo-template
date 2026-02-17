let artalkInstances = [];

document.addEventListener("DOMContentLoaded", function() {
    initMoments();
    initArtalk();
    initLightbox();
    initMenu();
    initTheme();
    initThemeToggle();
});

// 页面跳转前，先把 Artalk 评论实例给销毁掉，省得占内存
document.addEventListener("pjax:send", function() {
    artalkInstances.forEach(inst => {
        if (inst && typeof inst.destroy === 'function') {
            inst.destroy();
        }
    });
    artalkInstances = [];
});

// 页面加载完了（包括 PJAX 跳完后），重新初始化一波
document.addEventListener("pjax:complete", function() {
    initMoments();
    initArtalk();
    initLightbox();
    initMenu();
    initThemeToggle();
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

/* ==========================================================================
   主题管理（深色/浅色模式）
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 看看本地存没存，没存就看系统是不是深色的
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
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
                   mirror: 'https://cravatar.cn/avatar/'
                }
            };

            // 首页列表稍微改改配置
            if (isFeed) {
                // 首页隐藏编辑器什么的
            } else {
                // 详情页保持默认
            }

            const artalk = new ArtalkConstructor(config);

            // 列表加载完后，我们要把它改成微信那种样式
            artalk.on('list-loaded', (comments) => {
                if (isFeed) {
                    // 首页列表用我们自定义的渲染逻辑
                    let dataList = [];
                    if (Array.isArray(comments)) {
                        dataList = comments;
                    } else if (comments && Array.isArray(comments.data)) {
                        dataList = comments.data;
                    }
                    
                    renderWeChatFeed(artalk, el, dataList);
                } else {
                    // 详情页就稍微修饰一下 DOM 就行
                    processWeChatStyle(el, false);
                }
            });

            artalkInstances.push(artalk);
            el.dataset.artalkInit = "true";
            
            // 绑定点赞按钮（只在首页列表有）
            if (isFeed) {
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
            }

        } catch (e) {
            console.error('Artalk 初始化失败了：', e);
        }
    });
}

/**
 * 处理点赞动作
 * 其实就是发条内容带 [LIKE] 的评论，咱们后面再把它渲染成爱心
 */
function handleLikeAction(artalkInstance) {
    // 看看用户是谁，没名字就随机分配一个“访客XXX”
    let user = artalkInstance.ctx.get('user').getData();
    let currentNick = user.nick;
    let currentEmail = user.email;

    if (!currentNick) {
        const randomNum = Math.floor(Math.random() * 10000) + 1;
        currentNick = `访客${randomNum}`;
        currentEmail = `visitor${randomNum}@example.com`; // 瞎编个邮箱
        
        try {
            artalkInstance.ctx.get('user').update({
                nick: currentNick,
                email: currentEmail
            });
        } catch (e) { console.warn('更新用户信息失败了', e); }
    }

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

        // 随机来点点赞文案，显得有生气
        const randomPhrases = [
            '很棒的文章！', 'Get！', '不错不错', '支持一下', '写得很好', 'Mark', '顶一下', 'Interesting', 'Cool', '👍'
        ];
        const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        const likeContent = `👍 已点赞 ${randomPhrase} <span style="display:none">[LIKE]</span>`;

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
    const randomPhrases = ['很棒的文章！', 'Get！', '不错不错', '支持一下', '写得很好', 'Mark', '顶一下', 'Interesting', 'Cool', '👍'];
    const randomPhrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
    const likeContent = `👍 已点赞 ${randomPhrase} <span style="display:none">[LIKE]</span>`;

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

    // 4. 渲染“赞”那一部分
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

    if (likeNicks.length > 0) {
        likesArea.style.display = 'flex'; 
        likesListSpan.textContent = likeNicks.join(', ');

        // 没评论的话就把底边框去了，好看点
        if (normalComments.length === 0) {
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

            // Construct HTML
            
            // Nickname
            const nickSpan = document.createElement('span');
            nickSpan.className = 'wechat-nick';
            nickSpan.textContent = c.nick;
            itemDiv.appendChild(nickSpan);

            // Reply Logic
            if (replyTargetNick) {
                const replyText = document.createTextNode('回复');
                const targetSpan = document.createElement('span');
                targetSpan.className = 'wechat-nick';
                targetSpan.textContent = replyTargetNick;
                
                itemDiv.appendChild(replyText);
                itemDiv.appendChild(targetSpan);
            }

            // Colon (Always present before content)
            const colonSpan = document.createElement('span');
            colonSpan.className = 'wechat-colon';
            colonSpan.textContent = ' : ';
            itemDiv.appendChild(colonSpan);

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
            
            itemDiv.appendChild(contentSpan);

            // Time (WeChat style: small gray text on right)
            if (c.date) {
                const timeSpan = document.createElement('span');
                timeSpan.className = 'wechat-time';
                timeSpan.textContent = formatWeChatTime(c.date);
                itemDiv.appendChild(timeSpan);
            }
            
            listUl.appendChild(itemDiv);
        });

        customContainer.appendChild(listUl);
        hasComments = true;
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

    // Wait for DOM to be ready (Artalk renders async)
    // We use a small timeout or assume this is called after list-loaded
    
    const items = container.querySelectorAll('.atk-item');
    
    items.forEach(item => {
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
        }
    });
    
    // Also, we might want to change the "No Comments" text if empty
    const list = container.querySelector('.atk-list');
    if (list && list.children.length === 0) {
        // Artalk handles empty state, but if we hid everything, we might need to show something?
        // Usually Artalk shows "No comments" if data is empty. 
        // If data had only likes, Artalk thinks there are comments, but we hid them.
        // We should check visible items.
    }
}

// Old function replaced by processWeChatStyle
// function formatArtalkReplies(container, isFeed) { ... }

function initMoments() {
    // 1. Handle Text Expand/Collapse
    const posts = document.querySelectorAll('.moment-card');
    
    posts.forEach(card => {
        const textWrapper = card.querySelector('.moment-text-wrapper');
        if (!textWrapper) return;

        const textDiv = textWrapper.querySelector('.moment-text');
        const toggleBtn = textWrapper.querySelector('.text-toggle');

        if (textDiv && toggleBtn) {
            // Reset state for re-init
            textDiv.classList.add('is-collapsed');
            toggleBtn.style.display = 'none';
            toggleBtn.innerText = '全文';

            // Check overflow after a small delay to ensure rendering
            setTimeout(() => {
                const isOverflowing = textDiv.scrollHeight > textDiv.clientHeight;
                if (isOverflowing) {
                    toggleBtn.style.display = 'inline-block';
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