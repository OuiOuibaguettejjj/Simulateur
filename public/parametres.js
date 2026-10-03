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
    "frais-kilometriques": {
      "label": "Barème kilométrique (voitures)",
      "year": 2026,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-10-03",
      "source": {
        "label": "Service-Public — frais kilométriques",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/R3080"
      },
      "values": {
        "majorationElectrique": 1.2,
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
    "rsa": {
      "label": "RSA",
      "year": 2026,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": "2027-03-31",
      "verifiedOn": "2026-09-28",
      "source": {
        "label": "Service-Public — RSA (demandeur de 25 ans et plus)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F19778"
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
