from app_models.models import ma, SearchHistory

class SearchHistorySchema(ma.Schema):
    class Meta:
        model = SearchHistory
        load_instance = True
        # Koristimo tvoja tačna polja iz relacionog modela
        fields = ("search_id", "query", "search_type", "timestamp", "user_id")

search_history_schema = SearchHistorySchema()
search_histories_schema = SearchHistorySchema(many=True)