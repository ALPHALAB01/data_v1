// /api/history  ->  목록 조회(GET) / 신규 생성(POST)
import { normalizeYMD, normalizeKeywords, normalizeAmount, json } from "../_lib.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, time, time_end, content, detail, keywords, amount, client, is_default, hidden_in_history, sort_order, created_at FROM history ORDER BY created_at DESC"
    ).all();
    return json({ ok: true, items: results || [] });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const content = (body.content || "").trim();
    if (!content) return json({ ok: false, error: "내용은 필수입니다." }, 400);

    // 시작 시기는 두 형식 모두 저장 (time = 시작 원본을 YMD로, 표시용 YM은 화면에서 처리)
    // time 컬럼에는 YYMMDD(시작) 기준값을, 별도로 화면에서 YM/YMD를 만들기 위해 원본 보존이 필요.
    // 단순화를 위해 time = 시작(YMD), time_end = 끝(YMD)로 저장하고,
    // 연혁 표시는 time 앞 5글자(YY.MM)를 쓰면 된다.
    const startYMD = normalizeYMD(body.time || "");
    const endYMD = normalizeYMD(body.time_end || "");
    const keywords = normalizeKeywords(body.keywords || "");
    const detail = (body.detail || "").trim();
    const amount = normalizeAmount(body.amount || "");
    const client = (body.client || "").trim();
    const isDefault = body.is_default ? 1 : 0;
    const now = Date.now();

    // 새 항목은 sort_order를 가장 뒤(큰 값)로
    let nextSort = now;

    const res = await env.DB.prepare(
      "INSERT INTO history (time, time_end, content, detail, keywords, amount, client, is_default, hidden_in_history, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(startYMD, endYMD, content, detail, keywords, amount, client, isDefault, 0, nextSort, now).run();

    return json({
      ok: true,
      item: {
        id: res.meta.last_row_id, time: startYMD, time_end: endYMD, content, detail,
        keywords, amount, client, is_default: isDefault, hidden_in_history: 0, sort_order: nextSort, created_at: now
      }
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}
