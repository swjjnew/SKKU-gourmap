import csv
from pathlib import Path

from app.database import SessionLocal, Base, engine
from app.models import Campus, Restaurant, RestaurantSummary, RestaurantTag


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


def get_or_create_campuses(db):
    campuses = [
        {
            "slug": "natural",
            "name": "성균관대학교 자연과학캠퍼스",
            "latitude": 37.293,
            "longitude": 126.974,
            "radius_m": 1500,
        },
        {
            "slug": "humanities",
            "name": "성균관대학교 인문사회캠퍼스",
            "latitude": 37.588,
            "longitude": 126.993,
            "radius_m": 1500,
        },
    ]

    for campus_data in campuses:
        campus = db.query(Campus).filter(Campus.slug == campus_data["slug"]).first()

        if not campus:
            campus = Campus(**campus_data)
            db.add(campus)

    db.commit()


def import_restaurants(db):
    file_path = DATA_DIR / "restaurants.csv"

    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")

    saved_count = 0
    skipped_count = 0

    with file_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            external_id = row["external_id"].strip()
            campus_slug = row["campus_slug"].strip()

            campus = db.query(Campus).filter(Campus.slug == campus_slug).first()

            if not campus:
                print(f"[SKIP] Campus not found: {campus_slug}")
                skipped_count += 1
                continue

            existing = (
                db.query(Restaurant)
                .filter(Restaurant.external_id == external_id)
                .first()
            )

            if existing:
                skipped_count += 1
                continue

            restaurant = Restaurant(
                external_id=external_id,
                campus_id=campus.id,
                name=row["name"].strip(),
                address=row.get("address", "").strip(),
                latitude=float(row["lat"]) if row.get("lat") else None,
                longitude=float(row["lng"]) if row.get("lng") else None,
                category=row.get("category", "").strip(),
                price_level={"Low": "저렴함", "Mid": "보통", "High": "비쌈"}.get(row.get("price_range", "").strip(), row.get("price_range", "").strip()),
                source_url=row.get("source_url", "").strip(),
                phone=row.get("phone", "").strip(),
                is_active=True,
            )

            db.add(restaurant)
            saved_count += 1

    db.commit()
    print(f"Restaurants imported: saved={saved_count}, skipped={skipped_count}")


def import_summaries(db):
    file_path = DATA_DIR / "restaurant_summaries.csv"

    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")

    saved_count = 0
    skipped_count = 0

    with file_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            restaurant_external_id = row["restaurant_external_id"].strip()

            restaurant = (
                db.query(Restaurant)
                .filter(Restaurant.external_id == restaurant_external_id)
                .first()
            )

            if not restaurant:
                print(f"[SKIP] Restaurant not found: {restaurant_external_id}")
                skipped_count += 1
                continue

            existing = (
                db.query(RestaurantSummary)
                .filter(RestaurantSummary.restaurant_id == restaurant.id)
                .first()
            )

            if existing:
                existing.summary_text = row.get("summary", "").strip()
                existing.representative_menu = row.get("representative_menu", "").strip()
                existing.mood_summary = row.get("mood_summary", "").strip()
                existing.parking_summary = row.get("parking_summary", "").strip()
                existing.waiting_summary = row.get("waiting_summary", "").strip()
                existing.average_trust_score = float(row["average_trust_score"]) if row.get("average_trust_score") else 0
                if row.get("credibility_label"):
                    existing.credibility_label = int(row["credibility_label"])
            else:
                summary = RestaurantSummary(
                    restaurant_id=restaurant.id,
                    summary_text=row.get("summary", "").strip(),
                    representative_menu=row.get("representative_menu", "").strip(),
                    mood_summary=row.get("mood_summary", "").strip(),
                    parking_summary=row.get("parking_summary", "").strip(),
                    waiting_summary=row.get("waiting_summary", "").strip(),
                    average_trust_score=float(row["average_trust_score"]) if row.get("average_trust_score") else 0,
                    credibility_label=int(row["credibility_label"]) if row.get("credibility_label") else None,
                )

                db.add(summary)

            saved_count += 1

    db.commit()
    print(f"Summaries imported: saved_or_updated={saved_count}, skipped={skipped_count}")


def import_tags(db):
    file_path = DATA_DIR / "restaurant_tags.csv"

    if not file_path.exists():
        raise FileNotFoundError(f"{file_path} does not exist.")

    saved_count = 0
    skipped_count = 0

    with file_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            restaurant_external_id = row["restaurant_external_id"].strip()

            restaurant = (
                db.query(Restaurant)
                .filter(Restaurant.external_id == restaurant_external_id)
                .first()
            )

            if not restaurant:
                print(f"[SKIP] Restaurant not found: {restaurant_external_id}")
                skipped_count += 1
                continue

            tag = RestaurantTag(
                restaurant_id=restaurant.id,
                tag_type=row["tag_type"].strip(),
                tag_value=row["tag_value"].strip(),
                confidence_score=float(row["confidence_score"]) if row.get("confidence_score") else 1.0,
            )

            db.add(tag)
            saved_count += 1

    db.commit()
    print(f"Tags imported: saved={saved_count}, skipped={skipped_count}")


def main():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        get_or_create_campuses(db)
        import_restaurants(db)
        import_summaries(db)
        import_tags(db)
        print("LLM data import completed successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()