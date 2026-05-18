// FR-14: 관리자 리뷰 관리 화면
import styles from './AdminReviewsPage.module.css';

/**
 * AdminReviewsPage
 * /admin/reviews — 리뷰 검토 및 삭제
 */
function AdminReviewsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>리뷰 관리</h1>
        <span className={styles.badge}>FR-14</span>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.search} type="text" placeholder="리뷰 내용 검색..." />
        <select className={styles.select}>
          <option>전체 식당</option>
        </select>
        <select className={styles.select}>
          <option>전체 상태</option>
          <option>정상</option>
          <option>신고됨</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableBadge}>리뷰 목록 테이블 (검토·삭제)</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>식당</th>
              <th>내용 (요약)</th>
              <th>신뢰도 점수</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 101, rest: '맛집 A', content: '음식이 정말 맛있고 서비스도 좋아요...', score: 0.92, status: '정상' },
              { id: 102, rest: '맛집 B', content: '가격 대비 양이 적어요. 다시는 안 갈 것...', score: 0.45, status: '신고됨' },
              { id: 103, rest: '맛집 C', content: '분위기 좋고 직원분들이 친절해요...', score: 0.88, status: '정상' },
            ].map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.rest}</td>
                <td className={styles.contentCell}>{r.content}</td>
                <td>
                  <span className={r.score >= 0.7 ? styles.highScore : styles.lowScore}>
                    {r.score.toFixed(2)}
                  </span>
                </td>
                <td>
                  <span className={r.status === '신고됨' ? styles.flaggedTag : styles.normalTag}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <button className={styles.deleteBtn}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoBadge}>LLM 신뢰도 분석</span>
        <p>신뢰도 점수는 백엔드(SKT A.X)에서 계산된 값. 프론트는 표시 및 필터링만 담당합니다.</p>
      </div>
    </div>
  );
}

export default AdminReviewsPage;
