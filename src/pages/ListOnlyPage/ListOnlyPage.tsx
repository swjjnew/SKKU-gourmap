// NFR-R-04: 지도 장애 시 리스트 전용 fallback 화면
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ListOnlyPage.module.css';

const CAMPUS_LABELS: Record<string, string> = {
  natural: '자연과학캠퍼스',
  humanities: '인문사회캠퍼스',
};

const DUMMY_RESTAURANTS = [
  { id: 1, name: '수원 맛집 A', category: '한식', priceRange: '보통', score: 4.2 },
  { id: 2, name: '수원 맛집 B', category: '중식', priceRange: '저렴함', score: 3.8 },
  { id: 3, name: '수원 맛집 C', category: '일식', priceRange: '비쌈', score: 4.7 },
  { id: 4, name: '수원 맛집 D', category: '양식', priceRange: '보통', score: 4.0 },
];

/**
 * ListOnlyPage
 * /campus/:slug/list — 지도 없이 리스트만. 카카오맵 SDK 장애 시 fallback.
 */
function ListOnlyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const campusLabel = CAMPUS_LABELS[slug ?? ''] ?? slug;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/campus/${slug}`)}>
          ← 지도로 돌아가기
        </button>
        <span className={styles.title}>{campusLabel} — 리스트 전용</span>
        <span className={styles.badge}>NFR-R-04</span>
      </header>

      <div className={styles.notice}>
        🗺️ 지도를 불러올 수 없어 리스트 모드로 표시합니다.
      </div>

      <main className={styles.main}>
        {/* 필터 플레이스홀더 */}
        <div className={styles.filterBar}>
          <span className={styles.sectionBadge}>FR-06</span>
          <strong>필터 바 영역</strong>
          <span className={styles.filterNote}>음식 종류 · 가격대 · 분위기 · 주차 · 웨이팅</span>
        </div>

        {/* 식당 리스트 */}
        <div className={styles.sectionBadge}>FR-02~04 · FR-07~08</div>
        <ul className={styles.list}>
          {DUMMY_RESTAURANTS.map(r => (
            <li
              key={r.id}
              className={styles.item}
              onClick={() => navigate(`/restaurants/${r.id}`)}
            >
              <div className={styles.rName}>{r.name}</div>
              <div className={styles.rMeta}>
                <span>{r.category}</span>
                <span className={styles.price}>{r.priceRange}</span>
                <span className={styles.score}>★ {r.score}</span>
              </div>
              <div className={styles.reasons}>
                <span className={styles.reasonChip}>추천 근거 칩 (FR-08)</span>
                <span className={styles.reasonChip}>AI 요약</span>
              </div>
            </li>
          ))}
        </ul>

        {/* 빈 결과 상태 (FR-16) */}
        <div className={styles.emptyPlaceholder}>
          <span className={styles.sectionBadge}>FR-16</span>
          <p>조건에 맞는 식당이 없을 때: "조건에 맞는 식당이 없습니다" + 필터 초기화 버튼</p>
        </div>
      </main>
    </div>
  );
}

export default ListOnlyPage;
