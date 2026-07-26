/* ==========================================
   메인 애플리케이션
   ========================================== */

let currentUser = null;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 테스트 데이터 생성
    generateMockData();
    
    // 사용자 정보 로드
    currentUser = storage.getUser();
    
    // 네비게이션 이벤트 리스너
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pageName = this.dataset.page;
            pageManager.showPage(pageName);
            
            // 페이지별 렌더링
            if (pageName === 'home') {
                renderHomePage();
            } else if (pageName === 'map') {
                renderMapPage();
            } else if (pageName === 'ranking') {
                renderRankingPage();
            } else if (pageName === 'mypage') {
                renderMyPage();
            }
        });
    });

    // 신고 폼 이벤트
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }

    // 사진 업로드
    const photoInput = document.getElementById('report-photo');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }

    // 필터 버튼
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderMapPage();
        });
    });

    // 랭킹 탭
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ranking-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabName + '-ranking').classList.add('active');
        });
    });

    // 프로필 수정 버튼
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', showProfileModal);
    }

    // 프로필 폼
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // 모달 닫기
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideProfileModal);
    }

    // 데이터 초기화 버튼
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                storage.resetAllData();
                location.reload();
            }
        });
    }

    // 초기 페이지 표시
    pageManager.showPage('home');
    renderHomePage();
});

// 신고 폼 제출
async function handleReportSubmit(e) {
    e.preventDefault();

    const reportData = {
        userId: currentUser.name,
        userName: currentUser.name,
        region: document.getElementById('report-region').value,
        location: document.getElementById('report-location').value,
        type: document.getElementById('report-type').value,
        amount: document.getElementById('report-amount').value,
        memo: document.getElementById('report-memo').value,
        photo: document.getElementById('report-photo').value
    };

    try {
        const report = await api.submitReport(reportData);
        
        // 포인트 업데이트
        currentUser.points += 50;
        currentUser.totalReports += 1;
        currentUser.reportsFromPoints += 50;
        storage.setUser(currentUser);

        alert('쓰레기 신고가 완료되었습니다! +50P 획득');
        
        // 폼 초기화
        document.getElementById('report-form').reset();
        document.getElementById('photo-preview').innerHTML = '<p>📷 사진을 선택하세요</p>';
        
        // 지도 페이지로 이동
        pageManager.showPage('map');
        renderMapPage();
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('신고 중 오류가 발생했습니다.');
    }
}

// 사진 업로드
async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <p>✅ 사진이 선택되었습니다</p>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// 프로필 모달 표시
function showProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.classList.add('show');
    
    // 현재 정보 입력
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-region').value = currentUser.region;
}

// 프로필 모달 숨기기
function hideProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('show');
}

// 프로필 업데이트
function handleProfileUpdate(e) {
    e.preventDefault();
    
    currentUser.name = document.getElementById('edit-name').value;
    currentUser.region = document.getElementById('edit-region').value;
    storage.setUser(currentUser);
    
    alert('프로필이 업데이트되었습니다!');
    hideProfileModal();
    renderMyPage();
}

// 모달 외부 클릭시 닫기
window.addEventListener('click', function(event) {
    const modal = document.getElementById('profile-modal');
    if (event.target == modal) {
        hideProfileModal();
    }
});