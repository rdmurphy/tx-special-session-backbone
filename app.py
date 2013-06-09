import os
import json
from time import time

from flask import Flask, make_response, render_template
from models import Session, Topic

api = Flask(__name__)


class DatetimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)


def response_handler(data):

    age = 60 * 60

    kwargs = {
        'cls': DatetimeEncoder,
        'separators': (',', ': '),
        'indent': 2
    }

    payload = json.dumps([i for i in data.dicts()], **kwargs)
    resp = make_response(payload)
    resp.mimetype = 'application/json'
    resp.headers.add('Cache-Control', 'max-age={0}'.format(age))
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.expires = time() + age
    return resp


@api.route('/')
def index():
    kwargs = {
        'cls': DatetimeEncoder,
        'separators': (',', ':')
    }

    sessions = Session.select()
    payload = json.dumps([i for i in sessions.dicts()], **kwargs)
    return render_template('index.html', sessions=payload)


@api.route('/sessions')
def get_sessions():
    sessions = Session.select()
    return response_handler(sessions)


@api.route('/sessions/<session_id>')
def get_session_detail(session_id):
    session = Session.select().where(Session.id == session_id)
    return response_handler(session)


@api.route('/sessions/<session_id>/topics')
def get_single_session(session_id):
    topics = Topic.select().join(Session).where(Session.id == session_id)
    return response_handler(topics)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    api.run(host="0.0.0.0", port=port, debug=True)
