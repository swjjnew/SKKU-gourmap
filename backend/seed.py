from app.database import SessionLocal, Base, engine
from app.models import Campus, Restaurant, RestaurantSummary, RestaurantTag

Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(Campus).count() == 0:
    natural = Campus(
        slug="natural",
        name="성균관대학교 자연과학캠퍼스",
        latitude=37.293,
        longitude=126.974,
        radius_m=1500,
    )

    humanities = Campus(
        slug="humanities",
        name="성균관대학교 인문사회캠퍼스",
        latitude=37.588,
        longitude=126.993,
        radius_m=1500,
    )

    db.add_all([natural, humanities])
    db.commit()

    r1 = Restaurant(
        external_id="sample_restaurant_001",
        campus_id=natural.id,
        name="예시 파스타집",
        address="경기도 수원시 장안구 예시로 1",
        latitude=37.294,
        longitude=126.975,
        category="양식",
        price_level="보통",
        phone="031-000-0001",
        source_url="https://place.map.kakao.com/example1",
        is_active=True,
    )

    r2 = Restaurant(
        external_id="sample_restaurant_002",
        campus_id=natural.id,
        name="예시 국밥집",
        address="경기도 수원시 장안구 예시로 2",
        latitude=37.295,
        longitude=126.976,
        category="한식",
        price_level="저렴함",
        phone="031-000-0002",
        source_url="https://place.map.kakao.com/example2",
        is_active=True,
    )

    db.add_all([r1, r2])
    db.commit()

    s1 = RestaurantSummary(
        restaurant_id=r1.id,
        summary_text="데이트 분위기와 파스타 언급이 많은 식당입니다.",
        representative_menu="파스타|스테이크",
        mood_summary="데이트나 친구 모임에 적합하다는 언급이 많습니다.",
        parking_summary="주차 가능 여부에 대한 언급은 적습니다.",
        waiting_summary="저녁 시간대 웨이팅 언급이 일부 있습니다.",
        average_trust_score=82.5,
    )

    s2 = RestaurantSummary(
        restaurant_id=r2.id,
        summary_text="가격이 저렴하고 든든한 한 끼 식사로 적합한 식당입니다.",
        representative_menu="국밥|수육",
        mood_summary="혼밥이나 빠른 식사에 적합합니다.",
        parking_summary="주차 관련 언급은 부족합니다.",
        waiting_summary="점심 시간대 혼잡할 수 있습니다.",
        average_trust_score=78.0,
    )

    db.add_all([s1, s2])
    db.commit()

    tags = [
        RestaurantTag(
            restaurant_id=r1.id,
            tag_type="mood",
            tag_value="데이트",
            confidence_score=0.9,
        ),
        RestaurantTag(
            restaurant_id=r1.id,
            tag_type="food",
            tag_value="파스타",
            confidence_score=0.95,
        ),
        RestaurantTag(
            restaurant_id=r1.id,
            tag_type="price",
            tag_value="보통",
            confidence_score=0.8,
        ),
        RestaurantTag(
            restaurant_id=r2.id,
            tag_type="food",
            tag_value="국밥",
            confidence_score=0.95,
        ),
        RestaurantTag(
            restaurant_id=r2.id,
            tag_type="price",
            tag_value="저렴함",
            confidence_score=0.9,
        ),
        RestaurantTag(
            restaurant_id=r2.id,
            tag_type="purpose",
            tag_value="혼밥",
            confidence_score=0.85,
        ),
    ]

    db.add_all(tags)
    db.commit()

    print("Seed data inserted successfully.")

else:
    print("Seed data already exists.")

db.close()