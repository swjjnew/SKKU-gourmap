import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantById } from '@services/restaurantService';
import { TagBadge } from '@components/common/TagBadge';
import { ReasonChips } from '@components/common/ReasonChips';
import { RestaurantDetailSkeleton } from '@components/common/Skeleton';
import styles from './RestaurantDetailPage.module.css';

function scoreColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo: string = (location.state as { from?: string })?.from ?? -1 as unknown as string;
  const handleBack = () => backTo === (-1 as unknown as string) ? navigate(-1) : navigate(backTo);

  const { data: r, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id!),
    enabled: id != null,
    staleTime: 60_000,
  });

  if (isLoading || !r) {
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

        {r.imageUrls && r.imageUrls.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>사진</h2>
            <div className={styles.gallery}>
              {r.imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`${r.name} 사진 ${i + 1}`} className={styles.galleryImg} />
              ))}
            </div>
          </section>
        )}

        {r.recommendationReasons && r.recommendationReasons.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>추천 근거</h2>
            <ReasonChips reasons={r.recommendationReasons} max={6} />
          </section>
        )}

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
                  const labelMap: Record<number, string> = { 1: '높음', 2: '다소 높음', 3: '보통', 4: '다소 낮음', 5: '낮음' };
                  const label = labelMap[r.credibilityLabel!] ?? '알 수 없음';
                  return (
                    <div className={styles.credibilityComment}>
                      <p>AI 리뷰 신뢰도가 <strong>"{label}"</strong>인 식당이에요.</p>
                      <p>신뢰 점수는 음식 맛의 질이나 식당 상태를 반영하지 않아요.</p>
                      <p>신뢰 점수는 리뷰의 솔직함만을 반영해요.</p>
                      <p>리뷰 신뢰도의 높고 낮음은 상대적 평가이며, 상권 단위로 평가됩니다.</p>
                    </div>
                  );
                })()}
              </section>
            )}

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
                        <div className={styles.pointBarFill} style={{ width: `${(p.score / 5) * 100}%` }} />
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
                  <span className={styles.bigScore} style={{ color: scoreColor(r.recommendationScore) }}>
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
