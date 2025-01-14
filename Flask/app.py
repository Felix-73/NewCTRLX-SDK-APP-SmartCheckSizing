from flask import Flask, redirect, render_template, request, session, url_for, Response, Blueprint

import os
from werkzeug.serving import run_simple
from werkzeug.middleware.proxy_fix import ProxyFix


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

# Debug des chemins
print("Static folder:", app.static_folder)
print("Template folder:", app.template_folder)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)


########## serving functions

@app.route('/sample-web')
def index():
    return render_template('index.html')

@app.route('/sample-web/page1')
def page1():
    return render_template('page1.html')

@app.route('/sample-web/graphique')
def page2():
    return render_template('graphique.html')

##server start

if __name__ == '__main__':
  

    if "SNAP_DATA" in os.environ:
        run_simple('unix://'+os.environ['SNAP_DATA']+'/package-run/sample-web/example.sock', 0, app)
        #app.run(host='0.0.0.0',debug = False, port=3125)
    else:
        app.run(host='0.0.0.0',debug = False, port=12121)

