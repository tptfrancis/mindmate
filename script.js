// Global variables
let currentMood = null;
let moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
let currentTopic = 'general';

// AI Chatbot responses (simulated) - Traditional Chinese with Hong Kong cultural elements
const aiResponses = {
    greetings: [
        "你好！我在這裡支援你。你今日感覺點樣？",
        "你好！我係心伴，你嘅AI伙伴。有咩煩惱？",
        "歡迎！我在這裡聆聽同幫助。今日我可以點樣支援你？"
    ],
    anxiety: [
        "我明白焦慮可以好困擾。我哋一齊深呼吸。試下4-7-8呼吸法：吸氣4秒，閉氣7秒，呼氣8秒。",
        "焦慮係自然反應，但我哋可以一齊面對。邊啲想法令你覺得焦慮？",
        "記住，你唔係一個人面對。好多學生都會經歷焦慮。我哋一步一步嚟。"
    ],
    stress: [
        "壓力係大學生常見嘅問題。我哋將你嘅壓力來源分解成細啲、易管理嘅任務。",
        "我聽到你覺得有壓力。有時退一步，重新排優先次序會有幫助。你最擔心嘅係咩？",
        "壓力可以好大，但記住要休息。你最近有試過咩放鬆技巧？"
    ],
    general: [
        "我在這裡聆聽。你可以講多啲你嘅經歷嗎？",
        "聽起嚟好有挑戰性。你咁樣感覺咗幾耐？",
        "我明白。有呢啲感覺係正常嘅。咩可以令你而家感覺好啲？",
        "多謝你同我分享。你主動尋求支援係好勇敢嘅一步。",
        "我在這裡支援你。有咩小事可以令你感覺好啲？"
    ],
    encouragement: [
        "你主動尋求支援做得好好，呢個需要勇氣。",
        "記住，有時唔好都係正常嘅。你願意傾訴已經係照顧自己。",
        "我相信你有能力面對呢個問題。你比你想像中更堅強。",
        "每小步向前都重要。你正在進步，即使感覺唔到。"
    ],
    hk_specific: [
        "香港生活節奏好快，有壓力係正常嘅。我哋可以搵啲適合香港嘅放鬆方法。",
        "考試季節係好辛苦嘅時候。好多香港學生都經歷緊同樣嘅壓力。",
        "香港嘅天氣同環境都會影響心情。記住要照顧好自己。",
        "香港有好多好地方可以放鬆，比如海濱長廊或者公園。"
    ]
};

const moodLabels = {
    excellent: '非常好',
    good: '幾好',
    okay: '一般',
    bad: '唔太好',
    terrible: '好差'
};

const moodTagClasses = {
    excellent: 'mood-tag-excellent',
    good: 'mood-tag-good',
    okay: 'mood-tag-okay',
    bad: 'mood-tag-bad',
    terrible: 'mood-tag-terrible'
};

const moodValueMap = {
    terrible: 1,
    bad: 2,
    okay: 3,
    good: 4,
    excellent: 5
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupLoginForm();
});

function initializeApp() {
    setupNavigation();
    setupChatbot();
    setupMoodTracker();
    setupCommunity();
}

function setupEventListeners() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });

    const loginTriggers = document.querySelectorAll('.login-trigger');
    loginTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            openLoginModal();
        });
    });
}

function setupLoginForm() {
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        if (button.dataset.listenerAttached === 'true') {
            return;
        }
        const wrapper = button.closest('.input-wrapper');
        if (!wrapper) {
            return;
        }
        const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]');
        button.addEventListener('click', () => {
            if (!passwordInput) {
                return;
            }
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            button.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
        button.dataset.listenerAttached = 'true';
    });

    const loginCloseButtons = document.querySelectorAll('.login-close');
    loginCloseButtons.forEach(button => {
        if (button.dataset.listenerAttached === 'true') {
            return;
        }
        button.addEventListener('click', closeLoginModal);
        button.dataset.listenerAttached = 'true';
    });
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) {
        return;
    }
    modal.classList.add('visible');
    document.body.classList.add('modal-open');
    setupLoginForm();
    const emailInput = modal.querySelector('#login-email');
    if (emailInput) {
        setTimeout(() => emailInput.focus(), 120);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) {
        return;
    }
    modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
}

// Navigation functions
function setupNavigation() {
    const navLinks = document.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) {
                return;
            }
            e.preventDefault();
            const targetId = href.substring(1);
            scrollToSection(targetId);
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Chatbot functions
function setupChatbot() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer && messagesContainer.children.length === 0) {
        addAIMessage(getRandomResponse('greetings'));
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        addUserMessage(message);
        input.value = '';

        setTimeout(() => {
            const response = generateAIResponse(message);
            addAIMessage(response);
        }, 1000);
    }
}

function sendQuickMessage(message) {
    const input = document.getElementById('chat-input');
    input.value = message;
    sendMessage();
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const safeMessage = escapeHTML(message);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${safeMessage}</p>
            <span class="message-time">剛剛</span>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addAIMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const safeMessage = escapeHTML(message);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${safeMessage}</p>
            <span class="message-time">剛剛</span>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();

    if (message.includes('焦慮') || message.includes('緊張') || message.includes('擔心') || message.includes('驚')) {
        return getRandomResponse('anxiety');
    } else if (message.includes('壓力') || message.includes('辛苦') || message.includes('累') || message.includes('考試')) {
        return getRandomResponse('stress');
    } else if (message.includes('多謝') || message.includes('謝謝') || message.includes('感謝')) {
        return getRandomResponse('encouragement');
    } else if (message.includes('香港') || message.includes('hk') || message.includes('天氣') || message.includes('生活')) {
        return getRandomResponse('hk_specific');
    } else {
        return getRandomResponse('general');
    }
}

function getRandomResponse(category) {
    const responses = aiResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Mood Tracker functions
function setupMoodTracker() {
    updateMoodStats();
    loadMoodChart();
    renderMoodHistory();
}

function selectMood(mood) {
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`[data-mood="${mood}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        currentMood = mood;
    }
}

function saveMoodEntry(options = {}) {
    const { showNotification: shouldNotify = true, resetForm = true } = options;

    if (!currentMood) {
        alert('請先選擇一個心情。');
        return null;
    }

    const notesField = document.getElementById('mood-notes');
    if (!notesField) {
        return null;
    }

    const notes = notesField.value.trim();
    const timestamp = Date.now();
    const entry = {
        mood: currentMood,
        notes,
        date: new Date(timestamp).toISOString(),
        timestamp
    };

    moodEntries.push(entry);
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));

    updateMoodStats();
    loadMoodChart();
    renderMoodHistory();

    if (resetForm) {
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });
        notesField.value = '';
        currentMood = null;
    }

    if (shouldNotify) {
        showNotification('心情記錄已成功儲存！', 'success');
    }

    return entry;
}

function shareMoodToCommunity() {
    const notesField = document.getElementById('mood-notes');
    if (!notesField) {
        return;
    }

    const noteContent = notesField.value.trim();
    if (!noteContent) {
        alert('請先輸入備註/小日記內容。');
        return;
    }

    const entry = saveMoodEntry({ showNotification: false, resetForm: false });
    if (!entry) {
        return;
    }

    const shareContent = buildDiaryShareContent(entry);
    createCommunityPost(shareContent);
    showNotification('日記已儲存並分享至匿名社群！', 'success');

    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    notesField.value = '';
    currentMood = null;
}

function updateMoodStats() {
    const totalEntries = moodEntries.length;
    const totalEntriesElement = document.getElementById('total-entries');
    const weeklyAverageElement = document.getElementById('weekly-average');
    const currentStreakElement = document.getElementById('current-streak');

    if (!totalEntriesElement || !weeklyAverageElement || !currentStreakElement) {
        return;
    }

    totalEntriesElement.textContent = totalEntries;

    if (totalEntries === 0) {
        weeklyAverageElement.textContent = '-';
        currentStreakElement.textContent = '-';
        return;
    }

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentEntries = moodEntries.filter(entry => entry.timestamp > sevenDaysAgo && moodValueMap[entry.mood]);

    if (recentEntries.length > 0) {
        const average = recentEntries.reduce((sum, entry) => sum + moodValueMap[entry.mood], 0) / recentEntries.length;
        weeklyAverageElement.textContent = average.toFixed(1);
    } else {
         weeklyAverageElement.textContent = '-';
    }

    let streak = 0;
    const sortedEntries = [...moodEntries].sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date().toDateString();

    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.timestamp).toDateString();
        if (entryDate === today || streak > 0) {
            streak++;
        } else {
            break;
        }
    }

    currentStreakElement.textContent = streak;
}

function loadMoodChart() {
    const chartContainer = document.getElementById('mood-chart');

    if (!chartContainer) {
        return;
    }

    if (moodEntries.length === 0) {
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-line"></i>
                <p>開始記錄心情以查看趨勢</p>
            </div>
        `;
        return;
    }

    const recentEntries = moodEntries.slice(-14);

    let chartHTML = '<div class="mood-chart-bars">';

    recentEntries.forEach(entry => {
        const value = moodValueMap[entry.mood] || 0;
        const height = (value / 5) * 100;
        const date = new Date(entry.timestamp).toLocaleDateString('zh-Hant-HK', { month: 'short', day: 'numeric' });

        chartHTML += `
            <div class="chart-bar">
                <div class="bar" style="height: ${height}%"></div>
                <span class="bar-label">${date}</span>
            </div>
        `;
    });

    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

function renderMoodHistory() {
    const historyContainer = document.getElementById('mood-history');

    if (!historyContainer) {
        return;
    }

    if (moodEntries.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">暫時未有心情日記，儲存第一則記錄吧！</p>';
        return;
    }

    const sortedEntries = [...moodEntries].sort((a, b) => b.timestamp - a.timestamp);
    const historyHTML = sortedEntries.map(entry => {
        const formattedDate = formatDiaryDate(entry.timestamp);
        const moodLabel = getMoodLabel(entry.mood);
        const moodClass = getMoodTagClass(entry.mood);
        const noteContent = entry.notes ? escapeHTML(entry.notes).replace(/\n/g, '<br>') : '<span class="history-note-empty">（沒有備註）</span>';

        return `
            <div class="history-entry" data-entry-id="${entry.timestamp}">
                <div class="history-header">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-mood ${moodClass}">${moodLabel}</span>
                </div>
                <p class="history-note">${noteContent}</p>
                <div class="history-actions">
                    <button class="btn btn-outline btn-sm history-share-btn" onclick="shareHistoryEntry(${entry.timestamp})">
                        <i class="fas fa-share-nodes"></i>
                        分享至社群
                    </button>
                </div>
            </div>
        `;
    }).join('');

    historyContainer.innerHTML = historyHTML;
}

function shareHistoryEntry(entryId) {
    const entry = moodEntries.find(item => item.timestamp === entryId);
    if (!entry) {
        showNotification('未能找到心情日記。', 'error');
        return;
    }

    const shareContent = buildDiaryShareContent(entry);
    createCommunityPost(shareContent);
    showNotification('日記已分享至匿名社群！', 'success');
}

// Community functions
function setupCommunity() {
    loadCommunityPosts();
    syncTopicControls(currentTopic);
}

function switchTopic(topic) {
    currentTopic = topic;

    const topicButtons = document.querySelectorAll('.topic-button');
    topicButtons.forEach(item => item.classList.remove('active'));
    const activeButton = document.querySelector(`.topic-button[data-topic="${topic}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const topicChips = document.querySelectorAll('.topic-chip');
    topicChips.forEach(chip => chip.classList.remove('active'));
    const activeChip = document.querySelector(`.topic-chip[data-topic="${topic}"]`);
    if (activeChip) {
        activeChip.classList.add('active');
    }

    syncTopicControls(topic);

    document.getElementById('current-topic').textContent = getTopicTitle(topic);

    loadCommunityPosts();
}

function syncTopicControls(topic) {
    const topicSelect = document.getElementById('topic-select');
    if (topicSelect && topicSelect.value !== topic) {
        topicSelect.value = topic;
    }

    const topicButtons = document.querySelectorAll('.topic-button');
    topicButtons.forEach(btn => {
        if (btn.dataset.topic === topic) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const topicChips = document.querySelectorAll('.topic-chip');
    topicChips.forEach(chip => {
        if (chip.dataset.topic === topic) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

function onTopicSelectChange(topic) {
    if (topic === currentTopic) {
        return;
    }
    switchTopic(topic);
}

function getTopicTitle(topic) {
    const topicTitles = {
        general: '一般討論',
        academic: '學業壓力',
        relationships: '人際關係',
        selfcare: '自我照顧貼士',
        hklife: '香港生活'
    };
    return topicTitles[topic] || '一般討論';
}

function loadCommunityPosts() {
    console.log(`Loading posts for topic: ${currentTopic}`);
}

function showNewPostModal() {
    document.getElementById('new-post-modal').style.display = 'block';
}

function closeNewPostModal() {
    document.getElementById('new-post-modal').style.display = 'none';
    document.getElementById('new-post-content').value = '';
}

function submitNewPost() {
    const contentField = document.getElementById('new-post-content');
    const content = contentField.value.trim();

    if (!content) {
        alert('請輸入貼文內容。');
        return;
    }

    createCommunityPost(content);
    closeNewPostModal();
    showNotification('貼文已成功發表！', 'success');
}

function createCommunityPost(rawContent, timeLabel = '剛剛') {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
        return;
    }

    const sanitizedContent = escapeHTML(rawContent).replace(/\n/g, '<br>');
    const newPost = document.createElement('div');
    newPost.className = 'post';
    newPost.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <i class="fas fa-user-circle"></i>
                <span>匿名用戶</span>
            </div>
            <span class="post-time">${timeLabel}</span>
        </div>
        <div class="post-content">
            <p>${sanitizedContent}</p>
        </div>
        <div class="post-actions">
            <button class="action-btn" onclick="likePost(this)">
                <i class="far fa-heart"></i>
                <span>0</span>
            </button>
            <button class="action-btn" onclick="showComments(this)">
                <i class="far fa-comment"></i>
                <span>0</span>
            </button>
        </div>
    `;

    postsContainer.insertBefore(newPost, postsContainer.firstChild);
}

function likePost(button) {
    const icon = button.querySelector('i');
    const count = button.querySelector('span');

    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        icon.className = 'far fa-heart';
        count.textContent = parseInt(count.textContent, 10) - 1;
    } else {
        button.classList.add('liked');
        icon.className = 'fas fa-heart';
        count.textContent = parseInt(count.textContent, 10) + 1;
    }
}

function showComments(button) {
    showNotification('評論功能即將推出！', 'info');
}

// Resource functions
function playMeditation() {
    showNotification('開始冥想練習...', 'info');
}

function startBreathingExercise() {
    showNotification('開始呼吸練習...', 'info');
}

function showSleepTips() {
    const tips = [
        '保持規律嘅睡眠時間',
        '建立放鬆嘅睡前習慣',
        '睡前1小時避免使用電子產品',
        '保持房間涼爽同黑暗',
        '下午後限制咖啡因攝取',
        '定期運動但避免睡前運動'
    ];

    alert('睡眠衛生貼士：\n\n' + tips.join('\n'));
}

function showWalkingRoutes() {
    const routes = [
        '維多利亞港海濱長廊',
        '香港公園',
        '山頂環迴步行徑',
        '南丫島家樂徑',
        '大埔海濱公園',
        '西九文化區'
    ];

    alert('香港推薦散步路線：\n\n' + routes.join('\n'));
}

function showCulturalEvents() {
    const events = [
        '香港藝術節',
        '香港國際電影節',
        '香港書展',
        '博物館免費日',
        '本地音樂會',
        '文化中心表演'
    ];

    alert('香港文化活動：\n\n' + events.join('\n'));
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function escapeHTML(str) {
    return str.replace(/[&<>\"']/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return charsToReplace[tag] || tag;
    });
}

function getMoodLabel(mood) {
    return moodLabels[mood] || '心情分享';
}

function getMoodTagClass(mood) {
    return moodTagClasses[mood] || 'mood-tag-okay';
}

function formatDiaryDate(timestamp) {
    return new Date(timestamp).toLocaleString('zh-Hant-HK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function buildDiaryShareContent(entry) {
    const date = formatDiaryDate(entry.timestamp);
    const moodLabel = getMoodLabel(entry.mood);
    const note = entry.notes ? entry.notes : '（沒有備註）';
    return `#心情日記\n日期：${date}\n心情：${moodLabel}\n${note}`;
}

// Inject chart styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .mood-chart-bars {
        display: flex;
        align-items: end;
        height: 100%;
        gap: 8px;
        padding: 20px;
    }

    .chart-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        height: 100%;
    }

    .bar {
        width: 100%;
        background: linear-gradient(to top, #6366f1, #8b5cf6);
        border-radius: 4px 4px 0 0;
        min-height: 20px;
        transition: all 0.3s ease;
    }

    .bar-label {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 8px;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const newPostModal = document.getElementById('new-post-modal');
    if (event.target === newPostModal) {
        closeNewPostModal();
    }

    const loginModal = document.getElementById('login-modal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    if (window.innerWidth > 768 && navMenu) {
        navMenu.classList.remove('active');
    }
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Close modals on ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeNewPostModal();
        closeLoginModal();
    }
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .resource-category, .post');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});
