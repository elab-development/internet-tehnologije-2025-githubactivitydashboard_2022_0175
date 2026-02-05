from app_models.models import db, UserRepoFollow, Repository, Activity


class WatchlistService:
    @staticmethod
    def get_full_watchlist_details(user_id):
        """
        Vraća listu repozitorijuma koje korisnik prati zajedno sa
        osnovnim informacijama za Dashboard.
        """
        follows = UserRepoFollow.query.filter_by(user_id=user_id).all()
        watchlist_data = []

        for follow in follows:
            repo = Repository.query.get(follow.repo_id)
            watchlist_data.append({
                "repo_id": repo.repo_id,
                "full_name": repo.full_name,
                "url": repo.url,
                "date_followed": follow.date_added
            })

        return watchlist_data