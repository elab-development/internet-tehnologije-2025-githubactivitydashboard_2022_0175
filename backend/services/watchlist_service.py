from app_models.models import db, UserRepoFollow, Repository, Activity


class WatchlistService:
    @staticmethod
    def get_full_watchlist_details(user_id):
        """
        Vraća listu repozitorijuma koje korisnik prati zajedno sa
        osnovnim informacijama za Dashboard.
        """
        results = db.session.query(Repository, UserRepoFollow.date_added) \
            .join(UserRepoFollow, Repository.repo_id == UserRepoFollow.repo_id) \
            .filter(UserRepoFollow.user_id == user_id) \
            .all()

        watchlist_data = []
        for repo, date_added in results:
            watchlist_data.append({
                "repo_id": repo.repo_id,
                "full_name": repo.full_name,
                "url": repo.url,
                "date_followed": date_added
            })

        return watchlist_data