loadList()
  .then( data =>
    init( data )
  );

function init( data ) {
  let docList = data;
  let $elems = {
    docList: $('#doc-list'),
    newDocUrl: $('#new-doc-url'),
    addDoc: $('#add-doc')
  };

  docList.forEach( doc => {

    let string = renderRow( doc, docList );
    $elems.docList.append(string);

  });

  $elems.newDocUrl.on('input', () =>
    $elems.addDoc.attr('disabled', !$elems.newDocUrl.val()) );

  $elems.addDoc.on('click', () => {
    let newDoc = {
      url: $elems.newDocUrl.val(),
      plots: []
    };
    $elems.newDocUrl.val('');
    docList.push( newDoc );
    $elems.docList.append( renderRow(newDoc, docList ) );
    saveList( docList );

  });

  $('.delete-doc').on('click', event => {
    let index =  $(event.currentTarget).parent().index();
    $(`.doc:nth-child(${index + 1})`).remove();
    docList.splice(index, 1);
    saveList( docList );
  });

  saveList( docList );
}


function renderRow( doc, docList ) {
  return `<div class="row doc">
    <div class="col-8">
      <a href="tracing.php?doc_id=${ docList.indexOf( doc ) }">${ doc.url }</a>
    </div>
    <div class="col-1" title="Created plots: ${ doc.plots.length }">
      <i class="fa fa-line-chart" aria-hidden="true"></i>
      ${ doc.plots.length }
    </div>
    <div class="col-1 btn btn-primary delete-doc">
      <i class="fa fa-trash" aria-hidden="true"></i>
    </div>              
     </div>`;
}

function loadList() {

  return new Promise( resolve => {
    let dataString = window.localStorage.getItem('docListPlots');

    if( dataString)
      resolve( JSON.parse(dataString) );
    else
      $.getJSON('js/testdata.json', data => resolve( data ) )
  });


}


function saveList( list ) {
  window.localStorage.setItem('docListPlots', JSON.stringify( list ));
}