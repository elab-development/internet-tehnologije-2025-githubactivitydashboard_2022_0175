from app_models.models import db, SearchHistory

class SearchService:
    @staticmethod
    def log_search(user_id, query, search_type):
        if user_id:
            try:
                new_search = SearchHistory(user_id=user_id, query=query, search_type=search_type)
                db.session.add(new_search)
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()  # Obavezno uradi rollback ako pukne baza!
                print(f"Greška pri logovanju pretrage: {e}")
                return False
        return False

    @staticmethod
    def get_user_history(user_id):
        return SearchHistory.query.filter_by(user_id=user_id).order_by(SearchHistory.timestamp.desc()).all()