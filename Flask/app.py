from flask import Flask, redirect, render_template, request, session, url_for, Response, Blueprint, jsonify
import os
from werkzeug.serving import run_simple
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime 
from api.boschrexrothAPI import BoschrexrothAPI, BoschrexrothAPIConfig
from flask_socketio import SocketIO, emit
import json


# Déterminer les chemins en fonction de l'environnement
if "SNAP" in os.environ:
    # Dans le snap
    STATIC_FOLDER = os.path.join(os.environ['SNAP'], 'bin', 'Flask', 'static')
    TEMPLATE_FOLDER = os.path.join(os.environ['SNAP'], 'bin', 'Flask', 'templates')
else:
    # En développement local
    dir_path = os.path.dirname(os.path.realpath(__file__))
    STATIC_FOLDER = os.path.join(dir_path, 'static')
    TEMPLATE_FOLDER = os.path.join(dir_path, 'templates')

# Création de l'application Flask avec les bons chemins
app = Flask(__name__,
           static_folder=STATIC_FOLDER,
           template_folder=TEMPLATE_FOLDER,
           static_url_path='/sample-web/static')

#proxy
app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)

# DATABASE
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY']= "my super secret key"
# db = SQLAlchemy(app)

# class Users(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(200), nullable=False)
#     email = db.Column(db.String(120), nullable=False)
#     date_added = db.Column(db.DateTime, default=datetime.utcnow)

#     def __repr__(self):
#         return '<name %r>' % self.name
    
# # Créer les tables
# with app.app_context():
#     db.create_all()

##################### API BOSCHREXROTH ##########################


# Initialisation de l'API Bosch
config = BoschrexrothAPIConfig(
    base_url="https://192.168.1.1",
    username="boschrexroth",
    password="boschrexroth"
)
bosch_api = BoschrexrothAPI(config)

@app.route('/sample-web/api/drives', methods=['GET'])
def get_drives():
    try:
        drives = bosch_api.get_drive_name()
        return jsonify({'success': True, 'data': drives})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/sample-web/api/drives/<value>', methods=['PUT'])
def set_drive(value):
    try:
        response = bosch_api.set_drive_value(value)
        return jsonify({'success': True, 'data': response})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/sample-web/api/movement-data', methods=['GET'])
@app.route('/sample-web/api/movement-data/<data_type>', methods=['GET'])
def get_movement_data(data_type=None):
    try:
        data = bosch_api.get_data_mouvement(data_type)
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/sample-web/api/movement-data-exemples/<data_type>', methods=['GET'])
def get_movement_data_example(data_type=None):
    try:
        file_path = f"./static/data/{data_type}"
        if not data_type.endswith('.json'):
            file_path += '.json'
            
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    

##################### FRONT VISU ########################

@app.route('/sample-web')
def index():
    return render_template('index.html')

@app.route('/sample-web/working-point')
def workingpoint():
    return render_template('working-point.html')

@app.route('/sample-web/mecanique')
def page2():
    return render_template('mecanique.html')

@app.route('/sample-web/scalling')
def scalling():
    return render_template('scalling.html')

########################
# Main
########################

if __name__ == '__main__':
  

    if "SNAP_DATA" in os.environ:
        run_simple('unix://'+os.environ['SNAP_DATA']+'/package-run/sample-web/example.sock', 0, app)
        #app.run(host='0.0.0.0',debug = False, port=3125)
    else:
        app.run(host='0.0.0.0',debug = False, port=12121)

