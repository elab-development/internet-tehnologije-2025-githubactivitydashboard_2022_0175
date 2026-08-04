from app_models.models import ma, UserRepoFollow

class WatchlistSchema(ma.Schema):
    class Meta:
        model = UserRepoFollow  # <--- Dodajemo ovo da povežemo sa modelom
        load_instance = True    # <--- Ovo omogućava da JSON pretvoriš nazad u Model objekat
        fields = ("user_id", "repo_id", "date_added")

watchlist_schema = WatchlistSchema()
watchlists_schema = WatchlistSchema(many=True)