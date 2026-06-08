import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantById } from '@services/restaurantService';
import { TagBadge } from '@components/common/TagBadge';
import { ReasonChips } from '@components/common/ReasonChips';
import { RestaurantDetailSkeleton } from '@components/common/Skeleton';
import type { RestaurantDetail } from '@/types';
import styles from './RestaurantDetailPage.module.css';

// ── 개발용 mock (백엔드 없이 UI 확인 시 사용) ──────────────────────
const MOCK: RestaurantDetail = {
  id: 1,
  campusId: 1,
  name: '성대 앞 한식당',
  category: '한식',
  categoryCode: 'korean',
  address: '경기도 수원시 장안구 천천동 300-1',
  lat: 37.2967,
  lng: 127.0099,
  priceRange: 'normal',
  priceLabel: '보통',
  phone: '031-123-4567',
  openingHours: '11:00 ~ 21:00',
  closedDays: '일요일',
  thumbnailUrl: '',
  imageUrls: [],
  tags: [
    { id: 1, name: '혼밥 가능', color: '#3b82f6' },
    { id: 2, name: '단체석', color: '#10b981' },
    { id: 3, name: '주차 가능', color: '#f59e0b' },
  ],
  parking: true,
  waiting: false,
  hasAnalysis: true,
  summary:
    '방문자 대부분이 가성비와 맛에 높은 만족도를 보였습니다. 점심시간 혼잡도가 높은 편이나 회전율이 빠릅니다. 주차 공간이 넉넉해 차량 방문에 유리합니다.',
  recommendationScore: 88,
  recommendationReasons: ['가성비 좋음', '재료 신선', '웨이팅 적음', '주차 편리'],
  reviewPoints: [
    { label: '맛', score: 4.5, description: '대부분의 리뷰어가 맛에 만족' },
    { label: '가격', score: 4.0, description: '적절한 가격대라는 의견 다수' },
    { label: '서비스', score: 3.8, description: '보통 수준의 서비스' },
    { label: '분위기', score: 4.2, description: '조용하고 쾌적한 환경' },
  ],
  analysisMetadata: {
    analyzedAt: '2025-05-01T09:00:00Z',
    reviewCount: 142,
    reliabilityRate: 0.87,
  },
};

// ── 점수 색상 ──────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────
function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo: string = (location.state as { from?: string })?.from ?? -1 as unknown as string;
  const handleBack = () => backTo === (-1 as unknown as string) ? navigate(-1) : navigate(backTo);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id!),
    enabled: id != null,
    staleTime: 60_000,
    // 백엔드 없을 때 UI 확인용 — 실서버 연결 후 제거
    placeholderData: MOCK,
  });

  const r = data ?? MOCK;

  // 실제 데이터 없이 로딩 중일 때 skeleton 표시
  if (isLoading && !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={handleBack}>← 뒤로가기</button>
        </header>
        <main className={styles.main}>
          <RestaurantDetailSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← 뒤로가기
        </button>
        {isLoading && <span className={styles.loadingBadge}>불러오는 중…</span>}
      </header>

      {isError && (
        <div className={styles.errorBanner}>
          데이터를 불러오지 못했습니다.{' '}
          <button className={styles.retryInline} onClick={() => void refetch()}>
            재시도
          </button>
        </div>
      )}

      <main className={styles.main}>
        {/* ── 히어로 섹션 ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroImage}>
            {r.thumbnailUrl
              ? <img src={r.thumbnailUrl} alt={r.name} className={styles.heroImg} />
              : <span className={styles.heroPlaceholder}>🍽️</span>
            }
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.restaurantName}>{r.name}</h1>

            <div className={styles.metaRow}>
              <span className={styles.category}>{r.category}</span>
              <span className={styles.price}>💰 {r.priceLabel}</span>
              {r.recommendationScore != null && (
                <span
                  className={styles.score}
                  style={{ color: scoreColor(r.recommendationScore) }}
                >
                  ★ {r.recommendationScore}점
                </span>
              )}
            </div>

            <p className={styles.infoRow}>📍 {r.address}</p>
            {r.openingHours && (
              <p className={styles.infoRow}>🕐 {r.openingHours}
                {r.closedDays && <span className={styles.closed}> · 휴무 {r.closedDays}</span>}
              </p>
            )}
            {r.phone && <p className={styles.infoRow}>📞 {r.phone}</p>}

            <div className={styles.badgeRow}>
              {r.parking && <span className={styles.infoBadge}>🚗 주차 가능</span>}
              {r.waiting && <span className={styles.infoBadgeWait}>⏳ 웨이팅 있음</span>}
            </div>

            {r.tags.length > 0 && (
              <div className={styles.tagRow}>
                {r.tags.map(t => <TagBadge key={t.id} tag={t} size="sm" />)}
              </div>
            )}
          </div>
        </section>

        {/* ── 이미지 갤러리 ── */}
        {r.imageUrls && r.imageUrls.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>사진</h2>
            <div className={styles.gallery}>
              {r.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${r.name} 사진 ${i + 1}`}
                  className={styles.galleryImg}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 추천 근거 ── */}
        {r.recommendationReasons && r.recommendationReasons.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>추천 근거</h2>
            <ReasonChips reasons={r.recommendationReasons} max={6} />
          </section>
        )}

        {/* ── 대표 메뉴 ── */}
        {r.representativeMenu && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>대표 메뉴</h2>
            <div className={styles.menuChips}>
              {r.representativeMenu.split('|').map(m => (
                <span key={m} className={styles.menuChip}>{m.trim()}</span>
              ))}
            </div>
          </section>
        )}

        {/* ── AI 요약 / 핵심 리뷰 포인트 (hasAnalysis 분기) ── */}
        {r.hasAnalysis ? (
          <>
            {r.summary && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>AI 리뷰 요약</h2>
                <p className={styles.aiSummary}>{r.summary}</p>
                {r.averageTrustScore != null && (
                  <p className={styles.trustScore}>
                    리뷰 신뢰도 점수 <strong>{r.averageTrustScore.toFixed(1)}</strong> / 100
                    <span className={styles.trustNote}> (참고 지표)</span>
                  </p>
                )}
                {r.credibilityLabel != null && (() => {
                  const labelMap: Record<number, string> = { 1: '낮음', 2: '다소 낮음', 3: '보통', 4: '다소 높음', 5: '높음' };
                  const label = labelMap[r.credibilityLabel!] ?? '알 수 없음';
                  return (
                    <div className={styles.credibilityComment}>
                      <p>AI 리뷰 신뢰도가 <strong>"{label}"</strong>인 식당이에요.</p>
                      <p>신뢰 점수는 음식 맛의 질이나 식당 상태를 반영하지 않아요.</p>
                      <p>신뢰 점수는 리뷰의 솔직함만을 반영해요.</p>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* 분위기 / 주차 / 웨이팅 요약 */}
            {(r.moodSummary || r.parkingSummary || r.waitingSummary) && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>상세 분위기 정보</h2>
                <ul className={styles.summaryList}>
                  {r.moodSummary    && <li><span className={styles.summaryLabel}>분위기</span>{r.moodSummary}</li>}
                  {r.parkingSummary && <li><span className={styles.summaryLabel}>주차</span>{r.parkingSummary}</li>}
                  {r.waitingSummary && <li><span className={styles.summaryLabel}>웨이팅</span>{r.waitingSummary}</li>}
                </ul>
              </section>
            )}

            {r.reviewPoints && r.reviewPoints.length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>핵심 리뷰 포인트</h2>
                <ul className={styles.reviewPoints}>
                  {r.reviewPoints.map(p => (
                    <li key={p.label} className={styles.reviewPoint}>
                      <span className={styles.pointLabel}>{p.label}</span>
                      <div className={styles.pointBar}>
                        <div
                          className={styles.pointBarFill}
                          style={{ width: `${(p.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={styles.pointScore}>★ {p.score.toFixed(1)}</span>
                      <span className={styles.pointDesc}>{p.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {r.recommendationScore != null && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>추천 점수</h2>
                <div className={styles.scoreDisplay}>
                  <span
                    className={styles.bigScore}
                    style={{ color: scoreColor(r.recommendationScore) }}
                  >
                    {r.recommendationScore}
                  </span>
                  <span className={styles.scoreDesc}>/ 100</span>
                </div>
              </section>
            )}
          </>
        ) : (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>AI 분석</h2>
            <div className={styles.noAnalysis}>
              🔍 아직 분석 데이터가 없습니다. 관리자 페이지에서 분석을 요청할 수 있습니다.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default RestaurantDetailPage;
