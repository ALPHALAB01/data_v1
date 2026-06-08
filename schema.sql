-- 매칭 시스템 데이터베이스 스키마
DROP TABLE IF EXISTS history;
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time TEXT NOT NULL DEFAULT '',        -- 시작 시기 (연혁: YY.MM / 실적: YY.MM.DD)
  time_end TEXT NOT NULL DEFAULT '',    -- 끝 시기 (실적용, YY.MM.DD)
  content TEXT NOT NULL,                -- 내용
  detail TEXT NOT NULL DEFAULT '',      -- 상세내용 (선택)
  keywords TEXT NOT NULL DEFAULT '',    -- 키워드 (공백 구분)
  amount TEXT NOT NULL DEFAULT '',      -- 계약금액 (선택)
  client TEXT NOT NULL DEFAULT '',      -- 발주처 (선택)
  is_default INTEGER NOT NULL DEFAULT 0,-- 1이면 연혁으로 지정
  sort_order INTEGER NOT NULL DEFAULT 0,-- 실적 DB 수동 정렬 순서
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_history_created ON history(created_at DESC);
CREATE INDEX idx_history_sort ON history(sort_order ASC);
