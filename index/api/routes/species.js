const express = require('express');
const router = express.Router();
const Species = require('../models/Species.js');
const Taxonomic = require('../models/Taxonomic.js');
const utils = require('../utils.js');


const vkbid_reg = /S\d{7}/;

/**
 * Get a list of all species
 * @returns an array of species object
 */
/* GET /species listing. */
router.get('/', (req, res) => {
  Species.getAll()
    .then(species => {
      res.json(species);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});


/**
 * Get a list of all species index
 * @returns an array of species index containing venomkb_in, name and annotation score
 */
/* GET /species listing. */
router.get('/index', (req, res, next) => {
  Species.find({}, { venomkb_id: 1, name: 1, annotation_score: 1 }).exec((err, species_ind) => {
    if (err) return next(err);
    res.json(species_ind);
  });
});
/**
 * Find all species that have a given pattern in their name
 * @param {Query} name full name or part of the name of the species
 * @returns the species if only one result, an array of species object in other case
 */
/* GET /species/name */
router.get('/search', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'species name not specified');
  }
  Species.getByName(req.query.name)
    .then(species => {
      res.json(species);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find all species that have a given pattern in their name
 * @param {Query} name full name or part of the name of the species
 * @returns the number of species matched
 */
/* GET /species/name */
router.get('/search', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'species name not specified');
  }
  Species.getByName(req.query.name)
    .then(species => {
      res.json(species.length);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find a species given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the species
 * @returns the species
 */
/* GET /species/id */
router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'species id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    Species.getByVenomKBId(req.params.id, req.query.populate)
      .then(species => {
        res.json(species);
      })
      .catch();
  } else {
    Species.getById(req.params.id, req.query.populate)
      .then(species => {
        res.json(species);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});

/**
 * Create new species
 * @param {Body} name
 * @param {Body} description
*/
router.post('/', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.body.name) {
    return utils.sendStatusMessage(res, 400, 'The name field is empty');
  }
  if (!req.body.venomkb_id) {
    return utils.sendStatusMessage(res, 400, 'The venomkb_id field is empty');
  }
  if (!req.body.venom_ref) {
    return utils.sendStatusMessage(res, 400, 'The venom_ref field is empty');
  }
  if (!req.body.venom.name) {
    return utils.sendStatusMessage(res, 400, 'The venom name field is empty');
  }
  if (!req.body.annotation_score) {
    return utils.sendStatusMessage(res, 400, 'The annotation score field is empty');
  }
  if (!req.body.venom.proteins) {
    return utils.sendStatusMessage(res, 400, 'The venom protein field is empty');
  }

  return Species.getByVenomKBId(req.body.venomkb_id)
    .then(species => {
      if (species) {
        return Promise.reject({ message: 'venomkb_id already exists' });
      }
      return Promise.resolve();
    })
    .then(() => {
      // Create a new species
      var new_species = {
        name: req.body.name,
        lastUpdated: req.body.lastUpdated,
        venomkb_id: req.body.venomkb_id,
        common_name: req.body.common_name,
        venom_ref: req.body.venom_ref,
        annotation_score: req.body.annotation_score,
        'venom.name': req.body.venom.name,
        species_image_url: req.species_image_url
      };
      return Species.add(new_species);
    })
    .then((new_species) => {
      // add taxonomic lineage
      if (req.body.taxonomic_lineage) {
        return new_species.addTaxonomic(req.body.taxonomic_lineage);
      } else {
        return Promise.resolve(new_species);
      }
    })
    .then((new_species) => {
      // add venom
      if (req.body.venom) {
        return new_species.addVenom(req.body.venom);
      } else {
        return Promise.resolve(new_species);
      }
    })
    .then((new_species) => {
      // add out links
      if (req.body.out_links) {
        return new_species.addOutLinks(req.body.out_links);
      } else {
        return Promise.resolve(new_species);
      }
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/**
 * Update a species
 * @param {Body} name
 * @param {Body} description
*/
router.post('/update/:id', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.body.name) {
    return utils.sendStatusMessage(res, 400, 'The name field is empty');
  }
  if (!req.body.venomkb_id) {
    return utils.sendStatusMessage(res, 400, 'The venomkb_id field is empty');
  }
  if (!req.body.venom_ref) {
    return utils.sendStatusMessage(res, 400, 'The venom_ref field is empty');
  }
  if (!req.body.venom.name) {
    return utils.sendStatusMessage(res, 400, 'The venom name field is empty');
  }
  if (!req.body.annotation_score) {
    return utils.sendStatusMessage(res, 400, 'The annotation score field is empty');
  }
  if (!req.body.venom.proteins) {
    return utils.sendStatusMessage(res, 400, 'The venom protein field is empty');
  }

  // Check if the species exists
  return Species.getByVenomKBId(req.body.venomkb_id)

    .then(species => {

      if (!species) {
        return Promise.reject({ message: 'Species not found, cannot update a species that doesn\'t exist' });
      }
    })
    .then(() => {

      // Create a new protein
      var new_species = {
        name: req.body.name,
        lastUpdated: req.body.lastUpdated,
        venomkb_id: req.body.venomkb_id,
        common_name: req.body.common_name,
        venom_ref: req.body.venom_ref,
        annotation_score: req.body.annotation_score,
        'venom.name': req.body.venom.name,
        species_image_url: req.species_image_url
      };
      return Species.update(req.body.venomkb_id, new_species);
    })
    .then((new_species) => {

      // update taxonomic lineage
      if (req.body.taxonomic_lineage) {
        return new_species.updateTaxonomic(req.body.taxonomic_lineage);
      } else {
        return new_species.updateTaxonomic([]);
      }
    })
    .then((new_species) => {
      // update venom
      if (req.body.venom) {
        return new_species.updateVenom(req.body.venom);
      } else {
        return Promise.resolve(new_species);
      }
    })
    .then((new_species) => {
      // add out links
      if (req.body.out_links) {
        return new_species.updateOutLinks(req.body.out_links);
      } else {
        return Promise.resolve(new_species);
      }
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/* GET /species/index */
router.get('/index', (req, res, next) => {
  species.find({}, { venomkb_id: 1, name: 1 }).exec((err, species_ind) => {
    if (err) return next(err);
    res.json(species_ind);
  });
});

/**
 * Delete a species
 * @param {Query} id id of the species to delete
*/
router.delete('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'Cannot delete without a species id');
  }
  return Species.getById(req.params.id)
    .then((species) => {
      if (species.taxonomic_lineage) {
        const promises = [];
        for (const taxonomic of species.taxonomic_lineage) {
          promises.push(Taxonomic.delete(taxonomic._id));
        }
        return Promise.all(promises);
      }
      return Promise.resolve(species);
    })
    .then(species => {
      return Species.delete(req.params.id);
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      utils.sendErrorMessage(res, err);
    });
});

module.exports = router;
