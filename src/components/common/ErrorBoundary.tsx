import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  /** 에러 발생 시 렌더링할 커스텀 fallback. 없으면 기본 UI 사용 */
  fallback?: ReactNode;
  /** 재시도 버튼 레이블. 기본값: '다시 시도' */
  retryLabel?: string;
  /** 에러 경계 이름 (디버깅용) */
  name?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 클래스 기반 에러 경계 컴포넌트.
 * 지도/목록 섹션을 독립적으로 감싸서 한쪽 오류가 전체 앱 크래시로 이어지지 않게 막는다 (NFR-R-04).
 *
 * @example
 * <ErrorBoundary name="map" retryLabel="지도 다시 로드">
 *   <KakaoMap ... />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 추후 Sentry 등 에러 리포팅 서비스로 교체 가능
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, info);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.container} role="alert">
          <p className={styles.message}>
            {this.state.error?.message ?? '오류가 발생했습니다.'}
          </p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={this.handleRetry}
          >
            {this.props.retryLabel ?? '다시 시도'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
