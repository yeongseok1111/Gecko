// Gecko Supabase 연결 설정
// Publishable key는 브라우저에서 사용 가능하며, 데이터 보호는 Supabase RLS 정책으로 처리합니다.
const SUPABASE_URL = "https://ipmyhhkmmxjjouulzujr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_592cjYYA7SV5e_WI-RT4kw_UexfZRXw";

if (!window.supabase) {
  console.error("Supabase 라이브러리를 불러오지 못했습니다. 네트워크/CDN을 확인하세요.");
} else {
  window.geckoSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  // 연결 및 상품 개수 확인 (2단계 점검)
  (async () => {
    const { count, error } = await window.geckoSupabase
      .from("shop_products")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Gecko Supabase 연결/상품 조회 오류:", error.message);
      return;
    }

    console.log(`Gecko Supabase 연결 성공! 등록된 상품: ${count ?? 0}개`);
  })();
}
