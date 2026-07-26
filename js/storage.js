/* ==========================================
   로컬 스토리지 관리
   ========================================== */

class StorageManager {
    constructor() {
        this.prefix = 'busan-ocean-keeper:';
    }

    // 사용자 정보
    setUser(userData) {
        localStorage.setItem(this.prefix + 'user', JSON.stringify(userData));
    }

    getUser() {
        const data = localStorage.getItem(this.prefix + 'user');
        if (!data) {
            return this.getDefaultUser();
        }
        return JSON.parse(data);
    }

    getDefaultUser() {
        return {
            name: '익명의 시민',
            region: '',
            points: 0,
            totalReports: 0,
            completedReports: 0,
            reportsFromPoints: 0,
            collectionFromPoints: 0
        };
    }

    // 신고 데이터
    addReport(report) {
        const reports = this.getReports();
        report.id = Date.now().toString();
        report.createdAt = new Date().toISOString();
        report.status = 'pending';
        reports.push(report);
        localStorage.setItem(this.prefix + 'reports', JSON.stringify(reports));
        return report;
    }

    getReports() {
        const data = localStorage.getItem(this.prefix + 'reports');
        return data ? JSON.parse(data) : [];
    }

    getReportById(id) {
        const reports = this.getReports();
        return reports.find(r => r.id === id);
    }

    updateReport(id, updates) {
        const reports = this.getReports();
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index] = { ...reports[index], ...updates };
            localStorage.setItem(this.prefix + 'reports', JSON.stringify(reports));
            return reports[index];
        }
        return null;
    }

    // 활동 로그
    addActivity(activity) {
        const activities = this.getActivities();
        activity.timestamp = new Date().toISOString();
        activities.unshift(activity);
        // 최근 50개만 저장
        if (activities.length > 50) {
            activities.pop();
        }
        localStorage.setItem(this.prefix + 'activities', JSON.stringify(activities));
    }

    getActivities() {
        const data = localStorage.getItem(this.prefix + 'activities');
        return data ? JSON.parse(data) : [];
    }

    // 모든 데이터 초기화
    resetAllData() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

const storage = new StorageManager();
