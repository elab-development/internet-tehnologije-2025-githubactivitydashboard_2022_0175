from app_models.models import db, ma, UserRepoFollow


class WatchlistSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UserRepoFollow
        load_instance = True
        include_fk = True  # obavezno - oba polja su strani kljucevi
        sqla_session = db.session
        fields = ("user_id", "repo_id", "date_added")


watchlist_schema = WatchlistSchema()
watchlists_schema = WatchlistSchema(many=True)