from app_models.models import ma, SearchHistory

# Promeni ma.Schema u ma.SQLAlchemyAutoSchema
class SearchHistorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SearchHistory
        load_instance = True
        include_fk = True  # Ovo je važno da bi video user_id
        # fields opcija je sada opciona jer AutoSchema sam čita model,
        # ali možeš je ostaviti ako želiš strogu kontrolu
        fields = ("search_id", "query", "search_type", "timestamp", "user_id")

search_history_schema = SearchHistorySchema()
search_histories_schema = SearchHistorySchema(many=True)