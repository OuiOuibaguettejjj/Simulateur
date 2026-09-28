# Décisions techniques

## RSA : moteur séparé de l'interface
Le moteur RSA est placé dans `public/rsa.js` afin de séparer les règles métier du HTML et de faciliter les contrôles et futures mises à jour réglementaires.

## Ressources sur trois mois
L'interface demande trois montants mensuels afin de représenter la période de référence et d'éviter un calcul basé sur un seul mois.

## Pas de stockage serveur
Les données saisies sont traitées côté navigateur et ne sont pas envoyées à un endpoint applicatif dédié.

## MEP
Aucune mise en production n'est effectuée dans le cadre de cette implémentation initiale.
