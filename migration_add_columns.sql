-- 이미 데이터가 있는 기존 DB에 새 컬럼만 추가할 때 사용하세요.
-- (schema.sql은 테이블을 새로 만들어 기존 데이터가 지워집니다.)
-- Cloudflare D1 콘솔에서 아래를 한 줄씩(또는 통째로) 실행하세요.
-- 이미 is_default가 있다면 그 줄은 빼고 실행하세요.

ALTER TABLE history ADD COLUMN time_end TEXT NOT NULL DEFAULT '';
ALTER TABLE history ADD COLUMN detail TEXT NOT NULL DEFAULT '';
ALTER TABLE history ADD COLUMN amount TEXT NOT NULL DEFAULT '';
ALTER TABLE history ADD COLUMN client TEXT NOT NULL DEFAULT '';
ALTER TABLE history ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
