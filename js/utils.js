/* ==========================================
   유틸리티 함수
   ========================================== */

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
        return '어제';
    } else {
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
}

// 시간 차이 계산
function getTimeDiff(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return formatDate(dateString);
}

// 지역 한글 변환
function getRegionName(regionCode) {
    const regions = {
        'haeundae': '해운대구',
        'suyeong': '수영구',
        'nam': '남구',
        'dong': '동구',
        'seo': '서구',
        'busan': '부산진구'
    };
    return regions[regionCode] || regionCode;
}

// 쓰레기 종류 한글 변환
function getTrashTypeName(typeCode) {
    const types = {
        'plastic': '플라스틱',
        'net': '어망',
        'wood': '목재',
        'metal': '금속',
        'glass': '유리',
        'other': '기타'
    };
    return types[typeCode] || typeCode;
}

// 쓰레기 량 한글 변환
function getAmountName(amountCode) {
    const amounts = {
        'small': '적음',
        'medium': '중간',
        'large': '많음'
    };
    return amounts[amountCode] || amountCode;
}

// 상태 한글 변환
function getStatusName(statusCode) {
    const statuses = {
        'pending': '신고됨',
        'in-progress': '수거중',
        'completed': '완료'
    };
    return statuses[statusCode] || statusCode;
}

// 포인트 계산
function calculatePoints(reportData) {
    let points = 0;
    
    // 신고 포인트
    if (reportData.status === 'pending') {
        points += 50;
    }
    
    // 수거 완료 포인트
    if (reportData.status === 'completed') {
        points += 50; // 신고 포인트
        points += 100; // 수거 포인트
    }
    
    return points;
}

// 지역별 포인트 계산
function calculateRegionPoints(reports) {
    const regionPoints = {};
    
    reports.forEach(report => {
        const region = report.region;
        if (!regionPoints[region]) {
            regionPoints[region] = 0;
        }
        regionPoints[region] += calculatePoints(report);
    });
    
    return regionPoints;
}

// 지역별 순위 생성
function getRegionRanking(reports) {
    const regionPoints = calculateRegionPoints(reports);
    
    const ranking = Object.entries(regionPoints)
        .map(([region, points]) => ({
            region,
            regionName: getRegionName(region),
            points
        }))
        .sort((a, b) => b.points - a.points)
        .map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    
    return ranking;
}

// 사용자별 순위 생성
function getUserRanking(reports, currentUser) {
    const users = {};
    
    reports.forEach(report => {
        if (!users[report.userId]) {
            users[report.userId] = {
                userId: report.userId,
                userName: report.userName || '익명의 시민',
                points: 0
            };
        }
        users[report.userId].points += calculatePoints(report);
    });
    
    const ranking = Object.values(users)
        .sort((a, b) => b.points - a.points)
        .map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    
    return ranking;
}

// 통계 계산
function calculateStats(reports) {
    const stats = {
        total: reports.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalPoints: 0
    };
    
    reports.forEach(report => {
        if (report.status === 'pending') stats.pending++;
        if (report.status === 'in-progress') stats.inProgress++;
        if (report.status === 'completed') stats.completed++;
        stats.totalPoints += calculatePoints(report);
    });
    
    return stats;
}

// 파일을 Base64로 변환
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 오늘 신고된 쓰레기 개수
function getTodayReportsCount(reports) {
    const today = new Date().toDateString();
    return reports.filter(report => {
        const reportDate = new Date(report.createdAt).toDateString();
        return reportDate === today;
    }).length;
}

// 사용자 신고 필터링
function getUserReports(reports, userId) {
    return reports.filter(report => report.userId === userId);
}

// 지역 신고 필터링
function getRegionReports(reports, region) {
    return reports.filter(report => report.region === region);
}

// 상태별 필터링
function getReportsByStatus(reports, status) {
    if (status === 'all') return reports;
    return reports.filter(report => report.status === status);
}
