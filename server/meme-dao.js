'use strict';

/* Data Access Object (DAO) module for accessing tasks */

const db = require('./db');

// ** FILTER DEFINITIONS AND HELPER FUNCTIONS **
const filters = {
  'all': { label: 'All', id: 'filter-all', filterFn: () => true },
  'public': { label: 'Public', id: 'filter-public', filterFn: m => m.private == false }
};

// get all templates
exports.listTemplates = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM templates';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const templates = rows.map((t) => ({ template_id: t.id, name: t.name, box_counts: t.box_counts, url: t.url }));
      resolve(templates);
    });
  });
};

// get all memes and filter them 
exports.listMemes = (filter) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT m.id, m.title, m.template_id, m.text1, m.text2, m.text3, m.color, m.shadow, m.font, t.url, m.private, u.name as username, m.user_id FROM memes as m, templates as t, users as u WHERE m.template_id==t.id AND u.id==m.user_id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const memes = rows.map((m) => {
        return Object.assign({}, m); // create a new object with the properties of m
      });
      if (filter && filters[filter]) // if you selected a valid filter      
        resolve(memes.filter(filters[filter].filterFn)); // resolve the filtered list of memes
      else
        resolve(memes.filter(filters['public'].filterFn)); // resolve the public list of memes
    });
  });
};


// get the meme identified by {id}
exports.getMeme = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM memes WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      const meme = { ...row };
      resolve(meme);
    });
  });
};


// add a new meme (it is used also to copy a meme)
// the meme id is added automatically by the DB, and it is returned as result
exports.createMeme = (meme) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO memes (title, template_id, font, user_id, private, color, text1, text2, text3, shadow) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [meme.title, meme.template_id, meme.font, meme.user_id, meme.private, meme.color, meme.text1, meme.text2, meme.text3, meme.shadow], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve((this.lastID));
    });
  });
};

// delete an existing meme
exports.deleteMeme = (user, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM memes WHERE id = ? and user_id = ?';
    db.run(sql, [id, user], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve(null);
    });
  });
}