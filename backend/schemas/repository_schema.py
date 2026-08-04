from app_models.models import ma, Repository

class RepositorySchema(ma.Schema):
    class Meta:
        # Povezujemo sa modelom iz app_models.py
        model = Repository
        # load_instance=True omogućava da Marshmallow kreira Repository objekat
        # direktno iz JSON-a, što je super za "update" ili "create" operacije
        load_instance = True
        # Polja koja šalješ ka React-u (tvoj DTO)
        fields = ("repo_id", "full_name", "url", "last_synced_at")

repository_schema = RepositorySchema()
repositories_schema = RepositorySchema(many=True)