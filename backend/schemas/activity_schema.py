from app_models.models import ma, Activity


class ActivitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Activity
        load_instance = True
        fields = ("activity_id", "github_event_id", "event_type", "actor_username", "timestamp", "payload", "summary", "repo_id")