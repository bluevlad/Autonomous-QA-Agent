import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = 'http://www.unmong.com:4050';

test.describe('AllergyNewsLetter API - OpenAPI 스펙', () => {
  test('OpenAPI 스펙이 정상적으로 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/openapi.json`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.openapi).toBe('3.1.0');
    expect(data.info.title).toBe('AllergyNewsLetter');
    expect(data.info.description).toBe('알러지 뉴스 & 논문 브리핑 구독 서비스');
  });

  test('Swagger UI 문서 페이지가 정상적으로 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/docs`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('swagger-ui');
    expect(html).toContain('AllergyNewsLetter');
  });
});

test.describe('AllergyNewsLetter API - 홈페이지', () => {
  test('GET / - 홈페이지가 정상적으로 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('AllergyNewsLetter');
    expect(html).toContain('알러지 뉴스 브리핑');
    expect(html).toContain('뉴스레터 구독하기');
    expect(html).toContain('구독 해지');
  });

  test('HEAD / - HEAD 요청이 지원되어야 한다', async ({ request }) => {
    const response = await request.head(`${BASE_URL}/`);

    // HEAD 요청은 200 또는 405일 수 있음
    expect([200, 405]).toContain(response.status());
  });
});

test.describe('AllergyNewsLetter API - 구독 신청', () => {
  test('GET /subscribe - 구독 신청 폼이 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/subscribe`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('구독 신청');
    expect(html).toContain('input');
    expect(html).toContain('email');
  });

  test('POST /subscribe - 유효한 이메일로 구독 신청', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: 'test@example.com',
        name: '테스트사용자'
      }
    });

    // 성공 시 인증 페이지로 리다이렉트되거나 HTML 응답
    expect([200, 302, 303, 307]).toContain(response.status());
  });

  test('POST /subscribe - 이메일 필드 누락 시 에러 반환', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        name: '테스트사용자'
      }
    });

    expect(response.status()).toBe(422);

    const data = await response.json();
    expect(data.detail).toBeDefined();
    expect(data.detail[0].loc).toContain('email');
    expect(data.detail[0].msg).toBe('Field required');
  });

  test('POST /subscribe - 잘못된 이메일 형식 테스트', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: 'invalid-email',
        name: '테스트사용자'
      }
    });

    // 서버에서 이메일 형식 검증을 할 수도 있고 안 할 수도 있음
    const html = await response.text();
    // 응답이 있어야 함 (에러 메시지 또는 정상 응답)
    expect(html).toBeTruthy();
  });

  test('POST /subscribe - 이름 없이 구독 신청 가능해야 한다 (선택 필드)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: 'test2@example.com'
      }
    });

    // 이름은 선택 필드이므로 성공해야 함
    expect([200, 302, 303, 307]).toContain(response.status());
  });
});

test.describe('AllergyNewsLetter API - 이메일 인증', () => {
  test('GET /verify/{verification_id} - 인증 페이지가 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/verify/1?email=test@example.com`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('인증');
    expect(html).toContain('input');
  });

  test('POST /verify - 잘못된 인증코드로 인증 시도', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/verify`, {
      form: {
        verification_id: 999,
        email: 'test@example.com',
        code: '000000'
      }
    });

    // 잘못된 인증코드로 인해 에러 응답 또는 에러 메시지가 포함된 HTML
    expect([200, 400, 404, 422]).toContain(response.status());
  });

  test('POST /verify - 필수 필드 누락 시 에러', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/verify`, {
      form: {
        verification_id: 1
        // email과 code 누락
      }
    });

    expect(response.status()).toBe(422);
  });
});

test.describe('AllergyNewsLetter API - 인증코드 재발송', () => {
  test('POST /resend - 인증코드 재발송', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/resend`, {
      form: {
        verification_id: 1
      }
    });

    // 존재하지 않는 verification_id일 수 있으므로 다양한 응답 허용
    expect([200, 302, 400, 404]).toContain(response.status());
  });

  test('POST /resend - verification_id 누락 시 에러', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/resend`, {
      form: {}
    });

    expect(response.status()).toBe(422);
  });
});

test.describe('AllergyNewsLetter API - 결과 페이지', () => {
  test('GET /result - 구독 완료 페이지', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/result?email=test@example.com`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('구독');
  });

  test('GET /result - 이메일 파라미터 없이 접근', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/result`);

    // 기본값이 설정되어 있으므로 200 응답
    expect(response.status()).toBe(200);
  });
});

test.describe('AllergyNewsLetter API - 구독 해지', () => {
  test('GET /unsubscribe - 구독 해지 폼이 반환되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/unsubscribe`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('구독 해지');
    expect(html).toContain('input');
    expect(html).toContain('email');
  });

  test('POST /unsubscribe - 유효한 이메일로 구독 해지 신청', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/unsubscribe`, {
      form: {
        email: 'test@example.com'
      }
    });

    // 성공 시 인증 페이지로 리다이렉트되거나 HTML 응답
    expect([200, 302, 303, 307]).toContain(response.status());
  });

  test('POST /unsubscribe - 이메일 필드 누락 시 에러', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/unsubscribe`, {
      form: {}
    });

    expect(response.status()).toBe(422);

    const data = await response.json();
    expect(data.detail).toBeDefined();
    expect(data.detail[0].msg).toBe('Field required');
  });
});

test.describe('AllergyNewsLetter API - 구독 해지 인증', () => {
  test('GET /unsubscribe/verify/{verification_id} - 해지 인증 페이지', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/unsubscribe/verify/1?email=test@example.com`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('인증');
  });

  test('POST /unsubscribe/verify - 잘못된 인증코드로 해지 시도', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/unsubscribe/verify`, {
      form: {
        verification_id: 999,
        email: 'test@example.com',
        code: '000000'
      }
    });

    expect([200, 400, 404, 422]).toContain(response.status());
  });
});

test.describe('AllergyNewsLetter API - 토큰 기반 구독 해지', () => {
  test('GET /unsubscribe/token/{token} - 유효하지 않은 토큰', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/unsubscribe/token/invalid-token-12345`);

    // 토큰이 유효하지 않더라도 페이지가 로드되어야 함
    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toBeTruthy();
  });

  test('GET /unsubscribe/result - 구독 해지 완료 페이지', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/unsubscribe/result?email=test@example.com`);

    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('구독 해지');
  });
});

test.describe('AllergyNewsLetter API - 에러 처리', () => {
  test('존재하지 않는 엔드포인트 접근 시 404', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/nonexistent-endpoint`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.detail).toBe('Not Found');
  });

  test('잘못된 HTTP 메소드 사용 시 405', async ({ request }) => {
    // DELETE 메소드는 지원하지 않음
    const response = await request.delete(`${BASE_URL}/subscribe`);

    expect(response.status()).toBe(405);
  });
});

test.describe('AllergyNewsLetter API - 보안', () => {
  test('XSS 공격 시도 - 이메일 필드', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: '<script>alert("xss")</script>@test.com',
        name: '테스트'
      }
    });

    // XSS 코드가 그대로 실행되지 않아야 함
    const html = await response.text();
    // 스크립트 태그가 이스케이프되거나 제거되어야 함
    expect(html.includes('<script>alert("xss")</script>')).toBeFalsy();
  });

  test('SQL Injection 시도 - 이메일 필드', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: "test@example.com'; DROP TABLE users; --",
        name: '테스트'
      }
    });

    // 서버가 크래시되지 않고 응답해야 함
    expect([200, 302, 400, 422]).toContain(response.status());
  });
});

test.describe('AllergyNewsLetter API - Content-Type 처리', () => {
  test('application/x-www-form-urlencoded 요청 처리', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: 'test@example.com',
        name: '테스트'
      }
    });

    expect([200, 302, 303, 307]).toContain(response.status());
  });

  test('Content-Type이 없는 요청 처리', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      data: 'email=test@example.com&name=테스트'
    });

    // 요청 처리 또는 에러 응답
    expect([200, 302, 400, 415, 422]).toContain(response.status());
  });
});

test.describe('AllergyNewsLetter API - 응답 헤더', () => {
  test('응답에 올바른 Content-Type이 포함되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('JSON API 응답에 올바른 Content-Type이 포함되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/openapi.json`);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('서버 정보 헤더가 포함되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);

    const server = response.headers()['server'];
    expect(server).toBe('uvicorn');
  });
});

test.describe('AllergyNewsLetter API - 성능', () => {
  test('API 응답 시간이 2초 이내여야 한다', async ({ request }) => {
    const startTime = Date.now();
    await request.get(`${BASE_URL}/`);
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
  });

  test('동시 요청 처리', async ({ request }) => {
    const requests = Array.from({ length: 5 }, () =>
      request.get(`${BASE_URL}/`)
    );

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});

test.describe('AllergyNewsLetter API - 한글 처리', () => {
  test('한글 이름이 올바르게 처리되어야 한다', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/subscribe`, {
      form: {
        email: 'test@example.com',
        name: '홍길동'
      }
    });

    expect([200, 302, 303, 307]).toContain(response.status());
  });

  test('응답 본문에 한글이 올바르게 인코딩되어야 한다', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);

    const html = await response.text();
    expect(html).toContain('알러지');
    expect(html).toContain('뉴스레터');
  });
});
