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
    "donation": {
      "label": "Droits de donation — abattements et barèmes",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "Service-Public et Légifrance — droits de donation",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203"
      },
      "values": {
        "abattements": {
          "ami": 0,
          "arriere": 5310,
          "arriereAscendant": 100000,
          "autreParent": 1594,
          "conjoint": 80724,
          "donFamilial": 31865,
          "donLogementParDonateur": 100000,
          "enfant": 100000,
          "frere": 15932,
          "grandparent": 31865,
          "handicap": 159325,
          "neveu": 7967,
          "oncle": 1594,
          "parent": 100000,
          "petitEnfant": 100000,
          "petitNeveu": 1594
        },
        "baremeConjoint": [
          [
            8072,
            0.05
          ],
          [
            15932,
            0.1
          ],
          [
            31865,
            0.15
          ],
          [
            552324,
            0.2
          ],
          [
            902838,
            0.3
          ],
          [
            1805677,
            0.4
          ],
          [
            999999999999,
            0.45
          ]
        ],
        "baremeFreresSoeurs": {
          "seuil": 24430,
          "tauxInitial": 0.35,
          "tauxSuivant": 0.45
        },
        "baremeLigneDirecte": [
          [
            8072,
            0.05
          ],
          [
            12109,
            0.1
          ],
          [
            15932,
            0.15
          ],
          [
            552324,
            0.2
          ],
          [
            902838,
            0.3
          ],
          [
            1805677,
            0.4
          ],
          [
            999999999999,
            0.45
          ]
        ],
        "tauxAutre": 0.6,
        "tauxNeveu": 0.55
      }
    },
    "electricite": {
      "label": "Tarif réglementé de vente d’électricité — résidentiel",
      "year": 2026,
      "effectiveFrom": "2026-08-01",
      "effectiveTo": "2027-01-31",
      "verifiedOn": "2026-10-08",
      "source": {
        "label": "CRE et EDF — tarifs réglementés de vente d’électricité",
        "url": "https://www.cre.fr/documents/deliberations/tarifs-reglementes-de-vente-delectricite-en-france-metropolitaine-continentale-et-en-zones-non-interconnectees.html"
      },
      "values": {
        "base": {
          "3": {
            "abonnementAnnuel": 145.56,
            "prixKwh": 0.2001
          },
          "6": {
            "abonnementAnnuel": 190.32,
            "prixKwh": 0.2001
          },
          "9": {
            "abonnementAnnuel": 238.56,
            "prixKwh": 0.1985
          },
          "12": {
            "abonnementAnnuel": 285.12,
            "prixKwh": 0.1985
          },
          "15": {
            "abonnementAnnuel": 328.8,
            "prixKwh": 0.1985
          },
          "18": {
            "abonnementAnnuel": 373.68,
            "prixKwh": 0.1985
          },
          "24": {
            "abonnementAnnuel": 469.68,
            "prixKwh": 0.1985
          },
          "30": {
            "abonnementAnnuel": 557.64,
            "prixKwh": 0.1985
          },
          "36": {
            "abonnementAnnuel": 646.56,
            "prixKwh": 0.1985
          }
        },
        "hphc": {
          "3": {
            "abonnementAnnuel": 145.56,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "6": {
            "abonnementAnnuel": 190.32,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "9": {
            "abonnementAnnuel": 238.56,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "12": {
            "abonnementAnnuel": 285.12,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "15": {
            "abonnementAnnuel": 328.8,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "18": {
            "abonnementAnnuel": 373.68,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "24": {
            "abonnementAnnuel": 469.68,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "30": {
            "abonnementAnnuel": 557.64,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          },
          "36": {
            "abonnementAnnuel": 646.56,
            "prixHc": 0.1589,
            "prixHp": 0.2142
          }
        }
      }
    },
    "frais-de-notaire": {
      "label": "Frais d’acquisition immobilière — taux et barème des émoluments",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2028-03-31",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "impots.gouv.fr — droits de mutation immobiliers",
        "url": "https://www.impots.gouv.fr/particulier/questions/jachete-un-bien-immobilier-quaurai-je-payer-comme-frais-au-notaire"
      },
      "values": {
        "contributionSecurite": 0.001,
        "contributionSecuriteMinimum": 15,
        "tauxAncienMax": 0.0632,
        "tauxAncienPrimoMax": 0.0581,
        "tauxNeuf": 0.0071,
        "tranchesEmoluments": [
          [
            6500,
            0.0387
          ],
          [
            17000,
            0.01596
          ],
          [
            60000,
            0.01064
          ],
          [
            1000000000000,
            0.00799
          ]
        ],
        "tvaEmoluments": 0.2
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
    "ifi": {
      "label": "Impôt sur la fortune immobilière — barème 2026",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "impots.gouv.fr — calcul de l’IFI et brochure pratique 2026",
        "url": "https://www.impots.gouv.fr/particulier/calcul-de-lifi"
      },
      "values": {
        "abattementResidencePrincipale": 0.3,
        "debutBareme": 800000,
        "decote": {
          "base": 17500,
          "plafond": 1400000,
          "seuil": 1300000,
          "taux": 0.0125
        },
        "plafondDettes": {
          "seuilPatrimoine": 5000000,
          "tauxExcedentDeductible": 0.5,
          "tauxPatrimoine": 0.6
        },
        "seuilAssujettissement": 1300000,
        "tranches": [
          [
            1300000,
            0.005
          ],
          [
            2570000,
            0.007
          ],
          [
            5000000,
            0.01
          ],
          [
            10000000,
            0.0125
          ],
          [
            999999999999,
            0.015
          ]
        ]
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
    "preavis-demission": {
      "label": "Préavis de démission — règles conventionnelles vérifiées",
      "year": 2026,
      "effectiveFrom": "2026-10-09",
      "effectiveTo": "2027-10-08",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "Code du travail numérique — préavis de démission",
        "url": "https://code.travail.gouv.fr/outils/preavis-demission"
      },
      "values": {
        "rules": [
          [
            1486,
            1,
            0,
            1,
            0
          ],
          [
            1486,
            1,
            24,
            2,
            0,
            "gt"
          ],
          [
            1486,
            2,
            0,
            2,
            0
          ],
          [
            1486,
            3,
            0,
            3,
            0
          ],
          [
            1486,
            4,
            0,
            1,
            0
          ],
          [
            1672,
            1,
            0,
            1,
            0
          ],
          [
            1672,
            2,
            0,
            3,
            0
          ],
          [
            86,
            1,
            0,
            1,
            0
          ],
          [
            86,
            2,
            0,
            2,
            0
          ],
          [
            86,
            3,
            0,
            3,
            0
          ],
          [
            2098,
            1,
            0,
            1,
            0
          ],
          [
            2098,
            2,
            0,
            2,
            0
          ],
          [
            2098,
            3,
            0,
            3,
            0
          ],
          [
            2216,
            1,
            0,
            1,
            0
          ],
          [
            2216,
            2,
            0,
            2,
            0
          ],
          [
            2216,
            3,
            0,
            3,
            0
          ],
          [
            1979,
            1,
            0,
            0,
            8
          ],
          [
            1979,
            1,
            6,
            0,
            15
          ],
          [
            1979,
            1,
            24,
            1,
            0
          ],
          [
            1979,
            2,
            0,
            0,
            15
          ],
          [
            1979,
            2,
            6,
            1,
            0
          ],
          [
            1979,
            2,
            24,
            2,
            0
          ],
          [
            1979,
            3,
            0,
            1,
            0
          ],
          [
            1979,
            3,
            6,
            3,
            0
          ],
          [
            3239,
            1,
            0,
            0,
            7
          ],
          [
            3239,
            1,
            6,
            0,
            14
          ],
          [
            3239,
            1,
            24,
            1,
            0
          ]
        ]
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
        "plafondAutresPretsMultiplicateurs": [
          1.25,
          1,
          1,
          1
        ],
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
        },
        "travauxMinimumRatio": 0.25,
        "zonesAncienEligibles": {
          "A": 0,
          "B1": 0,
          "B2": 1,
          "C": 1
        }
      }
    },
    "retraite-simplifiee": {
      "label": "Retraite de base — âge légal et durée d’assurance",
      "year": 2026,
      "effectiveFrom": "2026-09-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "Assurance retraite et Légifrance — règles applicables au 1er septembre 2026",
        "url": "https://www.lassuranceretraite.fr/portail-info/home/actif/age-depart/age-depart-retraite.html"
      },
      "values": {
        "ageTauxPleinAutomatique": 67,
        "birthCohorts": [
          [
            1955,
            1,
            1957,
            12,
            744,
            166
          ],
          [
            1958,
            1,
            1960,
            12,
            744,
            167
          ],
          [
            1961,
            1,
            1961,
            8,
            744,
            168
          ],
          [
            1961,
            9,
            1961,
            12,
            747,
            169
          ],
          [
            1962,
            1,
            1962,
            12,
            750,
            169
          ],
          [
            1963,
            1,
            1963,
            12,
            753,
            170
          ],
          [
            1964,
            1,
            1964,
            12,
            753,
            170
          ],
          [
            1965,
            1,
            1965,
            3,
            753,
            170
          ],
          [
            1965,
            4,
            1965,
            12,
            756,
            171
          ],
          [
            1966,
            1,
            1966,
            12,
            759,
            172
          ],
          [
            1967,
            1,
            1967,
            12,
            762,
            172
          ],
          [
            1968,
            1,
            1968,
            12,
            765,
            172
          ],
          [
            1969,
            1,
            2100,
            12,
            768,
            172
          ]
        ],
        "decotePointParTrimestre": 0.625,
        "tauxPlein": 50,
        "trimestresMaximumDecote": 20
      }
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
    "rupture-conventionnelle": {
      "label": "Indemnité minimale de rupture conventionnelle",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-09",
      "source": {
        "label": "Service-Public — indemnité spécifique de rupture conventionnelle",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F31539"
      },
      "values": {
        "ancienneteMinMois": 0,
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
    "smic": {
      "label": "SMIC",
      "year": 2026,
      "effectiveFrom": "2026-06-01",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-09",
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
    "temps-travail": {
      "label": "Durée du travail — références légales",
      "year": 2026,
      "effectiveFrom": "2016-08-10",
      "effectiveTo": "2026-12-31",
      "verifiedOn": "2026-10-08",
      "source": {
        "label": "Service-Public — durée du travail d'un salarié du secteur privé à temps plein",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F1911"
      },
      "values": {
        "dailyMaxHours": 10,
        "referenceAnnualHours": 1607,
        "referenceMonthlyHours": 151.67,
        "referenceWeeklyHours": 35,
        "weeklyAverageMaxHours": 44,
        "weeklyMaxHours": 48
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
