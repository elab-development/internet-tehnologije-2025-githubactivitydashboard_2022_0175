from app_models.models import db, Repository, UserRepoFollow
from datetime import datetime


class RepositoryService:
    @staticmethod
    def follow_repository(user_id, repo_data):
        """
        Logika: Proverava da li repozitorijum postoji u bazi,
        ako ne - kreira ga, a zatim povezuje korisnika sa njim.
        """
        # 1. Proveri da li repo već postoji u našoj bazi po full_name (npr. 'facebook/react')
        repo = Repository.query.filter_by(full_name=repo_data['full_name']).first()

        if not repo:
            repo = Repository(
                full_name=repo_data['full_name'],
                url=repo_data['html_url']
            )
            db.session.add(repo)
            db.session.flush()  # Dobijamo repo_id pre pravog commita

        # 2. Proveri da li korisnik već prati ovaj repo
        existing_follow = UserRepoFollow.query.filter_by(
            user_id=user_id,
            repo_id=repo.repo_id
        ).first()

        # U RepositoryService.py unutar follow_repository metode:
        if not existing_follow:
            new_follow = UserRepoFollow(user_id=user_id, repo_id=repo.repo_id)
            db.session.add(new_follow)
            db.session.commit()
            return {"message": "Successfully followed", "repo_id": repo.repo_id}, 201

        return {"message": "Already following this repository", "repo_id": repo.repo_id}, 200

    @staticmethod
    def unfollow_repository(user_id, repo_identifier):
        # 1. Prvo moramo da nađemo repo u bazi preko imena (facebook/react) ili preko GitHub ID-a
        # repo_identifier može biti string 'owner/repo' koji šaljemo sa frontenda
        repo = Repository.query.filter(
            (Repository.full_name == repo_identifier) | (Repository.repo_id == repo_identifier)
        ).first()

        if not repo:
            return False

        # 2. Sad kad imamo TAČAN repo_id iz naše baze, brišemo follow
        follow = UserRepoFollow.query.filter_by(
            user_id=user_id,
            repo_id=repo.repo_id
        ).first()

        if follow:
            db.session.delete(follow)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_user_watchlist(user_id):
        # Vraća sve repozitorijume koje određeni korisnik prati
        return db.session.query(Repository).join(UserRepoFollow).filter(
            UserRepoFollow.user_id == user_id
        ).all()