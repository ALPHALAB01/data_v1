// 공용 변환 함수들

// 숫자만 추출
function digitsOf(raw) {
  return (String(raw || "").match(/\d/g) || []).join("");
}

// 연혁용: YY.MM 으로 변환
export function normalizeYM(raw) {
  if (!raw) return "";
  const d = digitsOf(raw);
  if (d.length === 0) return "";
  let yy = "", mm = "";
  if (d.length >= 6) { yy = d.slice(2, 4); mm = d.slice(4, 6); }
  else if (d.length === 5) {
    if (d.startsWith("19") || d.startsWith("20")) { yy = d.slice(2, 4); mm = "0" + d.slice(4, 5); }
    else { yy = d.slice(0, 2); mm = d.slice(2, 4); }
  } else if (d.length === 4) {
    if (d.startsWith("19") || d.startsWith("20")) { yy = d.slice(2, 4); mm = "01"; }
    else { yy = d.slice(0, 2); mm = d.slice(2, 4); }
  } else if (d.length === 3) { yy = d.slice(0, 2); mm = "0" + d.slice(2, 3); }
  else if (d.length === 2) { yy = d; mm = "01"; }
  else { yy = "0" + d; mm = "01"; }
  let m = parseInt(mm, 10); if (isNaN(m) || m < 1) m = 1; if (m > 12) m = 12;
  return yy + "." + String(m).padStart(2, "0");
}

// 실적용: YY.MM.DD 로 변환 (일자 없으면 01)
export function normalizeYMD(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";

  // 구분자(. - / 공백 년월일)로 나뉘어 있으면 그걸 우선 사용
  const parts = s.split(/[^\d]+/).filter(Boolean);
  if (parts.length >= 2) {
    let y = parts[0];
    let yy = y.length >= 4 ? y.slice(2, 4) : (y.length === 1 ? "0" + y : y.slice(-2));
    let m = Math.min(Math.max(parseInt(parts[1], 10) || 1, 1), 12);
    let dy = Math.min(Math.max(parseInt(parts[2] || "1", 10) || 1, 1), 31);
    return yy + "." + String(m).padStart(2, "0") + "." + String(dy).padStart(2, "0");
  }

  // 구분자 없이 숫자만 들어온 경우 자리수로 추정
  const d = digitsOf(s);
  if (d.length === 0) return "";
  let yy = "", mm = "", dd = "";
  if (d.length >= 8) { yy = d.slice(2, 4); mm = d.slice(4, 6); dd = d.slice(6, 8); }
  else if (d.length === 7) { yy = d.slice(2, 4); mm = d.slice(4, 6); dd = "0" + d.slice(6, 7); }
  else if (d.length === 6) {
    if (d.startsWith("19") || d.startsWith("20")) { yy = d.slice(2, 4); mm = d.slice(4, 6); dd = "01"; } // YYYYMM
    else { yy = d.slice(0, 2); mm = d.slice(2, 4); dd = d.slice(4, 6); }                 // YYMMDD
  } else if (d.length === 5) {
    if (d.startsWith("19") || d.startsWith("20")) { yy = d.slice(2, 4); mm = "0" + d.slice(4, 5); dd = "01"; }
    else { yy = d.slice(0, 2); mm = d.slice(2, 4); dd = "0" + d.slice(4, 5); }
  } else if (d.length === 4) {
    if (d.startsWith("19") || d.startsWith("20")) { yy = d.slice(2, 4); mm = "01"; dd = "01"; } // YYYY
    else { yy = d.slice(0, 2); mm = d.slice(2, 4); dd = "01"; }                          // YYMM
  } else if (d.length === 3) { yy = d.slice(0, 2); mm = "0" + d.slice(2, 3); dd = "01"; }
  else if (d.length === 2) { yy = d; mm = "01"; dd = "01"; }
  else { yy = "0" + d; mm = "01"; dd = "01"; }
  let m = parseInt(mm, 10); if (isNaN(m) || m < 1) m = 1; if (m > 12) m = 12;
  let dy = parseInt(dd, 10); if (isNaN(dy) || dy < 1) dy = 1; if (dy > 31) dy = 31;
  return yy + "." + String(m).padStart(2, "0") + "." + String(dy).padStart(2, "0");
}

export function normalizeKeywords(raw) {
  if (!raw) return "";
  const cleaned = String(raw).replace(/[\[\]]/g, " ");
  const arr = cleaned.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  return [...new Set(arr)].join(" ");
}

// 계약금액: 입력에서 금액을 추출해 천단위 쉼표 형식으로. 숫자 없으면 "".
// "350,000,000원", "3억5천만", "8천만", "5000만" 등 지원.
export function normalizeAmount(raw) {
  if (!raw && raw !== 0) return "";
  let s = String(raw).replace(/,/g, "").replace(/원/g, "").trim();
  if (!s) return "";

  let won = null;
  if (/[억천만백]/.test(s)) {
    won = 0;
    const eok = s.match(/(\d+(?:\.\d+)?)\s*억/);
    if (eok) won += parseFloat(eok[1]) * 1e8;
    const cheonman = s.match(/(\d+(?:\.\d+)?)\s*천\s*만/);
    if (cheonman) won += parseFloat(cheonman[1]) * 1e3 * 1e4;
    if (!cheonman) {
      const man = s.match(/(\d+(?:\.\d+)?)\s*만/);
      if (man) won += parseFloat(man[1]) * 1e4;
    }
    const baekman = s.match(/(\d+(?:\.\d+)?)\s*백\s*만/);
    if (baekman) won += parseFloat(baekman[1]) * 1e6;
    if (won <= 0) won = null;
  } else {
    const digits = s.replace(/[^\d]/g, "");
    if (digits) won = parseInt(digits, 10);
  }
  if (won === null || isNaN(won)) return "";
  return String(Math.round(won)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
