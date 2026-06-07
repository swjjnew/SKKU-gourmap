import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  fetchAdminRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  type AdminRestaurantPayload,
} from '@services/adminService';
import type { RestaurantListItem } from '@/types';
import styles from './AdminRestaurantsPage.module.css';

// ── 폼 스키마 ────────────────────────────────────────────────────
const schema = z.object({
  name:       z.string().min(1, '식당 이름을 입력해주세요'),
  address:    z.string().min(1, '주소를 입력해주세요'),
  campusSlug: z.enum(['natural', 'humanities'], { message: '캠퍼스를 선택해주세요' }),
  category:   z.string().min(1, '카테고리를 입력해주세요'),
  priceLevel: z.enum(['저렴함', '보통', '비쌈']),
  lat:        z.preprocess((v) => parseFloat(String(v)), z.number()),
  lng:        z.preprocess((v) => parseFloat(String(v)), z.number()),
  phone:      z.string().optional(),
  sourceUrl:  z.string().optional(),
  externalId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [modalTarget, setModalTarget] = useState<RestaurantListItem | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<RestaurantListItem | null>(null);

  const { data: restaurants = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'restaurants'],
    queryFn: fetchAdminRestaurants,
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: (payload: AdminRestaurantPayload) => createRestaurant(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); setModalTarget(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AdminRestaurantPayload> }) =>
      updateRestaurant(id, payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); setModalTarget(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteRestaurant(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] }); setDeleteTarget(null); },
  });

  const filtered = restaurants.filter(r => {
    const matchSearch = !search || r.name.includes(search);
    const matchCampus = !campusFilter || String(r.campusId) === campusFilter;
    return matchSearch && matchCampus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>식당 관리</h1>
          <p className={styles.desc}>식당 정보를 추가·수정·삭제합니다.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setModalTarget('new')}>+ 식당 추가</button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="식당 이름 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.select} value={campusFilter} onChange={e => setCampusFilter(e.target.value)}>
          <option value="">전체 캠퍼스</option>
          <option value="1">자연과학캠퍼스</option>
          <option value="2">인문사회캠퍼스</option>
        </select>
      </div>

      {isLoading && <p className={styles.loadingMsg}>불러오는 중…</p>}
      {isError  && <p className={styles.errorMsg}>데이터를 불러오지 못했습니다. (백엔드 admin API 확인 필요)</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>식당명</th><th>카테고리</th>
              <th>가격대</th><th>분석 여부</th><th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td className={styles.nameCell}>{r.name}</td>
                <td>{r.category}</td>
                <td>{r.priceLabel}</td>
                <td>
                  {r.hasAnalysis
                    ? <span className={styles.yesTag}>분석 완료</span>
                    : <span className={styles.noTag}>미분석</span>}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => setModalTarget(r)}>수정</button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteTarget(r)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <p className={styles.empty}>식당이 없습니다.</p>
        )}
      </div>

      {/* 추가/수정 모달 */}
      {modalTarget && (
        <RestaurantModal
          target={modalTarget === 'new' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSubmit={(values) => {
            if (modalTarget === 'new') {
              createMut.mutate(values as AdminRestaurantPayload);
            } else {
              updateMut.mutate({ id: (modalTarget as RestaurantListItem).id, payload: values });
            }
          }}
          isPending={createMut.isPending || updateMut.isPending}
          error={createMut.error ?? updateMut.error}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className={styles.overlay}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmMsg}>
              <strong>{deleteTarget.name}</strong>을(를) 삭제하시겠습니까?<br />
              <span className={styles.confirmSub}>이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>취소</button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => deleteMut.mutate(deleteTarget.id)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? '삭제 중…' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 추가/수정 폼 모달 ─────────────────────────────────────────────
interface ModalProps {
  target: RestaurantListItem | null;
  onClose: () => void;
  onSubmit: (values: Partial<AdminRestaurantPayload>) => void;
  isPending: boolean;
  error: unknown;
}

function RestaurantModal({ target, onClose, onSubmit, isPending, error }: ModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: target ? {
      name:       target.name,
      address:    target.address,
      campusSlug: target.campusId === 1 ? 'natural' : 'humanities',
      category:   target.category,
      priceLevel: target.priceLabel as '저렴함' | '보통' | '비쌈',
        externalId: undefined,
      lat:        target.lat,
      lng:        target.lng,
    } : undefined,
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>{target ? '식당 수정' : '식당 추가'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
          <div className={styles.modalGrid}>
            <Field label="식당 이름 *" error={errors.name?.message}>
              <input className={styles.input} {...register('name')} />
            </Field>
            <Field label="주소 *" error={errors.address?.message}>
              <input className={styles.input} {...register('address')} />
            </Field>
            <Field label="캠퍼스 *" error={errors.campusSlug?.message}>
              <select className={styles.input} {...register('campusSlug')}>
                <option value="">선택</option>
                <option value="natural">자연과학캠퍼스</option>
                <option value="humanities">인문사회캠퍼스</option>
              </select>
            </Field>
            <Field label="카테고리 *" error={errors.category?.message}>
              <input className={styles.input} placeholder="한식, 양식 등" {...register('category')} />
            </Field>
            <Field label="가격대 *" error={errors.priceLevel?.message}>
              <select className={styles.input} {...register('priceLevel')}>
                <option value="저렴함">저렴함</option>
                <option value="보통">보통</option>
                <option value="비쌈">비쌈</option>
              </select>
            </Field>
            <Field label="위도 *" error={errors.lat?.message}>
              <input className={styles.input} type="number" step="any" {...register('lat')} />
            </Field>
            <Field label="경도 *" error={errors.lng?.message}>
              <input className={styles.input} type="number" step="any" {...register('lng')} />
            </Field>
            <Field label="전화번호" error={errors.phone?.message}>
              <input className={styles.input} {...register('phone')} />
            </Field>
            <Field label="출처 URL" error={errors.sourceUrl?.message}>
              <input className={styles.input} {...register('sourceUrl')} />
            </Field>
            <Field label="외부 ID (externalId)" error={errors.externalId?.message}>
              <input className={styles.input} placeholder="kakao_001 등 (선택)" {...register('externalId')} />
            </Field>
          </div>

          {!!error && <p className={styles.errorMsg}>저장에 실패했습니다.</p>}

          <div className={styles.modalBtns}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              {isPending ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

export default AdminRestaurantsPage;
