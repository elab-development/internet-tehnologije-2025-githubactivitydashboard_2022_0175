from app_models.models import db, Activity


class ActivityService:
    @staticmethod
    def save_github_activities(repo_id, github_data):
        """
        Prima listu događaja sa GitHub-a i čuva ih u bazu.
        github_data je lista rečnika (JSON response sa GitHub API-ja).
        """
        saved_activities = []
        for event in github_data:
            # Proveravamo da li ovaj event već postoji u bazi (da ne dupliramo)
            existing = Activity.query.filter_by(github_event_id=str(event['id'])).first()
            if not existing:
                new_activity = Activity(
                    github_event_id=str(event['id']),
                    event_type=event['type'],
                    actor_username=event['actor']['login'],
                    payload=event,  # Čuvamo ceo JSON odgovor
                    summary=f"{event['actor']['login']} performed {event['type']}",
                    repo_id=repo_id
                )
                db.session.add(new_activity)
                saved_activities.append(new_activity)

        db.session.commit()
        return saved_activities

    @staticmethod
    def get_activities_by_repo(repo_id):
        return Activity.query.filter_by(repo_id=repo_id).order_by(Activity.timestamp.desc()).all()

