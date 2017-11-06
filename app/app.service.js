let appService = (function() {

  return function( Resource ) {

    this.documentsList = [];
    this.selected = {};

    return {

      getDocument( id ){
        return new Promise( resolve =>
          Resource.get( { id: id }, resp => {
            resolve( this.documentsList.filter( doc => doc.id == id )[0] );
          }));
      },

      addDocument( document ) {
        return new Promise( resolve =>
          Resource.save( document, resp => {
            this.documentsList.push( resp );
            this.saveList();
            resolve( resp );
          }));
      },

      saveDocument( document ) {
        let ind = this.documentsList.indexOf( this.documentsList.filter( doc => doc.id == document.id )[0] );
        this.documentsList[ind] = document;
        this.saveList();
        return new Promise( resolve =>
          Resource.update( document, resp =>
            resolve( resp )
          ));
      },

      deleteDocument( id ) {
        return new Promise( resolve =>
          Resource.delete( { id: id }, resp => {
            this.documentsList.splice( this.documentsList.indexOf(
              this.documentsList.filter( doc => doc.id == id )[0]
            ), 1);
            resolve( resp );
          }));
      },

      getList() { return this.documentsList },

      loadList() {
        return new Promise( resolve => {
          let dataString = window.localStorage.getItem('docListPlots');

          Resource.query( resp => {

            if( dataString ) {
              this.documentsList = JSON.parse(dataString);
              resolve();
            }
            else
              $.getJSON('assets/js/testdata.json', data => {
                this.documentsList = data;
                resolve()
              })
          });
        });
      },

      saveList( list ) {
        window.localStorage.setItem('docListPlots', JSON.stringify( this.documentsList ));
      }
    }
  }

})();