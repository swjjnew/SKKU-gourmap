import type { PriceRange } from '@/types';
import type { FilterParams, SortOption } from '@hooks/useFilterParams';
import styles from './FilterPanel.module.css';

// 백엔드 categories 엔드포인트 생기면 동적으로 교체 예정
const CATEGORIES = [
  { code: '', label: '전체' },
  { code: 'korean', label: '한식' },
  { code: 'chinese', label: '중식' },
  { code: 'japanese', label: '일식' },
  { code: 'western', label: '양식' },
  { code: 'cafe', label: '카페·디저트' },
  { code: 'snack', label: '분식·패스트푸드' },
];

const PRICE_RANGES: { value: PriceRange | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'cheap', label: '저렴함' },
  { value: 'normal', label: '보통' },
  { value: 'expensive', label: '비쌈' },
];


const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score', label: '추천 점수순' },
  { value: 'name', label: '이름순' },
  { value: 'price', label: '가격순' },
];

interface Props {
  filter: FilterParams;
  hasFilter: boolean;
  onChange: (patch: Partial<FilterParams>) => void;
  onReset: () => void;
}

/**
 * 식당 필터 패널 (FR-06).
 * - 카테고리 탭
 * - 가격대 버튼 그룹
 * - 주차 / 웨이팅 토글 칩
 * - 정렬 셀렉트
 * - 필터 초기화 버튼
 */
export function FilterPanel({ filter, hasFilter, onChange, onReset }: Props) {
  return (
    <div className={styles.panel}>
      {/* 카테고리 탭 */}
      <div className={styles.row}>
        <div className={styles.tabs} role="group" aria-label="음식 종류">
          {CATEGORIES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              className={`${styles.tab} ${filter.category === code ? styles.tabActive : ''}`}
              onClick={() => onChange({ category: code })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

{/* 가격대 + 조건 토글 */}
      <div className={styles.row}>
        <div className={styles.btnGroup} role="group" aria-label="가격대">
          {PRICE_RANGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.pill} ${filter.priceRange === value ? styles.pillActive : ''}`}
              onClick={() => onChange({ priceRange: value })}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggle} ${filter.parking ? styles.toggleActive : ''}`}
            onClick={() => onChange({ parking: !filter.parking })}
            aria-pressed={filter.parking}
          >
            P 주차
          </button>
          <button
            type="button"
            className={`${styles.toggle} ${filter.waiting ? styles.toggleActive : ''}`}
            onClick={() => onChange({ waiting: !filter.waiting })}
            aria-pressed={filter.waiting}
          >
            대기 웨이팅
          </button>
        </div>
      </div>

      {/* 정렬 + 초기화 */}
      <div className={`${styles.row} ${styles.rowBottom}`}>
        <label className={styles.sortLabel}>
          정렬
          <select
            className={styles.select}
            value={filter.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {hasFilter && (
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}
