import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 프로젝트 사이트는 https://<user>.github.io/<repo>/ 에 배포되므로
// 프로덕션 빌드에서는 base 를 저장소 이름에 맞춘다.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/todoooo/' : '/',
}));
