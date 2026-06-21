/**
 * 精美 Live 动图卡片功能
 */

class LivePhotoCard {
    constructor(container) {
        this.container = container;
        this.isPlaying = false;
        this.isMuted = true;

        this.init();
    }

    init() {
        // 获取配置
        this.src = this.container.dataset.src;
        this.videoSrc = this.container.dataset.video;

        // 获取DOM元素
        this.video = this.container.querySelector('.live-card-video');
        this.playBtn = this.container.querySelector('.live-card-play-btn');
        this.volumeBtn = this.container.querySelector('.live-card-volume');
        this.loopBtn = this.container.querySelector('.live-card-loop');
        this.progressBar = this.container.querySelector('.live-card-progress-bar');

        this.volumeIcons = this.volumeBtn ? {
            up: this.volumeBtn.querySelector('.ri-volume-up-line'),
            mute: this.volumeBtn.querySelector('.ri-volume-mute-line')
        } : null;

        // 绑定事件
        this.bindEvents();

        // 设置初始状态
        if (this.video) {
            this.video.muted = true;
        }
    }

    bindEvents() {
        // 播放按钮
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }

        // 容器点击（播放/暂停）
        this.container.addEventListener('click', (e) => {
            // 排除控制按钮的点击
            if (e.target.closest('.live-card-controls') || e.target.closest('.live-card-play-btn')) {
                return;
            }
            this.togglePlay();
        });

        // 音量按钮
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        // 循环按钮
        if (this.loopBtn) {
            this.loopBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLoop();
            });
        }

        // 视频事件
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
            this.video.play().catch(e => {
                console.error('播放失败:', e);
            });
        }
    }

    toggleMute() {
        if (!this.video) return;

        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;

        if (this.volumeIcons) {
            if (this.isMuted) {
                this.volumeIcons.up.style.display = 'none';
                this.volumeIcons.mute.style.display = 'block';
            } else {
                this.volumeIcons.up.style.display = 'block';
                this.volumeIcons.mute.style.display = 'none';
            }
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

// 初始化所有 Live 动图卡片
function initLivePhotoCards() {
    const cards = document.querySelectorAll('.live-card');
    cards.forEach(card => {
        if (!card.dataset.liveInit) {
            new LivePhotoCard(card);
            card.dataset.liveInit = 'true';
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initLivePhotoCards);

// PJAX 支持
document.addEventListener('pjax:complete', initLivePhotoCards);
