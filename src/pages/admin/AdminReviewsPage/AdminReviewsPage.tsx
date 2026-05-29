import { useRef, useState } from 'react';
import { uploadReviewCSV, type UploadResult } from '@services/adminService';
import styles from './AdminReviewsPage.module.css';

function AdminReviewsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]           = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      setResult(null);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadReviewCSV(file);
      setResult(res);
    } catch {
      setUploadError('업로드에 실패했습니다. 파일 형식과 백엔드 서버를 확인해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>리뷰 관리</h1>
        <p className={styles.desc}>리뷰 CSV 파일을 업로드하여 DB에 반영합니다.</p>
      </div>

      {/* CSV 업로드 카드 */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>리뷰 데이터 CSV 업로드</h2>
        <p className={styles.hint}>
          형식: <code>restaurant_external_id, content, source_url, ...</code>
        </p>

        <div
          className={`${styles.dropZone} ${file ? styles.dropZoneActive : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
          {file ? (
            <div className={styles.fileSelected}>
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div className={styles.dropPrompt}>
              <span className={styles.uploadIcon}>📁</span>
              <p>CSV 파일을 드래그하거나 클릭해서 선택</p>
              <p className={styles.uploadSub}>restaurant_external_id, content, source_url 컬럼 필수</p>
            </div>
          )}
        </div>

        <div className={styles.uploadActions}>
          {file && (
            <button
              className={styles.clearBtn}
              onClick={() => { setFile(null); setResult(null); setUploadError(null); }}
            >
              파일 초기화
            </button>
          )}
          <button
            className={styles.uploadBtn}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? '업로드 중…' : '업로드'}
          </button>
        </div>

        {/* 업로드 결과 */}
        {result && (
          <div className={styles.result}>
            <p className={styles.resultTitle}>업로드 완료</p>
            <div className={styles.resultGrid}>
              <div className={styles.resultItem}>
                <span className={styles.resultNum}>{result.insertedCount}</span>
                <span className={styles.resultLabel}>등록 성공</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultNum}>{result.skippedCount}</span>
                <span className={styles.resultLabel}>중복 건너뜀</span>
              </div>
              <div className={`${styles.resultItem} ${result.errorCount > 0 ? styles.resultError : ''}`}>
                <span className={styles.resultNum}>{result.errorCount}</span>
                <span className={styles.resultLabel}>오류</span>
              </div>
            </div>
            {result.errors && result.errors.length > 0 && (
              <ul className={styles.errorList}>
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        {uploadError && <p className={styles.errorMsg}>{uploadError}</p>}
      </div>

      {/* 안내 */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>CSV 형식 안내</h2>
        <pre className={styles.csvSample}>{`restaurant_external_id,content,source_url
kakao_001,"음식이 맛있어요. 분위기도 좋음.",https://...
kakao_002,"가성비 최고!",https://...`}</pre>
      </div>
    </div>
  );
}

export default AdminReviewsPage;
