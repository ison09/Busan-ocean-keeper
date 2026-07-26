/* ==========================================
   API 통신 관리
   ========================================== */

class APIManager {
    constructor() {
        this.baseUrl = '';
    }

    // 신고 제출
    async submitReport(reportData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const report = storage.addReport(reportData);
                storage.addActivity({
                    type: 'report',
                    message: `${getRegionName(reportData.region)}에서 ${getTrashTypeName(reportData.type)} 신고`,
                    reportId: report.id,
                    icon: '📝'
                });
                resolve(report);
            }, 500);
        });
    }

    // 신고 상태 업데이트
    async updateReportStatus(reportId, status) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const report = storage.updateReport(reportId, { status });
                
                if (status === 'completed') {
                    storage.addActivity({
                        type: 'collection',
                        message: `신고된 쓰레기 수거 완료!`,
                        reportId: reportId,
                        icon: '✅'
                    });
                }
                
                resolve(report);
            }, 500);
        });
    }

    // 모든 신고 조회
    async getReports() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(storage.getReports());
            }, 300);
        });
    }

    // 신고 상세 조회
    async getReportById(reportId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(storage.getReportById(reportId));
            }, 200);
        });
    }

    // 지역별 통계
    async getRegionStats(region) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reports = storage.getReports();
                const regionReports = getRegionReports(reports, region);
                resolve(calculateStats(regionReports));
            }, 300);
        });
    }

    // 사용자 포인트 계산
    async calculateUserPoints(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reports = storage.getReports();
                const userReports = getUserReports(reports, userId);
                let points = 0;
                userReports.forEach(report => {
                    points += calculatePoints(report);
                });
                resolve(points);
            }, 300);
        });
    }

    // 랭킹 조회
    async getRanking(type = 'region') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reports = storage.getReports();
                if (type === 'region') {
                    resolve(getRegionRanking(reports));
                } else {
                    resolve(getUserRanking(reports));
                }
            }, 500);
        });
    }
}

const api = new APIManager();