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
           static_url_path='/smart-check-sizing/static')

#proxy
app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)


# Initialisation de l'API Bosch
config = BoschrexrothAPIConfig(
    base_url="https://localhost",
    username="boschrexroth",
    password="boschrexroth"
)
bosch_api = BoschrexrothAPI(config)

@app.route('/smart-check-sizing/api/drives', methods=['GET'])
def get_drives():
    try:
        drives = bosch_api.get_drive_name()
        return jsonify({'success': True, 'data': drives})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/smart-check-sizing/api/drives/<value>', methods=['PUT'])
def set_drive(value):
    try:
        response = bosch_api.set_drive_value(value)
        return jsonify({'success': True, 'data': response})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/smart-check-sizing/api/movement-data', methods=['GET'])
@app.route('/smart-check-sizing/api/movement-data/<data_type>', methods=['GET'])
def get_movement_data(data_type=None):
    try:
        data = bosch_api.get_data_mouvement(data_type)
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/smart-check-sizing/api/movement-data-exemples/<data_type>', methods=['GET'])
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

@app.route('/smart-check-sizing')
def index():
    return render_template('index.html')

@app.route('/smart-check-sizing/working-point')
def workingpoint():
    return render_template('working-point.html')

@app.route('/smart-check-sizing/mecanique')
def page2():
    return render_template('mecanique.html')

@app.route('/smart-check-sizing/scalling')
def scalling():
    return render_template('scalling.html')

@app.route('/smart-check-sizing/presentation')
def presentation():
    return render_template('presentation.html')


########################
# Main
########################

if __name__ == '__main__':
  

    if "SNAP_DATA" in os.environ:
        run_simple('unix://'+os.environ['SNAP_DATA']+'/package-run/smart-check-sizing/example.sock', 0, app)
        #app.run(host='0.0.0.0',debug = False, port=3125)
    else:
        app.run(host='0.0.0.0',debug = False, port=12121)

