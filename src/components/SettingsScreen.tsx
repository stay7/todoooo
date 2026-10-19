import { useState } from 'react';
import styles from './SettingsScreen.module.css';

interface Props {
  supabaseConfigured: boolean;
  onClearLocal: () => void;
}

export function SettingsScreen({ supabaseConfigured, onClearLocal }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className={styles.screen}>
      <header className={styles.appBar}>
        <h1 className={styles.title}>설정</h1>
      </header>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>저장 위치</h2>
        <div className={styles.card}>
          {supabaseConfigured ? (
            <>
              <p className={styles.main}>서버 (Supabase)</p>
              <p className={styles.sub}>
                어떤 기기에서 열어도 같은 데이터를 봅니다. 링크를 아는 누구나 읽고 쓸 수 있는 공개
                모드입니다.
              </p>
            </>
          ) : (
            <>
              <p className={styles.main}>이 브라우저 (로컬 저장 모드)</p>
              <p className={styles.sub}>
                Supabase 환경변수가 없어 브라우저 저장소에만 저장합니다. 다른 기기에서는 보이지 않고,
                브라우저 데이터를 지우면 함께 사라집니다.
              </p>
              {confirmClear ? (
                <div className={styles.confirm}>
                  <span>모든 Todo 가 지워집니다. 계속할까요?</span>
                  <div className={styles.confirmButtons}>
                    <button
                      type="button"
                      className={styles.dangerSolid}
                      onClick={() => {
                        onClearLocal();
                        setConfirmClear(false);
                      }}
                    >
                      지우기
                    </button>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => setConfirmClear(false)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => setConfirmClear(true)}
                >
                  로컬 데이터 모두 지우기
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>앱 정보</h2>
        <div className={styles.card}>
          <p className={styles.main}>Todooo</p>
          <p className={styles.sub}>
            바이브 코딩 입문 실습용 Todo 앱. 기획서와 코드는 GitHub 저장소{' '}
            <a href="https://github.com/stay7/todoooo" target="_blank" rel="noreferrer">
              stay7/todoooo
            </a>{' '}
            에 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
