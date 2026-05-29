import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnalysisJobs, startAnalysisJob } from '@services/adminService';
import { fetchRestaurantsByCampus } from '@services/restaurantService';
import type { AnalysisJobStatus } from '@/types';
import styles from './AdminAnalysesPage.module.css';

// 진행 중인 잡이 있을 때 폴링 간격 (ms)
const POLL_INTERVAL = 5_000;

const STATUS_LABEL: Record<AnalysisJobStatus, string> = {
  pending:   '대기',
  running:   '진행 중',
  completed: '완료',
  failed:    '실패',
};

function AdminAnalysesPage() {
  const qc = useQueryClient();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | ''>('');

  // 식당 목록 (분석 대상 선택용)
  const naturalQ    = useQuery({ queryKey: ['admin', 'restaurants', 'natural'],    queryFn: () => fetchRestaurantsByCampus('natural'),    staleTime: 60_000 });
  const humanitiesQ = useQuery({ queryKey: ['admin', 'restaurants', 'humanities'], queryFn: () => fetchRestaurantsByCampus('humanities'), staleTime: 60_000 });
  const allRestaurants = [...(naturalQ.data ?? []), ...(humanitiesQ.data ?? [])];

  // 분석 잡 목록 — running 잡 있으면 폴링
  const { data: jobs = [], isError } = useQuery({
    queryKey: ['admin', 'analysis-jobs'],
    queryFn: fetchAnalysisJobs,
    refetchInterval: (query) => {
      const list = query.state.data ?? [];
      return list.some(j => j.status === 'running' || j.status === 'pending')
        ? POLL_INTERVAL
        : false;
    },
    staleTime: 10_000,
  });

  const startMut = useMutation({
    mutationFn: (restaurantId: number) => startAnalysisJob(restaurantId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'analysis-jobs'] });
      setSelectedRestaurantId('');
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>분석 관리</h1>
        <p className={styles.desc}>식당 리뷰 AI 분석 잡을 실행하고 결과를 확인합니다.</p>
      </div>

      {/* 새 분석 요청 */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>새 분석 요청</h2>
        <div className={styles.triggerRow}>
          <select
            className={styles.select}
            value={selectedRestaurantId}
            onChange={e => setSelectedRestaurantId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">식당 선택…</option>
            {allRestaurants.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.category})
              </option>
            ))}
          </select>
          <button
            className={styles.startBtn}
            disabled={!selectedRestaurantId || startMut.isPending}
            onClick={() => selectedRestaurantId !== '' && startMut.mutate(Number(selectedRestaurantId))}
          >
            {startMut.isPending ? '요청 중…' : '분석 시작'}
          </button>
        </div>
        {startMut.isError && <p className={styles.errorMsg}>분석 요청에 실패했습니다.</p>}
        {startMut.isSuccess && <p className={styles.successMsg}>분석 잡이 등록되었습니다.</p>}
      </div>

      {/* 잡 목록 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>분석 잡 현황</h2>
          {jobs.some(j => j.status === 'running' || j.status === 'pending') && (
            <span className={styles.pollingBadge}>🔄 자동 갱신 중</span>
          )}
        </div>

        {isError && <p className={styles.errorMsg}>잡 목록을 불러오지 못했습니다. (백엔드 admin API 확인 필요)</p>}

        {jobs.length === 0 && !isError && (
          <p className={styles.empty}>등록된 분석 잡이 없습니다.</p>
        )}

        <div className={styles.jobList}>
          {jobs.map(job => (
            <div key={job.jobId} className={styles.jobItem}>
              <div className={styles.jobTop}>
                <span className={styles.jobRestaurant}>{job.restaurantName}</span>
                <span className={`${styles.statusBadge} ${styles[`status_${job.status}`]}`}>
                  {STATUS_LABEL[job.status]}
                </span>
                <span className={styles.jobDate}>
                  {new Date(job.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>

              {(job.status === 'running' || job.status === 'pending') && (
                <>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${job.progress}%` }} />
                  </div>
                  <span className={styles.progressLabel}>{job.progress}%</span>
                </>
              )}

              {job.status === 'completed' && job.completedAt && (
                <p className={styles.completedAt}>
                  완료: {new Date(job.completedAt).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAnalysesPage;
