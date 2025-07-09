# Smart check sizing app
## Entrevue
![Alt Text](ReadmePic/demo.gif)

## Objectifs de cette application 

* **Faire de la maintenance préventive**. Les moteurs qui sont vendus par Bosch Rexroth sont dimensionnés en interne via indrasize. Cependant, il n'y a pas encore la possibilité sur la plateforme ctrlX AUTOMATION de pouvoir vérifier le bon dimensionnement des moteurs une fois installés. Cette application vient donc répondre à ce besoin en mesurant le point de fonctionnement d'un couple servo-entraînement. Pour plus d'explications théoriques sur le calcul du point de fonctionnement, je vous renvoie à mon rapport d'alternance 2024.

* **Servir de démo et de use case pour des clients.** Dans l'onglet ```présentation``` de cette app, vous trouverez les slides utiles pour présenter le sdk à travers cette application.

## Sa structure 
![Alt Text](ReadmePic/presentation2.png)
Cette app contient des pages web hebergées en local. La partie back end est gérée par flask. La connexion vers la datalayer se fait en rest API via ma class BoschrexrothAPI qui se trouve dans [Flask/api/boschrexrothAPI.py](Flask/api/boschrexrothAPI.py)

```
Flask
├── api
│   └── boschrexrothAPI.py    // Fournit les requêtes restAPI client 
├── app.py    // notre main avec flask
├── static
│   ├── bootstrap-5.0.2-dist    // Bibliothèque front-end
│   │   ├── css
│   │   └── js
│   ├── css
│   │   ├── presentation.css
│   │   ├── scalling.css
│   │   ├── styles.css
│   │   └── swiper-bundle.min.css
│   ├── data
│   │   ├── MS2N03.json   // Courbes max fournies par indrasize
│   │   ├── exemple1.json    // points de mouvement enregistrés pour démo
│   │   ├── exemple2.json
│   │   ├── exemple3.json
│   │   ├── exemple4.json
│   ├── image
│   │   ├── Diapositive1.PNG    // slides pour la présentation intégrée
│   │   ├── Diapositive2.PNG
│   │   ├── Diapositive3.PNG
│   │   ├── Diapositive4.PNG
│   │   ├── Diapositive5.PNG
│   │   ├── Diapositive6.PNG
│   │   ├── Diapositive7.PNG
│   │   ├── Diapositive8.PNG
│   │   ├── Diapositive9.PNG
│   │   └── scalling.png    // Image pour paramètrer le drive
│   └── js
│       ├── accueil    // js associé à l'acceuil et scalling
│       ├── chart.js  // bibliothèque graphique
│       ├── chartjs-plugin-zoom.min.js // bibliothèque graphique
│       ├── mecanique-check // js associé à la mécanique
│       ├── swiper-bundle.min.js // bibliothèque graphique
│       └── working-point   // js associé au working point
└── templates    // pages html 
    ├── base.html
    ├── index.html
    ├── mecanique.html
    ├── navbar.html
    ├── presentation.html
    ├── scalling.html
    └── working-point.html
```
## Mode démo et mode Réel

![Alt Text](ReadmePic/modeDemo.png)

Pour utiliser cette application, il faut récupérer les données de couple, position et vitesse. Dans l'application, j'ai déja enregistré 4 cycles de mouvement dans [/Flask/static/data](Flask/static/data).
Vous pouvez les utiliser et constater sur les autres pages les impacts que les cycles ont sur le point de fonctionnement et sur la mécanique. Si vous voulez utiliser l'application dans un cas concret, il va vous falloir télécharger une deuxième application [Sampler-Smart-check-sizing](https://github.com/Felix-73/CTRLX-SDK-APP-Sampler-Smart-check-sizing) 
Cette application fonctionne en paire avec celle-ci et c'est elle qui fera l'aquisition des données remontées en ethercat.

![alt text](ReadmePic/acquisition.png)


## Comment la build 
- Git clone 
- ```chmod 755 -R *```
* ```./build-snap-amd64.sh``` ou ```./build-snap-arm64.sh```


## Liens utiles 
[Cours sur flask Openclassrooms](https://openclassrooms.com/fr/courses/4425066-concevez-un-site-avec-flask)

[Video sur snapcraft](https://www.youtube.com/watch?v=BEp_l2oUcD8)

[Prendre une pause](https://pointerpointer.com/)


