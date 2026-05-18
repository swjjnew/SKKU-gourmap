// FR-05: 식당 상세 페이지 (AI 요약, 핵심 리뷰 포인트)
import { useNavigate, useParams } from 'react-router-dom';
import styles from './RestaurantDetailPage.module.css';

/**
 * RestaurantDetailPage
 * /restaurants/:id — AI 요약, 핵심 리뷰 포인트, 추천 근거 표시
 */
function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <span className={styles.badge}>FR-05</span>
      </header>

      <main className={styles.main}>
        {/* 식당 기본 정보 */}
        <div className={styles.heroSection}>
          <div className={styles.heroImage}>
            🍽️<br />
            <span>식당 썸네일 이미지 영역</span>
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.restaurantName}>식당 이름 (id: {id})</h1>
            <div className={styles.metaRow}>
              <span className={styles.category}>한식</span>
              <span className={styles.price}>💰 보통</span>
              <span className={styles.score}>★ 4.2</span>
            </div>
            <p className={styles.address}>📍 주소 영역 (경기도 수원시 ...)</p>
            <p className={styles.hours}>🕐 영업시간: 11:00 ~ 21:00</p>
            <p className={styles.phone}>📞 전화번호</p>
          </div>
        </div>

        {/* FR-08: 추천 근거 칩 */}
        <div className={styles.card}>
          <div className={styles.cardBadge}>FR-08</div>
          <h2 className={styles.cardTitle}>추천 근거</h2>
          <div className={styles.reasonChips}>
            {['가성비 좋음', '재료 신선', '웨이팅 적음', '주차 편리', '분위기 좋음'].map(r => (
              <span key={r} className={styles.reasonChip}>{r}</span>
            ))}
          </div>
        </div>

        {/* FR-05: AI 요약 */}
        <div className={styles.card}>
          <div className={styles.cardBadge}>FR-05 · AI 요약</div>
          <h2 className={styles.cardTitle}>AI 리뷰 요약</h2>
          <p className={styles.aiSummary}>
            [AI 요약 텍스트 영역] 이 식당의 리뷰를 LLM이 분석한 종합 요약 문장이 표시됩니다.
            신뢰도 분석 결과를 바탕으로 핵심 특징을 서술합니다.
          </p>
          <div className={styles.noAnalysis}>
            <span className={styles.noAnalysisBadge}>NFR-R-03</span>
            분석 데이터 없을 때: "분석 정보가 아직 없습니다" 플레이스홀더
          </div>
        </div>

        {/* FR-05: 핵심 리뷰 포인트 */}
        <div className={styles.card}>
          <div className={styles.cardBadge}>FR-05 · 핵심 리뷰 포인트</div>
          <h2 className={styles.cardTitle}>핵심 리뷰 포인트</h2>
          <ul className={styles.reviewPoints}>
            {[
              { label: '맛', value: '4.5', desc: '대부분의 리뷰어가 맛에 만족' },
              { label: '가격', value: '4.0', desc: '적절한 가격대라는 의견 다수' },
              { label: '서비스', value: '3.8', desc: '보통 수준의 서비스' },
              { label: '분위기', value: '4.2', desc: '조용하고 쾌적한 환경' },
            ].map(p => (
              <li key={p.label} className={styles.reviewPoint}>
                <span className={styles.pointLabel}>{p.label}</span>
                <span className={styles.pointScore}>★ {p.value}</span>
                <span className={styles.pointDesc}>{p.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FR-07: 추천 점수 */}
        <div className={styles.card}>
          <div className={styles.cardBadge}>FR-07</div>
          <h2 className={styles.cardTitle}>추천 점수</h2>
          <div className={styles.scoreDisplay}>
            <span className={styles.bigScore}>88</span>
            <span className={styles.scoreDesc}>/ 100 · 백엔드에서 계산된 점수, 프론트는 표시만</span>
          </div>
        </div>

        {/* FR-16: 에러/빈 상태 예시 */}
        <div className={`${styles.card} ${styles.errorCard}`}>
          <div className={styles.cardBadge}>FR-16</div>
          <h2 className={styles.cardTitle}>오류 상태 예시</h2>
          <p className={styles.errorDesc}>API 4xx/5xx → 표준 에러 메시지 + 재시도 버튼</p>
          <button className={styles.retryBtn}>재시도</button>
        </div>
      </main>
    </div>
  );
}

export default RestaurantDetailPage;
