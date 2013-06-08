from peewee import *

db = SqliteDatabase('special.db', threadlocals=True)
db.connect()


class BaseModel(Model):
    class Meta:
        database = db


class Session(BaseModel):
    legislature = CharField()
    session = CharField()
    days = IntegerField(null=True)
    begin_date = DateField()
    end_date = DateField(null=True)
    topic_link = TextField(null=True)
    proclamation_link = TextField(null=True)


class Topic(BaseModel):
    session = ForeignKeyField(Session)
    call_text = TextField()
    date = DateField()

    class Meta:
        order_by = ('date',)


def create_tables():
    Session.create_table()
    Topic.create_table()


if __name__ == '__main__':
    create_tables()
