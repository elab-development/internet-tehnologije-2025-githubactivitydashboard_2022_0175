from app_models.models import db, ma, Repository


# SQLAlchemyAutoSchema (umesto ma.Schema) - kod obicnog Schema
# opcije model i load_instance se tiho ignorisu, pa nisu ni radile
class RepositorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Repository
        load_instance = True
        sqla_session = db.session
        fields = ("repo_id", "full_name", "url", "last_synced_at")


repository_schema = RepositorySchema()
repositories_schema = RepositorySchema(many=True)