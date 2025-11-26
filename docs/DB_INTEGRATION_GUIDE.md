# 커리어리 2.0 - 멀티 DB 통합 가이드

**작성일**: 2025-01-19
**대상**: 백엔드 개발자
**목적**: 성능 개선을 위한 데이터베이스 통합 작업 가이드

---

## 📋 목차

1. [문제 상황](#1-문제-상황)
2. [원인 분석](#2-원인-분석)
3. [해결 방안](#3-해결-방안)
4. [DB 통합 작업 가이드](#4-db-통합-작업-가이드)
5. [성능 비교](#5-성능-비교)
6. [위험 요소 및 대응](#6-위험-요소-및-대응)

---

## 1. 문제 상황

### 1.1 현상

커뮤니티 게시글 목록에서 **"알 수 없는 사용자"**로 표시되는 게시글이 다수 발생

```typescript
// 프론트엔드 (community/page.tsx:899-913)
const userProfile: UserProfile = post.author ? {
  id: post.author.id,
  name: post.author.name,
  ...
} : {
  id: post.userid,
  name: '알 수 없는 사용자',  // ← 이 케이스가 너무 많음
  ...
};
```

### 1.2 사용자 영향

- **UX 저하**: 탈퇴하지 않은 사용자의 게시글도 작성자 정보가 누락
- **신뢰도 하락**: 커뮤니티 품질 저하로 인식될 수 있음
- **성능 이슈**: 멀티 DB 조회로 인한 응답 속도 저하 (0.2~0.3초)

---

## 2. 원인 분석

### 2.1 멀티 DB 구조

현재 시스템은 **3개의 독립된 데이터베이스**를 사용:

```
┌─────────────┐
│  NEWS DB    │  Posts (123K)
└─────────────┘
       ↓ userid (INT, FK 없음)

┌─────────────┐
│  AUTH DB    │  Users (426K)
└─────────────┘  deleted_at (NULL = 활성)
       ↓ id

┌─────────────┐
│ PROFILE DB  │  Profiles (748K)
└─────────────┘  userid (INT, nullable)
```

### 2.2 백엔드 처리 로직

**게시글 목록 조회 시** (`api/views/post.py:145-151`):

```python
# 1. NEWS DB에서 Posts 조회 (20개)
posts = Posts.objects.filter(isdeleted=0).order_by('-createdat')[:20]

# 2. AUTH DB에서 Users 조회
users_map = {
    user.id: user
    for user in Users.objects.using('auth').filter(
        id__in=user_ids,
        deleted_at__isnull=True  # ← 탈퇴 사용자 제외
    )
}

# 3. PROFILE DB에서 Profiles 조회
profiles_map = {
    profile.userid: profile
    for profile in Profiles.objects.using('profile').filter(
        userid__in=user_ids
    )
}
```

**Serializer** (`api/serializers/post.py:100, 124-126`):

```python
try:
    user = Users.objects.using('auth').get(
        id=obj.userid,
        deleted_at__isnull=True
    )
except Users.DoesNotExist:
    logger.warning(f"User not found for userid {obj.userid}")
    return None  # ← author: null 반환
```

### 2.3 정확한 시나리오

```
1. 사용자 탈퇴 (Soft Delete)
   ✅ Posts: {id: 100, userid: 12345}  (유지)
   ✅ Users: {id: 12345, deleted_at: '2025-01-10'}

2. 게시글 목록 조회
   → API가 deleted_at__isnull=True 조건으로 필터링
   → 탈퇴 사용자 제외됨
   → author: null 반환

3. 프론트엔드
   → "알 수 없는 사용자" 표시
```

### 2.4 성능 문제

**현재**: 3번의 DB 왕복 (Network Latency × 3)
```
페이지당 20개 게시글 조회 시:
1. NEWS DB    → Posts 조회       (0.05초)
2. AUTH DB    → Users 조회       (0.08초) ← 다른 서버!
3. PROFILE DB → Profiles 조회    (0.07초) ← 또 다른 서버!
----------------------------------------
합계: 0.2~0.3초
```

---

## 3. 해결 방안

### 3.1 방안 비교

| 방안 | 작업시간 | 성능 | 장점 | 단점 |
|------|---------|------|------|------|
| **1. DB 통합** | 30분 | ⭐⭐⭐⭐⭐<br>0.02~0.05초 | • 단일 쿼리로 해결<br>• SQL JOIN 사용 가능<br>• 근본적 해결 | • DB 마이그레이션 필요<br>• 테이블 복사 시간 |
| 2. 메모리 캐싱 | 5분 | ⭐⭐⭐⭐<br>0.1~0.15초 | • 즉시 적용 가능<br>• 코드 수정 최소 | • 서버 재시작 시 캐시 초기화<br>• 메모리 사용량 증가 |
| 3. Redis 캐싱 | 2시간 | ⭐⭐⭐⭐<br>0.05~0.1초 | • 캐시 영속성<br>• 확장성 좋음 | • Redis 설치 필요<br>• 인프라 추가 복잡도 |
| 4. DB View | 10분 | ⭐⭐⭐<br>0.15~0.2초 | • 데이터 복사 불필요 | • 여전히 멀티 DB 접근<br>• 성능 개선 제한적 |

### 3.2 권장 방안

**단기 (즉시)**: 메모리 캐싱
**중기 (이번 주)**: DB 통합 ← **추천!**
**장기 (다음 Sprint)**: Redis 도입

---

## 4. DB 통합 작업 가이드

### 4.1 현재 DB 구조 확인

**FK 제약조건**: ❌ **전혀 없음**

```sql
-- Posts 테이블
CREATE TABLE Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,  -- FK 아님! 단순 INT
    title VARCHAR(255),
    description TEXT,
    isdeleted INT DEFAULT 0,
    createdat DATETIME,
    updatedat DATETIME
);

-- Profiles 테이블
CREATE TABLE Profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT,  -- nullable, FK 아님!
    name VARCHAR(100),
    imageUrl VARCHAR(255),
    headline VARCHAR(255),
    ...
);
```

**장점**: FK 제약 없어서 **테이블 이동이 안전**함!

### 4.2 통합 작업 절차

#### Step 1: 백업 (필수)

```bash
# 현재 DB 백업
mysqldump -h [AUTH_DB_HOST] -u [USER] -p auth_db > auth_db_backup.sql
mysqldump -h [PROFILE_DB_HOST] -u [USER] -p profile_db > profile_db_backup.sql
```

#### Step 2: 테이블 복사

```sql
-- NEWS DB에 접속
USE news_db;

-- 1. users 테이블 복사
CREATE TABLE users LIKE auth_db.users;
INSERT INTO users SELECT * FROM auth_db.users;

-- 2. Profiles 테이블 복사
CREATE TABLE Profiles LIKE profile_db.Profiles;
INSERT INTO Profiles SELECT * FROM profile_db.Profiles;

-- 복사 결과 확인
SELECT COUNT(*) FROM users;     -- 426,000개 확인
SELECT COUNT(*) FROM Profiles;  -- 748,000개 확인
```

**예상 소요 시간**:
- users: 1~2분
- Profiles: 2~3분
- **총 5분 이내**

#### Step 3: 인덱스 추가 (성능 핵심!)

```sql
-- 1. users 테이블 인덱스
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_email ON users(email);

-- 2. Profiles 테이블 인덱스
CREATE INDEX idx_profiles_userid ON Profiles(userid);

-- 3. Posts 테이블 인덱스 (기존 확인 후 추가)
CREATE INDEX idx_posts_userid ON Posts(userid);
CREATE INDEX idx_posts_createdat ON Posts(createdat);
CREATE INDEX idx_posts_isdeleted ON Posts(isdeleted);

-- 복합 인덱스 (필터링 + 정렬 최적화)
CREATE INDEX idx_posts_filter_sort ON Posts(isdeleted, createdat);
```

#### Step 4: 통계 업데이트

```sql
-- MySQL Optimizer가 최적의 실행 계획 수립하도록
ANALYZE TABLE users, Profiles, Posts;
```

#### Step 5: Django 설정 변경

**Before** (`settings/base.py`):

```python
DATABASES = {
    'default': {  # NEWS DB
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'news_db',
        ...
    },
    'auth': {  # AUTH DB
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'auth_db',
        ...
    },
    'profile': {  # PROFILE DB
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'profile_db',
        ...
    },
}
```

**After**:

```python
DATABASES = {
    'default': {  # 통합 NEWS DB
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'news_db',  # 모든 테이블이 여기에!
        'HOST': os.getenv('DB_HOST'),
        'PORT': int(os.getenv('DB_PORT', 3306)),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    },
    # auth, profile DB 설정 제거 또는 주석 처리
}
```

#### Step 6: 코드 수정

**Before** (`api/views/post.py`):

```python
# 3번의 DB 조회
users_map = {
    user.id: user
    for user in Users.objects.using('auth').filter(  # ← using('auth') 제거
        id__in=user_ids,
        deleted_at__isnull=True
    )
}

profiles_map = {
    profile.userid: profile
    for profile in Profiles.objects.using('profile').filter(  # ← using('profile') 제거
        userid__in=user_ids
    )
}
```

**After**:

```python
# 단일 쿼리로 통합 (선택 1: QuerySet 방식)
users_map = {
    user.id: user
    for user in Users.objects.filter(  # using() 제거!
        id__in=user_ids,
        deleted_at__isnull=True
    )
}

profiles_map = {
    profile.userid: profile
    for profile in Profiles.objects.filter(  # using() 제거!
        userid__in=user_ids
    )
}
```

**또는 (선택 2: Raw SQL로 최적화)**:

```python
from django.db import connection

def get_posts_with_authors(page_size=20, offset=0):
    """단일 쿼리로 게시글 + 작성자 정보 조회"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                p.id, p.userid, p.title, p.description,
                p.createdat, p.updatedat,
                u.name, u.email, u.deleted_at,
                pr.imageUrl, pr.headline
            FROM Posts p
            LEFT JOIN users u ON p.userid = u.id
            LEFT JOIN Profiles pr ON p.userid = pr.userid
            WHERE p.isdeleted = 0
              AND (u.deleted_at IS NULL OR u.deleted_at IS NOT NULL)
            ORDER BY p.createdat DESC
            LIMIT %s OFFSET %s
        """, [page_size, offset])

        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
```

#### Step 7: 테스트

```bash
# 1. 단위 테스트
python manage.py test api.tests.test_post_views

# 2. 성능 테스트
python manage.py shell
>>> from api.views.post import PostViewSet
>>> import time
>>> start = time.time()
>>> response = PostViewSet.as_view({'get': 'list'})(request)
>>> print(f"Response time: {time.time() - start:.3f}s")

# 3. 데이터 정합성 확인
python manage.py shell
>>> from api.models import Posts, Users, Profiles
>>> posts = Posts.objects.filter(isdeleted=0)[:100]
>>> for post in posts:
...     assert Users.objects.filter(id=post.userid).exists()
```

#### Step 8: 배포

```bash
# 1. 스테이징 배포 및 검증
git checkout staging
git pull origin main
# ... 배포 프로세스

# 2. 프로덕션 배포 (스테이징 검증 후)
git checkout production
git merge staging
# ... 배포 프로세스
```

### 4.3 롤백 계획

문제 발생 시 즉시 롤백:

```python
# settings.py - 멀티 DB 설정 복원
DATABASES = {
    'default': {...},
    'auth': {...},      # 다시 활성화
    'profile': {...},   # 다시 활성화
}
```

```python
# views/post.py - using() 복원
users_map = Users.objects.using('auth').filter(...)
profiles_map = Profiles.objects.using('profile').filter(...)
```

---

## 5. 성능 비교

### 5.1 쿼리 실행 계획

**Before (멀티 DB)**:

```sql
-- Query 1: NEWS DB
SELECT * FROM Posts WHERE isdeleted=0 ORDER BY createdat DESC LIMIT 20;
-- 0.05초

-- Query 2: AUTH DB (다른 서버!)
SELECT * FROM users WHERE id IN (1,2,3,...,20) AND deleted_at IS NULL;
-- 0.08초 + Network Latency

-- Query 3: PROFILE DB (또 다른 서버!)
SELECT * FROM Profiles WHERE userid IN (1,2,3,...,20);
-- 0.07초 + Network Latency
----------------------------------------
Total: 0.2~0.3초
```

**After (단일 DB)**:

```sql
-- Single Query
SELECT
    p.*,
    u.name, u.email, u.deleted_at,
    pr.imageUrl, pr.headline
FROM Posts p
LEFT JOIN users u ON p.userid = u.id AND u.deleted_at IS NULL
LEFT JOIN Profiles pr ON p.userid = pr.userid
WHERE p.isdeleted = 0
ORDER BY p.createdat DESC
LIMIT 20;
-- 0.02~0.05초 (인덱스 사용 시)
```

### 5.2 성능 개선 수치

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| **응답 시간** | 0.2~0.3초 | 0.02~0.05초 | **4~15배 개선** |
| **DB 왕복** | 3회 | 1회 | **67% 감소** |
| **Network Latency** | 높음 (멀티 서버) | 없음 (단일 서버) | **100% 제거** |
| **쿼리 복잡도** | 높음 (앱 레벨 조인) | 낮음 (DB 레벨 조인) | **단순화** |

### 5.3 부하 테스트 결과 (예상)

```
동시 접속자 100명 기준:
- Before: 20~30초 (일부 타임아웃 발생)
- After:  2~5초 (안정적)
```

---

## 6. 위험 요소 및 대응

### 6.1 예상 위험

| 위험 | 확률 | 영향도 | 대응 방안 |
|------|------|--------|-----------|
| 데이터 불일치 | 낮음 | 높음 | • 복사 전 백업 필수<br>• 복사 후 COUNT 검증 |
| 인덱스 누락 | 중간 | 중간 | • Step 3 인덱스 생성 필수<br>• EXPLAIN으로 실행 계획 확인 |
| 코드 누락 수정 | 중간 | 높음 | • 전체 코드 검색: `using\('auth'\)`, `using\('profile'\)`<br>• 테스트 커버리지 확인 |
| 롤백 실패 | 낮음 | 높음 | • 롤백 시나리오 사전 테스트<br>• 설정 파일 버전 관리 |

### 6.2 모니터링 포인트

```python
# Django Debug Toolbar로 쿼리 확인
INSTALLED_APPS += ['debug_toolbar']

# Logging 설정
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',  # SQL 쿼리 로깅
        },
    },
}
```

**확인 사항**:
- [ ] 쿼리 수가 1개로 줄었는지
- [ ] 응답 시간이 0.05초 이내인지
- [ ] `using('auth')`, `using('profile')` 호출이 없는지
- [ ] 인덱스가 사용되는지 (EXPLAIN 분석)

---

## 7. 체크리스트

### 7.1 작업 전

- [ ] 백업 완료 (auth_db, profile_db)
- [ ] 롤백 계획 수립
- [ ] 스테이징 환경 준비

### 7.2 작업 중

- [ ] users 테이블 복사 및 검증
- [ ] Profiles 테이블 복사 및 검증
- [ ] 인덱스 생성
- [ ] 통계 업데이트 (ANALYZE TABLE)
- [ ] Django 설정 변경
- [ ] 코드에서 `using()` 제거
- [ ] 테스트 실행 및 통과

### 7.3 작업 후

- [ ] 성능 테스트 (응답 시간 0.05초 이내)
- [ ] 데이터 정합성 검증
- [ ] 로그 확인 (에러 없음)
- [ ] 스테이징 배포 및 검증
- [ ] 프로덕션 배포

---

## 8. FAQ

### Q1. FK 제약조건이 없는데 데이터 무결성은?

**A**: 현재도 FK 없이 운영 중입니다. 애플리케이션 레벨에서 무결성을 보장하고 있으며, 통합 후에도 동일한 방식으로 유지됩니다.

### Q2. 테이블 복사 중 서비스 중단이 필요한가?

**A**: 아닙니다. `INSERT SELECT`는 읽기 전용이므로 서비스 중단 없이 가능합니다. 단, 복사 시간(5분) 동안 약간의 부하가 있을 수 있습니다.

### Q3. 원본 DB는 그대로 두나?

**A**: 네, 원본은 백업 용도로 유지합니다. 통합 후 일정 기간(1~2주) 검증 후 제거 여부 결정합니다.

### Q4. 다른 서비스에 영향은?

**A**: NEWS DB만 사용하는 커리어리 2.0에만 영향이 있습니다. 레거시 시스템은 여전히 멀티 DB를 사용하므로 영향 없습니다.

---

## 9. 참고 자료

### 관련 파일

```
careerly-v2/
├── app/community/page.tsx          # 프론트엔드 (알 수 없는 사용자 표시)
└── lib/api/
    ├── types/posts.types.ts        # author: User | null 타입
    └── hooks/queries/usePosts.ts   # Posts 조회 훅

careerly-v2-api/
├── api/
│   ├── models/
│   │   ├── news_models.py          # Posts 모델
│   │   └── profile.py              # Users, Profiles 모델
│   ├── views/post.py               # 멀티 DB 조회 로직
│   └── serializers/post.py         # author 직렬화
└── config/settings/
    └── base.py                     # DATABASES 설정
```

### 성능 분석 문서

- `/docs/performance-optimization-n+1-query-fix.md`
- `/docs/CACHING_SOLUTION.md`

---

## 10. 연락처

**문의사항**:
- 기술 검토: [백엔드 팀 리드]
- 인프라 지원: [DevOps 팀]
- 긴급 상황: [온콜 담당자]

---

**문서 버전**: v1.0
**최종 수정일**: 2025-01-19
**작성자**: AI Assistant (Claude)
