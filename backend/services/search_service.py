from app_models.models import db, SearchHistory

class SearchService:
    @staticmethod
    def log_search(user_id, query, search_type):
        # Uklanjamo 'if user_id:' uslov ako želimo da logujemo i anonimne pretrage
        # ili ostavljamo, ali dodajemo DEBUG print da znamo zašto je preskočeno
        if not user_id:
            print("DEBUG: Pretraga nije sačuvana jer user_id nije prosleđen.")
            return False

        try:
            new_search = SearchHistory(
                user_id=user_id,
                query=query,
                search_type=search_type
            )
            db.session.add(new_search)
            db.session.commit()
            print(f"DEBUG: Uspešno sačuvana pretraga za user_id: {user_id}")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Greška pri logovanju pretrage (proveri da li user_id postoji u bazi): {e}")
            return False

    @staticmethod
    def get_user_history(user_id):
        # Dodajemo print da vidimo šta servis pokušava da izvuče
        print(f"DEBUG: Izvlačim istoriju za user_id: {user_id}")
        return db.session.query(SearchHistory) \
            .filter(SearchHistory.user_id == user_id) \
            .order_by(SearchHistory.timestamp.desc()) \
            .all()