import { test, expect } from '@playwright/test';

/**
 * AllergyInsight API 테스트
 * 테스트 대상: http://www.unmong.com:4040/api
 */

const API_BASE_URL = 'http://www.unmong.com:4040/api';

test.describe('Health Check API 테스트', () => {
  test('GET /api/health - 서버 상태 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
  });
});

test.describe('Allergens API 테스트', () => {
  test('GET /api/allergens - 모든 알러젠 목록 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/allergens`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // 식품 알러젠 카테고리 확인
    expect(data).toHaveProperty('food');
    expect(Array.isArray(data.food)).toBe(true);
    expect(data.food.length).toBeGreaterThan(0);

    // 흡입성 알러젠 카테고리 확인
    expect(data).toHaveProperty('inhalant');
    expect(Array.isArray(data.inhalant)).toBe(true);
    expect(data.inhalant.length).toBeGreaterThan(0);
  });

  test('알러젠 데이터 구조가 올바른지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/allergens`);
    const data = await response.json();

    // 식품 알러젠 데이터 구조 확인
    const firstFoodAllergen = data.food[0];
    expect(firstFoodAllergen).toHaveProperty('code');
    expect(firstFoodAllergen).toHaveProperty('name_kr');
    expect(firstFoodAllergen).toHaveProperty('name_en');
    expect(firstFoodAllergen).toHaveProperty('category', 'food');

    // 흡입성 알러젠 데이터 구조 확인
    const firstInhalantAllergen = data.inhalant[0];
    expect(firstInhalantAllergen).toHaveProperty('code');
    expect(firstInhalantAllergen).toHaveProperty('name_kr');
    expect(firstInhalantAllergen).toHaveProperty('name_en');
    expect(firstInhalantAllergen).toHaveProperty('category', 'inhalant');
  });

  test('주요 식품 알러젠이 포함되어 있는지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/allergens`);
    const data = await response.json();

    const expectedFoodAllergens = ['peanut', 'milk', 'egg', 'wheat', 'soy', 'fish', 'shellfish', 'tree_nuts'];
    const foodAllergenCodes = data.food.map((a: any) => a.code);

    for (const expected of expectedFoodAllergens) {
      expect(foodAllergenCodes).toContain(expected);
    }
  });
});

test.describe('Papers API 테스트', () => {
  test('GET /api/papers - 논문 목록 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('GET /api/papers?query=allergy - 검색어로 논문 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers?query=allergy`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('GET /api/papers?allergen=milk - 알러젠별 논문 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers?allergen=milk`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
  });

  test('GET /api/papers/1 - 개별 논문 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // 필수 필드 확인
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('pmid');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('title_kr');
    expect(data).toHaveProperty('authors');
    expect(data).toHaveProperty('journal');
    expect(data).toHaveProperty('year');
    expect(data).toHaveProperty('abstract');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('paper_type');
    expect(data).toHaveProperty('is_verified');
    expect(data).toHaveProperty('allergen_links');
  });

  test('GET /api/papers/999999 - 존재하지 않는 논문 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/999999`);

    // 404 또는 적절한 에러 응답 확인
    expect([404, 200]).toContain(response.status());
  });

  test('논문 데이터에 알러젠 링크가 포함되어 있는지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    expect(data).toHaveProperty('allergen_links');
    expect(Array.isArray(data.allergen_links)).toBe(true);

    if (data.allergen_links.length > 0) {
      const firstLink = data.allergen_links[0];
      expect(firstLink).toHaveProperty('allergen_code');
      expect(firstLink).toHaveProperty('link_type');
      expect(firstLink).toHaveProperty('specific_item');
      expect(firstLink).toHaveProperty('relevance_score');
    }
  });
});

test.describe('Search API 테스트', () => {
  test('POST /api/search - 논문 검색 (allergen 필수)', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/search`, {
      data: {
        allergen: 'milk'
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('query');
    expect(data).toHaveProperty('papers');
    expect(Array.isArray(data.papers)).toBe(true);
  });

  test('POST /api/search - allergen 없이 요청 시 에러', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/search`, {
      data: {
        query: 'allergy'
      }
    });

    // Validation 에러로 422 반환 예상
    expect(response.status()).toBe(422);
  });

  test('검색 결과에 외부 논문이 포함되는지 확인', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/search`, {
      data: {
        allergen: 'peanut'
      }
    });

    const data = await response.json();

    expect(data).toHaveProperty('pubmed_count');
    expect(data).toHaveProperty('search_time_ms');
  });

  test('검색 결과 논문 데이터 구조 확인', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/search`, {
      data: {
        allergen: 'egg'
      }
    });

    const data = await response.json();

    if (data.papers && data.papers.length > 0) {
      const paper = data.papers[0];
      expect(paper).toHaveProperty('title');
      expect(paper).toHaveProperty('abstract');
      expect(paper).toHaveProperty('authors');
      expect(paper).toHaveProperty('source');
    }
  });
});

test.describe('API 에러 처리 테스트', () => {
  test('존재하지 않는 엔드포인트 요청', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/nonexistent`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('detail');
  });

  test('잘못된 HTTP 메서드 요청', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/search`);

    expect(response.status()).toBe(405);
  });

  test('잘못된 JSON 형식 요청', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/search`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: 'invalid json'
    });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe('API 응답 형식 테스트', () => {
  test('응답 Content-Type이 application/json인지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('한글 데이터가 올바르게 인코딩되는지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/allergens`);
    const data = await response.json();

    // 한글 알러젠 이름 확인
    const milkAllergen = data.food.find((a: any) => a.code === 'milk');
    expect(milkAllergen.name_kr).toBe('우유');
  });
});

test.describe('API 성능 테스트', () => {
  test('Health API 응답 시간이 합리적이어야 함', async ({ request }) => {
    const startTime = Date.now();

    await request.get(`${API_BASE_URL}/health`);

    const responseTime = Date.now() - startTime;

    // 1초 이내 응답
    expect(responseTime).toBeLessThan(1000);
    console.log(`Health API 응답 시간: ${responseTime}ms`);
  });

  test('Papers API 응답 시간이 합리적이어야 함', async ({ request }) => {
    const startTime = Date.now();

    await request.get(`${API_BASE_URL}/papers`);

    const responseTime = Date.now() - startTime;

    // 5초 이내 응답
    expect(responseTime).toBeLessThan(5000);
    console.log(`Papers API 응답 시간: ${responseTime}ms`);
  });

  test('Search API 응답 시간이 합리적이어야 함', async ({ request }) => {
    const startTime = Date.now();

    await request.post(`${API_BASE_URL}/search`, {
      data: {
        allergen: 'milk'
      }
    });

    const responseTime = Date.now() - startTime;

    // 외부 API 호출이 포함되므로 30초 이내 응답
    expect(responseTime).toBeLessThan(30000);
    console.log(`Search API 응답 시간: ${responseTime}ms`);
  });
});

test.describe('페이지네이션 테스트', () => {
  test('Papers API 페이지네이션 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers?page=1&size=10`);

    const data = await response.json();

    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('size');
  });

  test('페이지 크기가 적용되는지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers?size=5`);

    const data = await response.json();

    expect(data.items.length).toBeLessThanOrEqual(5);
  });
});

test.describe('데이터 무결성 테스트', () => {
  test('논문 URL이 유효한 형식인지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    if (data.url) {
      expect(data.url).toMatch(/^https?:\/\//);
    }
  });

  test('논문 연도가 유효한 범위인지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers`);
    const data = await response.json();

    for (const paper of data.items) {
      expect(paper.year).toBeGreaterThan(1900);
      expect(paper.year).toBeLessThanOrEqual(new Date().getFullYear() + 1);
    }
  });

  test('PMID 형식이 올바른지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    if (data.pmid) {
      expect(data.pmid).toMatch(/^\d+$/);
    }
  });

  test('DOI 형식이 올바른지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    if (data.doi) {
      expect(data.doi).toMatch(/^10\.\d+\//);
    }
  });
});

test.describe('알러젠 링크 타입 테스트', () => {
  test('알러젠 링크 타입이 유효한 값인지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    const validLinkTypes = ['symptom', 'emergency', 'dietary', 'substitute', 'cross_reactivity'];

    for (const link of data.allergen_links) {
      expect(validLinkTypes).toContain(link.link_type);
    }
  });

  test('relevance_score가 유효한 범위인지 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/papers/1`);
    const data = await response.json();

    for (const link of data.allergen_links) {
      expect(link.relevance_score).toBeGreaterThanOrEqual(0);
      expect(link.relevance_score).toBeLessThanOrEqual(100);
    }
  });
});
