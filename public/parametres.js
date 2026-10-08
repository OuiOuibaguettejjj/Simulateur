/* Fichier généré par scripts/generate-params.mjs à partir de data/parametres.json. Ne pas modifier à la main. */
(function (root) {
  function freeze(o) {
    if (o && typeof o === "object" && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { freeze(o[k]); });
    }
    return o;
  }
  var SETS = freeze({
    "capacite-emprunt": {
      "label": "Cadre HCSF — capacité d'emprunt immobilier",
      "year": 2026,
      "effectiveFrom": "2022-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-07",
      "source": {
        "label": "HCSF — conditions d’octroi de crédits immobiliers",
        "url": "https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers"
      },
      "values": {
        "maturiteMax": 25,
        "tauxEffortMax": 35
      }
    },
    "frais-kilometriques": {
      "label": "Barème kilométrique",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-07",
      "source": {
        "label": "Service-Public — frais kilométriques",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/R3080"
      },
      "values": {
        "cyclomoteur": {
          "auDela": 0.198,
          "forfaitMilieu": 711,
          "jusqua3000": 0.315,
          "milieu": 0.079
        },
        "cyclomoteurElectrique": {
          "auDela": 0.238,
          "forfaitMilieu": 853,
          "jusqua3000": 0.378,
          "milieu": 0.095
        },
        "majorationElectrique": 1.2,
        "motoPalier1": 3000,
        "motoPalier2": 6000,
        "motoParCV": {
          "6": {
            "auDela": 0.343,
            "forfaitMilieu": 1583,
            "jusqua3000": 0.606,
            "milieu": 0.079
          },
          "1-2": {
            "auDela": 0.248,
            "forfaitMilieu": 891,
            "jusqua3000": 0.395,
            "milieu": 0.099
          },
          "3-5": {
            "auDela": 0.275,
            "forfaitMilieu": 1158,
            "jusqua3000": 0.468,
            "milieu": 0.082
          }
        },
        "motoParCVElectrique": {
          "6": {
            "auDela": 0.412,
            "forfaitMilieu": 1900,
            "jusqua3000": 0.727,
            "milieu": 0.095
          },
          "1-2": {
            "auDela": 0.298,
            "forfaitMilieu": 1069,
            "jusqua3000": 0.474,
            "milieu": 0.119
          },
          "3-5": {
            "auDela": 0.33,
            "forfaitMilieu": 1390,
            "jusqua3000": 0.562,
            "milieu": 0.098
          }
        },
        "palier1": 5000,
        "palier2": 20000,
        "parCV": {
          "3": {
            "auDela": 0.37,
            "forfaitMilieu": 1065,
            "jusqua5000": 0.529,
            "milieu": 0.316
          },
          "4": {
            "auDela": 0.407,
            "forfaitMilieu": 1330,
            "jusqua5000": 0.606,
            "milieu": 0.34
          },
          "5": {
            "auDela": 0.427,
            "forfaitMilieu": 1395,
            "jusqua5000": 0.636,
            "milieu": 0.357
          },
          "6": {
            "auDela": 0.447,
            "forfaitMilieu": 1457,
            "jusqua5000": 0.665,
            "milieu": 0.374
          },
          "7": {
            "auDela": 0.47,
            "forfaitMilieu": 1515,
            "jusqua5000": 0.697,
            "milieu": 0.394
          }
        }
      }
    },
    "impot-sur-le-revenu": {
      "label": "Impôt sur le revenu — barème 2026",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-07",
      "source": {
        "label": "impots.gouv.fr — calcul de l'impôt 2026 sur les revenus 2025",
        "url": "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/21-calcul_impot_369a382.pdf"
      },
      "values": {
        "brackets": [
          [
            11600,
            0
          ],
          [
            29579,
            0.11
          ],
          [
            84577,
            0.3
          ],
          [
            181917,
            0.41
          ],
          [
            999999999,
            0.45
          ]
        ],
        "decote": {
          "couple": {
            "base": 1483,
            "rate": 0.4525,
            "threshold": 3277
          },
          "single": {
            "base": 897,
            "rate": 0.4525,
            "threshold": 1982
          }
        },
        "familyQuotientCap": 1807
      }
    },
    "indemnite-licenciement": {
      "label": "Indemnité légale de licenciement",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-07",
      "source": {
        "label": "Service-Public — indemnité de licenciement du salarié en CDI",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F987"
      },
      "values": {
        "ancienneteMinMois": 8,
        "inaptitudeProfessionnelle": {
          "multiplicateur": 2
        },
        "moisParAnnee": 12,
        "palierAnnees": 10,
        "tauxApresPalier": {
          "denominateur": 3,
          "numerateur": 1
        },
        "tauxAvantPalier": {
          "denominateur": 4,
          "numerateur": 1
        }
      }
    },
    "prime-activite": {
      "label": "Prime d’activité",
      "year": 2026,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-07",
      "source": {
        "label": "CAF — évolution de la prime d’activité en 2026",
        "url": "https://www.caf.fr/allocataires/actualites/actualites-nationales/la-prime-d-activite-augmente-en-2026"
      },
      "values": {
        "activityRate": 0.5985,
        "additionalDependent": 255.31,
        "base": 638.28,
        "coupleAmounts": [
          957.42,
          1148.9,
          1340.39
        ],
        "singleAmounts": [
          638.28,
          957.42,
          1148.9
        ]
      }
    },
    "ptz": {
      "label": "PTZ — prêt à taux zéro",
      "year": 2026,
      "effectiveFrom": "2025-04-01",
      "effectiveTo": "2027-12-31",
      "verifiedOn": "2026-10-08",
      "source": {
        "label": "Service-Public et Légifrance — PTZ",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F10871"
      },
      "values": {
        "coefficientsFamiliaux": [
          1,
          1.5,
          1.8,
          2.1,
          2.4
        ],        "plafondAutresPretsMultiplicateurs": [
          1.25,
          1,
          1,
          1
        ],
        "durees": {
          "1": {
            "defer": 10,
            "repay": 15,
            "total": 25
          },
          "2": {
            "defer": 8,
            "repay": 12,
            "total": 20
          },
          "3": {
            "defer": 2,
            "repay": 13,
            "total": 15
          },
          "4": {
            "defer": 0,
            "repay": 10,
            "total": 10
          }
        },
        "plafondsOperation": {
          "A": [
            150000,
            225000,
            270000,
            315000,
            360000
          ],
          "B1": [
            135000,
            202500,
            243000,
            283500,
            324000
          ],
          "B2": [
            110000,
            165000,
            198000,
            231000,
            264000
          ],
          "C": [
            100000,
            150000,
            180000,
            210000,
            240000
          ]
        },
        "plafondsRessources": {
          "A": [
            49000,
            73500,
            88200,
            102900,
            117600,
            132300,
            147000,
            161700
          ],
          "B1": [
            34500,
            51750,
            62100,
            72450,
            82800,
            93150,
            103500,
            113850
          ],
          "B2": [
            31500,
            47250,
            56700,
            66150,
            75600,
            85050,
            94500,
            103950
          ],
          "C": [
            28500,
            42750,
            51300,
            59850,
            68400,
            76950,
            85500,
            94050
          ]
        },
        "quotites": {
          "ancien": [
            0.5,
            0.4,
            0.4,
            0.2
          ],
          "collectif": [
            0.5,
            0.4,
            0.4,
            0.2
          ],
          "individuel": [
            0.3,
            0.2,
            0.2,
            0.1
          ]
        },
        "tranches": {
          "A": [
            25000,
            31000,
            37000,
            49000
          ],
          "B1": [
            21500,
            26000,
            30000,
            34500
          ],
          "B2": [
            18000,
            22500,
            27000,
            31500
          ],
          "C": [
            15000,
            19500,
            24000,
            28500
          ]
        }
      
        "travauxMinimumRatio": 0.25,
        "zonesAncienEligibles": {
          "A": 0,
          "B1": 0,
          "B2": 1,
          "C": 1
        },}
    },
    "rsa": {
      "label": "RSA",
      "year": 2026,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-06",
      "source": {
        "label": "CAF — barème RSA",
        "url": "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-revenu-de-solidarite-active"
      },
      "values": {
        "base": 651.69,
        "childIncrease": 260.68,
        "coupleAmounts": [
          977.54,
          1173.05,
          1368.56,
          1629.24
        ],
        "coupleChildIncrease": 195.51,
        "housing": {
          "one": 78.2,
          "threePlus": 193.55,
          "two": 156.41
        },
        "majorationBase": 836.85,
        "majorationChildIncrease": 278.95,
        "singleAmounts": [
          651.69,
          977.54,
          1173.05,
          1433.73
        ],
        "youngActiveHours": 3214
      }
    },
    "smic": {
      "label": "SMIC",
      "year": 2026,
      "effectiveFrom": "2026-06-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-03",
      "source": {
        "label": "Service-Public — SMIC",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300"
      },
      "values": {
        "mayotte": {
          "annuelBrut35": 17399.2,
          "horaireBrut": 9.56,
          "mensuelBrut35": 1449.93
        },
        "metropole": {
          "annuelBrut35": 22404.2,
          "horaireBrut": 12.31,
          "mensuelBrut35": 1867.02,
          "netHoraireIndicatif": 9.74,
          "netMensuel35Indicatif": 1477.93
        }
      }
    },
    "tva": {
      "label": "TVA — principaux taux en France métropolitaine",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-08",
      "source": {
        "label": "Ministère de l’Économie — taux de TVA",
        "url": "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/tva-quels-sont-les-taux-de-votre-quotidien"
      },
      "values": {
        "rates": {
          "intermediaire": 10,
          "normal": 20,
          "particulier": 2.1,
          "reduit": 5.5
        }
      }
    }
  });
  root.Parametres = {
    ids: function () { return Object.keys(SETS); },
    get: function (id) {
      if (!Object.prototype.hasOwnProperty.call(SETS, id)) throw new Error("Paramètres réglementaires inconnus : " + id);
      return SETS[id];
    },
    isEffective: function (id, asOf) {
      var set = this.get(id);
      var day = asOf || new Date().toISOString().slice(0, 10);
      return day >= set.effectiveFrom && day <= set.effectiveTo;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
