// FR-13: 관리자 식당 관리 화면
import styles from './AdminRestaurantsPage.module.css';

/**
 * AdminRestaurantsPage
 * /admin/restaurants — 식당 CRUD
 */
function AdminRestaurantsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>식당 관리</h1>
          <p className={styles.desc}>식당 정보를 추가·수정·삭제합니다.</p>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>FR-13</span>
        </div>
      </div>

      {/* 검색/필터 바 */}
      <div className={styles.toolbar}>
        <input className={styles.search} type="text" placeholder="식당 이름 검색..." />
        <select className={styles.select}>
          <option>전체 캠퍼스</option>
          <option>자연과학캠퍼스</option>
          <option>인문사회캠퍼스</option>
        </select>
        <button className={styles.addBtn}>+ 식당 추가</button>
      </div>

      {/* 식당 테이블 */}
      <div className={styles.tableWrap}>
        <div className={styles.tableBadge}>식당 목록 테이블 (CRUD)</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>식당명</th>
              <th>캠퍼스</th>
              <th>카테고리</th>
              <th>가격대</th>
              <th>분석 여부</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: '맛집 A', campus: '자연과학', cat: '한식', price: '보통', hasAnalysis: true },
              { id: 2, name: '맛집 B', campus: '자연과학', cat: '중식', price: '저렴함', hasAnalysis: false },
              { id: 3, name: '맛집 C', campus: '인문사회', cat: '일식', price: '비쌈', hasAnalysis: true },
            ].map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td className={styles.nameCell}>{r.name}</td>
                <td>{r.campus}</td>
                <td>{r.cat}</td>
                <td>{r.price}</td>
                <td>
                  {r.hasAnalysis
                    ? <span className={styles.yesTag}>분석 완료</span>
                    : <span className={styles.noTag}>미분석</span>
                  }
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn}>수정</button>
                    <button className={styles.deleteBtn}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 식당 추가 폼 플레이스홀더 */}
      <div className={styles.formPlaceholder}>
        <span className={styles.badge}>식당 추가/수정 폼 영역</span>
        <p>이름, 주소, 캠퍼스, 카테고리, 가격대, 좌표(lat/lng) 등 입력 폼 + 저장 버튼</p>
      </div>
    </div>
  );
}

export default AdminRestaurantsPage;
