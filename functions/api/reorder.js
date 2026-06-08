// /api/reorder  ->  실적 DB 행 순서 저장 (POST)
// body: { ids: [순서대로 정렬된 id 배열] }
import { json } from "./_lib.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (!ids.length) return json({ ok: false, error: "ids가 비었습니다." }, 400);

    // 순서대로 sort_order = 1,2,3... 부여
    const stmts = ids.map((id, i) =>
      env.DB.prepare("UPDATE history SET sort_order = ? WHERE id = ?").bind(i + 1, parseInt(id, 10))
    );
    await env.DB.batch(stmts);

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
}
