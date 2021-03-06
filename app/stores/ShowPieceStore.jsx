"use strict";
let dispatcher = require("./../dispatcher.js");
let {get, post, del, put} = require("./../RestHelper.js");
let auth = require("./../services/Authentication.js");

function ShowPieceStore() {

  let showPieces = [],
    changeListeners = [],
    piece = {};

  function triggerListeners() {
    changeListeners.forEach(function(listener) {

      listener(showPieces);
    })
  };

  function fetchShowcase() {
    get("api/pieces").then((data) => {
      showPieces = data;
      triggerListeners();
    });
  };

  function fetchShowPiece(id) {

    get(`api/pieces/${id}`).then((data) => {
      piece = data[0];
      triggerListeners();
    });
  };

  function removeShowPiece(showpiece) {
    var index = showPieces.findIndex(x => x._id === showpiece._id);
    var removed = showPieces.splice(index, 1)[0];

    del(`api/pieces/${piece._id}`).then(() => {
      piece = 'deleted';
      triggerListeners();
    }).catch((err) => {
      if (err.status == 401) {
        auth.logout();
        piece = "Not Authorized";
      } else {
        piece = piece;
      }
      showPieces.splice(index, 0, removed);

      triggerListeners();
    })

  }

  function addShowPiece(piece) {
    post("/api/pieces", piece).then((data) => {
      showPieces.push(data);
      triggerListeners();
    }).catch(() => {
      console.log('Error on add');
    })
  }

  function likeShowPiece(piece) {
    piece.likes = piece.likes + 1;
    triggerListeners();
    put(`api/pieces/${piece._id}`, piece);
  }

  function unlikeShowPiece(piece) {
    piece.likes = piece.likes - 1;
    triggerListeners();
    put(`api/pieces/${piece._id}`, piece);
  }
  function getShowPieces() {
    return showPieces;
  };

  function getShowPiece() {
    return piece;
  };

  function onChange(listener) {
    changeListeners.push(listener);
  }

  function removeChangeListener(listener) {
    var index = changeListeners.findIndex(i => i === listener);
    changeListeners.splice(index, 1);
  }

  dispatcher.register(function(event) {
    var split = event.type.split(':');
    if (split[0] === 'show-piece') {
      switch (split[1]) {
        case "add":
          addShowPiece(event.payload);
          break;
        case "delete":
          removeShowPiece(event.payload.data);
          break;
        case "like":
          likeShowPiece(event.payload, true);
          break;
        case "unlike":
          unlikeShowPiece(event.payload, false);
          break;
      }
    }
  })

  return {
    getShowPieces: getShowPieces,
    onChange: onChange,
    fetchShowcase: fetchShowcase,
    fetchShowPiece: fetchShowPiece,
    getShowPiece: getShowPiece,
    removeChangeListener: removeChangeListener
  }
}

module.exports = new ShowPieceStore();
