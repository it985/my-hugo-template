/**
 * 音乐播放器功能
 * 支持单曲和播放列表模式
 */

class MusicPlayer {
    constructor(container) {
        this.container = container;
        this.audio = new Audio();
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isRotating = false;

        this.init();
    }

    init() {
        // 获取配置
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

        // 绑定事件
        this.bindEvents();

        // 加载音频
        if (this.src) {
            this.loadTrack(this.src);
        }
    }

    bindEvents() {
        // 播放按钮
        this.playBtns.forEach(btn => {
            btn.addEventListener('click', () => this.togglePlay());
        });

        // 上一首
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        // 下一首
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // 进度条点击
        if (this.progressBar) {
            this.progressBar.addEventListener('click', (e) => {
                const rect = this.progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = percent * this.audio.duration;
            });
        }

        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
    }

    loadTrack(src) {
        this.audio.src = src;
        this.audio.load();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(e => {
                console.error('播放失败:', e);
            });
        }
    }

    play() {
        this.audio.play().catch(e => {
            console.error('播放失败:', e);
        });
    }

    pause() {
        this.audio.pause();
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

        // 更新UI
        if (this.coverImg) {
            this.coverImg.src = this.cover;
        }
        if (this.nameEl) {
            this.nameEl.textContent = this.name;
        }
        if (this.artistEl) {
            this.artistEl.textContent = this.artist;
        }

        // 加载新音频
        this.loadTrack(this.src);
    }

    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            if (this.progressCurrent) {
                this.progressCurrent.style.width = percent + '%';
            }
            if (this.timeCurrent) {
                this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
            }
        }
    }

    updateDuration() {
        if (this.timeTotal) {
            this.timeTotal.textContent = this.formatTime(this.audio.duration);
        }
    }

    onTrackEnd() {
        // 自动播放下一首
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
        this.startRotation();
    }

    onPause() {
        this.isPlaying = false;
        this.container.classList.remove('playing');
        this.updatePlayButton();
        this.stopRotation();
    }

    updatePlayButton() {
        const icon = this.isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
        this.playBtns.forEach(btn => {
            const i = btn.querySelector('i');
            if (i) {
                i.className = icon;
            }
        });
    }

    startRotation() {
        if (this.isRotating) return;
        this.isRotating = true;
        // CSS animation handles rotation
    }

    stopRotation() {
        this.isRotating = false;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}

// 初始化所有音乐播放器
function initMusicPlayers() {
    const players = document.querySelectorAll('.music-player');
    players.forEach(player => {
        if (!player.dataset.musicInit) {
            new MusicPlayer(player);
            player.dataset.musicInit = 'true';
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initMusicPlayers);

// PJAX 支持
document.addEventListener('pjax:complete', initMusicPlayers);
