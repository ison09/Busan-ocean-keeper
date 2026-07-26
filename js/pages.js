/* ==========================================
   페이지 관리
   ========================================== */

class PageManager {
    constructor() {
        this.currentPage = 'home';
    }

    showPage(pageName) {
        // 현재 페이지 숨기기
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 네비게이션 버튼 업데이트
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 새 페이지 표시
        const pageElement = document.getElementById(pageName + '-page');
        if (pageElement) {
            pageElement.classList.add('active');
            document.querySelector(`.nav-btn[data-page="${pageName}"]`).classList.add('active');
            this.currentPage = pageName;
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

const pageManager = new PageManager();

// 페이지 렌더링 함수들

async function renderHomePage() {
    const user = storage.getUser();
    const reports = storage.getReports();
    const stats = calculateStats(reports);
    const todayCount = getTodayReportsCount(reports);

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('current-points').textContent = user.points + 'P';
    
    // 순위 계산
    const ranking = await api.getRanking('user');
    const myRank = ranking.findIndex(r => r.userId === user.name);
    document.getElementById('my-rank').textContent = (myRank + 1) + '위';

    document.getElementById('today-reports').textContent = todayCount + '건';
    document.getElementById('total-reports').textContent = stats.total + '건';
    document.getElementById('completed-reports').textContent = stats.completed + '건';
    document.getElementById('pending-reports').textContent = stats.pending + '건';

    // 최근 활동
    const activities = storage.getActivities().slice(0, 3);
    const recentList = document.getElementById('recent-list');
    if (activities.length === 0) {
        recentList.innerHTML = '<p class="empty-message">최근 활동이 없습니다.</p>';
    } else {
        recentList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span>${activity.icon}</span> ${activity.message}
                <br>
                <small style="color: #999;">${getTimeDiff(activity.timestamp)}</small>
            </div>
        `).join('');
    }
}

async function renderMapPage() {
    const reports = storage.getReports();
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const filteredReports = getReportsByStatus(reports, filter);

    // 마커 그리기
    const markersGroup = document.getElementById('markers-group');
    markersGroup.innerHTML = '';

    filteredReports.forEach((report, index) => {
        const x = 100 + (Math.random() * 200);
        const y = 100 + (Math.random() * 300);
        
        let color = '#F59E0B';
        if (report.status === 'completed') color = '#10B981';
        if (report.status === 'in-progress') color = '#3B82F6';

        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', '8');
        marker.setAttribute('fill', color);
        marker.setAttribute('stroke', '#0066CC');
        marker.setAttribute('stroke-width', '2');
        marker.setAttribute('class', 'marker-point');
        marker.style.cursor = 'pointer';
        
        markersGroup.appendChild(marker);
    });

    // 신고 목록
    const reportsList = document.getElementById('map-reports');
    if (filteredReports.length === 0) {
        reportsList.innerHTML = '<p class="empty-message">신고된 쓰레기가 없습니다.</p>';
    } else {
        reportsList.innerHTML = filteredReports.map(report => `
            <div class="report-item">
                <div class="report-item-header">
                    <span class="report-item-location">${report.location}</span>
                    <span class="report-item-status ${report.status}">${getStatusName(report.status)}</span>
                </div>
                <div class="report-item-info">
                    <p style="margin: 4px 0;">📌 ${getRegionName(report.region)} | 🗑️ ${getTrashTypeName(report.type)}</p>
                    <p style="margin: 4px 0;">📊 ${getAmountName(report.amount)}</p>
                    <small style="color: #999;">${formatDate(report.createdAt)}</small>
                </div>
            </div>
        `).join('');
    }
}

async function renderRankingPage() {
    const regionRanking = await api.getRanking('region');
    const userRanking = await api.getRanking('user');
    const user = storage.getUser();

    // 지역 랭킹
    const regionList = document.getElementById('region-ranking-list');
    if (regionRanking.length === 0) {
        regionList.innerHTML = '<p class="empty-message">순위 데이터가 없습니다.</p>';
    } else {
        regionList.innerHTML = regionRanking.map((item, idx) => {
            let medal = '🥇';
            if (idx === 1) medal = '🥈';
            if (idx === 2) medal = '🥉';
            
            return `
                <div class="ranking-item">
                    <span class="ranking-rank rank-${idx + 1}">${medal} ${item.rank}</span>
                    <span class="ranking-name">${item.regionName}</span>
                    <span class="ranking-points">${item.points}P</span>
                </div>
            `;
        }).join('');
    }

    // 사용자 랭킹
    const userList = document.getElementById('user-ranking-list');
    if (userRanking.length === 0) {
        userList.innerHTML = '<p class="empty-message">순위 데이터가 없습니다.</p>';
    } else {
        userList.innerHTML = userRanking.map((item, idx) => {
            let medal = '🥇';
            if (idx === 1) medal = '🥈';
            if (idx === 2) medal = '🥉';
            
            return `
                <div class="ranking-item">
                    <span class="ranking-rank rank-${idx + 1}">${medal} ${item.rank}</span>
                    <span class="ranking-name">${item.userName}</span>
                    <span class="ranking-points">${item.points}P</span>
                </div>
            `;
        }).join('');
    }

    // 내 순위
    const myRegionRank = regionRanking.findIndex(r => r.region === user.region);
    const myUserRank = userRanking.findIndex(r => r.userName === user.name);
    
    document.getElementById('my-region-rank').textContent = (myRegionRank + 1) + '위';
    document.getElementById('my-overall-rank').textContent = (myUserRank + 1) + '위';
    document.getElementById('my-total-points').textContent = user.points + 'P';
}

async function renderMyPage() {
    const user = storage.getUser();
    const reports = storage.getReports();
    const userReports = getUserReports(reports, user.name);
    const stats = calculateStats(userReports);
    const userRanking = await api.getRanking('user');
    const myRank = userRanking.findIndex(r => r.userName === user.name);

    // 프로필
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-region').textContent = getRegionName(user.region) || '지역 미설정';

    // 포인트
    document.getElementById('mypage-points').textContent = user.points;
    document.getElementById('points-from-report').textContent = '+' + user.reportsFromPoints + 'P';
    document.getElementById('points-from-collection').textContent = '+' + user.collectionFromPoints + 'P';

    // 통계
    document.getElementById('total-my-reports').textContent = stats.total + '건';
    document.getElementById('completed-my-reports').textContent = stats.completed + '건';
    document.getElementById('pending-my-reports').textContent = stats.pending + '건';
    document.getElementById('mypage-rank').textContent = (myRank + 1) + '위';

    // 내 신고 목록
    const myReportsList = document.getElementById('my-reports-list');
    if (userReports.length === 0) {
        myReportsList.innerHTML = '<p class="empty-message">신고한 쓰레기가 없습니다.</p>';
    } else {
        myReportsList.innerHTML = userReports.map(report => `
            <div class="report-item">
                <div class="report-item-header">
                    <span class="report-item-location">${report.location}</span>
                    <span class="report-item-status ${report.status}">${getStatusName(report.status)}</span>
                </div>
                <div class="report-item-info">
                    <p style="margin: 4px 0;">🗑️ ${getTrashTypeName(report.type)} | 📊 ${getAmountName(report.amount)}</p>
                    <small style="color: #999;">${formatDate(report.createdAt)}</small>
                </div>
            </div>
        `).join('');
    }
}

// 초기 데이터 생성 (테스트용)
function generateMockData() {
    const user = storage.getUser();
    if (!user.name || user.name === '익명의 시민') {
        const mockUser = {
            name: '부산시민',
            region: 'haeundae',
            points: 450,
            totalReports: 5,
            completedReports: 3,
            reportsFromPoints: 250,
            collectionFromPoints: 200,
            userId: 'user-1'
        };
        storage.setUser(mockUser);
    }

    const reports = storage.getReports();
    if (reports.length === 0) {
        const mockReports = [
            {
                userId: 'user-1',
                userName: '부산시민',
                region: 'haeundae',
                location: '해운대 해변 주차장',
                type: 'plastic',
                amount: 'medium',
                status: 'completed',
                photo: 'mock-photo-1',
                memo: '플라스틱 봉투들이 많이 있습니다'
            },
            {
                userId: 'user-2',
                userName: '바다지킴이',
                region: 'suyeong',
                location: '수영해수욕장',
                type: 'net',
                amount: 'large',
                status: 'in-progress',
                photo: 'mock-photo-2',
                memo: '어망이 엉켜있습니다'
            },
            {
                userId: 'user-1',
                userName: '부산시민',
                region: 'nam',
                location: '남포동 항구',
                type: 'wood',
                amount: 'small',
                status: 'pending',
                photo: 'mock-photo-3',
                memo: '목재 조각들이 떠다닙니다'
            }
        ];
        
        mockReports.forEach(report => {
            storage.addReport(report);
        });
    }
}