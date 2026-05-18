// FR-15: 관리자 분석 관리 화면
import styles from './AdminAnalysesPage.module.css';

/**
 * AdminAnalysesPage
 * /admin/analyses — CSV 업로드, 분석 잡 실행·폴링, 결과 확인
 */
function AdminAnalysesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>분석 관리</h1>
        <span className={styles.badge}>FR-15</span>
      </div>

      {/* CSV 업로드 */}
      <div className={styles.card}>
        <div className={styles.cardBadge}>CSV 업로드 (FR-15)</div>
        <h2 className={styles.cardTitle}>리뷰 데이터 업로드</h2>
        <div className={styles.uploadZone}>
          <div className={styles.uploadIcon}>📁</div>
          <p>CSV 파일을 드래그하거나 클릭해서 업로드</p>
          <p className={styles.uploadHint}>리뷰 데이터 CSV (id, restaurant_id, content, ...)</p>
          <button className={styles.uploadBtn}>파일 선택</button>
        </div>
      </div>

      {/* 분석 잡 현황 */}
      <div className={styles.card}>
        <div className={styles.cardBadge}>분석 잡 폴링 (FR-15)</div>
        <h2 className={styles.cardTitle}>분석 잡 현황</h2>
        <div className={styles.jobList}>
          {[
            { id: 'JOB-001', restaurant: '맛집 A', status: '완료', progress: 100, created: '2026-05-17' },
            { id: 'JOB-002', restaurant: '맛집 D', status: '진행 중', progress: 64, created: '2026-05-18' },
            { id: 'JOB-003', restaurant: '맛집 E', status: '대기', progress: 0, created: '2026-05-18' },
          ].map(job => (
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobTop}>
                <span className={styles.jobId}>{job.id}</span>
                <span className={styles.jobRestaurant}>{job.restaurant}</span>
                <span className={
                  job.status === '완료' ? styles.statusDone
                  : job.status === '진행 중' ? styles.statusRunning
                  : styles.statusPending
                }>
                  {job.status}
                </span>
                <span className={styles.jobDate}>{job.created}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <div className={styles.progressLabel}>{job.progress}%</div>
            </div>
          ))}
        </div>
        <p className={styles.pollingNote}>
          진행 중인 잡은 일정 간격으로 백엔드 API 폴링 (TanStack Query refetchInterval)
        </p>
      </div>

      {/* 분석 결과 요약 */}
      <div className={styles.card}>
        <div className={styles.cardBadge}>분석 결과 (FR-15)</div>
        <h2 className={styles.cardTitle}>최근 완료된 분석 결과</h2>
        <div className={styles.resultPlaceholder}>
          <p>완료된 분석 잡의 결과 요약 표시 영역</p>
          <p>AI 요약, 핵심 포인트, 신뢰도 점수 분포 등을 확인하고 DB에 반영합니다.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalysesPage;
