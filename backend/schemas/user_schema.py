from app_models.models import db, ma, User
from marshmallow import fields


# Mora biti SQLAlchemyAutoSchema da bi "pročitao" polja iz baze
class UserSchema(ma.SQLAlchemyAutoSchema):
    password = fields.String(load_only=True)

    class Meta:
        model = User
        load_instance = True
        # sqla_session pomaže Marshmallow-u da se poveže sa bazom
        sqla_session = db.session
        # Fields navodiš samo ako želiš da OGRANIČIŠ šta se vidi
        fields = ("user_id", "username", "email", "role", "password")


user_schema = UserSchema()
users_schema = UserSchema(many=True)