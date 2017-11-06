let DocumentController = (function() {
  return function( $scope ) {

    $scope.loadingDocView = true;

    let imgNaturalWidth = 0;
    let docPDF;

    const elems = {
      doc: '',
    };
    $scope.scales = [ 10, 25, 33, 50, 66, 75, 90, 100, 110, 125, 150, 200, 300, 400, 500, 1000 ];

    let scroll = { top: 0, left: 0 };
    let pageWidth, pageHeight, scale, currentPage, num;

    $scope.$on('changeLocation', () => {

      switch ( $scope.viewerMode ) {
        case 'pdf':
          renderPdf( $scope.location.scale, {x: $scope.location.x, y: $scope.location.y} );
          break;

        case 'image':
          setImgStyle( $scope.location.scale );
          break;
      }
    });



    this.$onInit = function() {

      const urlSplit = $scope.selectedDoc.url.split('.');
      const ext = urlSplit[ urlSplit.length - 1 ].toLowerCase();

      $scope.viewerMode = ext === 'pdf'
        ? 'pdf'
        : ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif'
          ? 'image'
          : 'none';

      $scope.imgStyle = { width: 0 };
      $scope.scale = 100;

      initMode();
    };

    const initMode = function() {
      switch ( $scope.viewerMode ) {
        case 'pdf':
          initPdf();
          break;

        case 'image':
          initImage();
          break;
      }
    };

    const initImage = function() {
      let img = new Image();

      img.src = $scope.selectedDoc.url;

      img.onload = () => {
        let doc = document.getElementById('document-container');
        imgNaturalWidth = img.naturalWidth;
        $scope.imgUrl = img.src;
        setImgStyle( doc.clientWidth / imgNaturalWidth * 100 );
        $scope.loadingDocView = false;
        $scope.$emit('docViewLoaded');
        $scope.$apply();
      }
    };

    const setImgStyle = function( scale ) {
      $scope.scale = scale;
      $scope.imgStyle = { width: imgNaturalWidth * $scope.scale / 100  + 'px' };
    };

    const initPdf = function() {
      PDFJS.getDocument( 'getdoc.php?url=' + $scope.selectedDoc.url )
        .then( pdf => {

          elems.doc = document.getElementById('document');

          docPDF = pdf;
          currentPage = 1;
          $scope.currentPage = 1;
          $scope.pageCount = pdf.numPages;


          elems.doc.addEventListener('scroll', onScroll);

          for( let num = 1; num <= $scope.pageCount; num++ ) {
            let container = document.createElement('div');

            container.className = 'page-container';
            container.id = `page${ num }`;
            container.innerHTML =
              `<i class="fa fa-cog fa-spin fa-3x fa-fw loading" id="loading${num}"></i>`;

            elems.doc.appendChild( container );

            pdf.getPage( num ).then( page => {
              if ( num === currentPage ) {
                pageWidth = page.getViewport( 1 ).width;
                $scope.scale = document.getElementById('document-container').clientWidth /
                  pageWidth * 100;
                scale = $scope.scale;
                pageHeight = page.getViewport( $scope.scale / 100 ).height;
              }
              if( num > currentPage - 2 && num < currentPage + 2 )
                renderPage( page, num );

              container.style.height = pageHeight + 'px';

              if ( num === $scope.pageCount ) {
                $scope.loadingDocView = false;
                $scope.$emit('docViewLoaded');
                $scope.$apply();
              }
            });
          }
        });
    };

    $scope.scrollToPage = function( page ) {

      if ( currentPage !== page ){
        currentPage = page;

        if( currentPage > 0 && currentPage <= $scope.pageCount ) {
          let start = +currentPage > -2 ? +currentPage : 1;
          let end = +currentPage < $scope.pageCount - 2 ? +currentPage : $scope.pageCount;

          for ( let i = start; i <= end; i++ )
            docPDF.getPage( i ).then( page => {
              if( document.getElementById(`loading${ i }`) ) {
                renderPage( page, i );
              }
              if ( i === +currentPage )
                elems.doc.scrollTop = document.getElementById( 'page' + currentPage ).offsetTop;

            });
        }
      }

    };

    $scope.newScale = function( newScale ) {
      switch ( $scope.viewerMode ) {
        case 'pdf':
          renderPdf( newScale );
          break;
        case 'image':
          setImgStyle( newScale );
          break;
      }
    };

    $scope.setScale = function( n ) {

      let scale = setScale( n );

      if ( scale ) {
        switch ( $scope.viewerMode ) {
          case 'pdf':
            renderPdf( scale );
            break;
          case 'image':
            setImgStyle( scale );
            break;
        }
      }

    };

    const onScroll = function() {

      let current = document.getElementById( 'page' + currentPage );
      let offset = current.offsetTop + current.clientHeight;

      scroll = {
        top: elems.doc.scrollTop,
        left: elems.doc.scrollLeft
      };

      if ( offset < elems.doc.scrollTop ) {
        $scope.toNextPage( true );
        $scope.currentPage = currentPage;
        $scope.$digest();

      } else if ( current.offsetTop > elems.doc.scrollTop ) {
        $scope.toPrevPage( true );
        $scope.currentPage = currentPage;
        $scope.$digest();
      }
    };


    $scope.toNextPage = function( scrolling ) {

      if ( $scope.currentPage !== $scope.pageCount ) {
        num = currentPage + 2;

        currentPage++;
        $scope.currentPage = currentPage;
        if ( !scrolling )
          elems.doc.scrollTop = document.getElementById('page' + currentPage ).offsetTop;

        if ( $scope.pageCount >= num )
          docPDF.getPage( num ).then(
            page =>  renderPage( page, num )
          );
      }


    };

    $scope.toPrevPage = function( scrolling ) {

      if( $scope.currentPage !== 1) {
        num = currentPage - 2;

        currentPage--;
        if ( !scrolling )
          elems.doc.scrollTop = document.getElementById('page' + currentPage ).offsetTop;

        if ( num >= 1 )
          docPDF.getPage( num ).then(
            page => renderPage( page, num )
          );
      }
    };

    $scope.currentLocation = function() {
      return {
        x: elems.doc.scrollLeft,
        y: elems.doc.scrollTop,
        scale: $scope.scale
      }
    };

    $scope.savePlotLocation = function( plot ){
      let location = $scope.currentLocation();
      $scope.setLocation( location );
    };



    const setScale = function( n ) {
      let index = $scope.scales.indexOf( $scope.scale );
      let scale = $scope.scale;

      if ( index !== -1 )
        scale = $scope.scales[ index + n ];
      else {
        let closest = 0;
        let step = n === 1 ? 0 : - 1;
        $scope.scales.forEach( scale => {
          if ( $scope.scale > scale )
            closest++;
        });
        if ( $scope.scales[ closest + step ])
          scale = $scope.scales[ closest + step ];
      }
      return scale;
    };


    const renderPdf = function( newScale, newScroll ) {

      let oldScrollTop = elems.doc.scrollTop;
      $scope.scale = newScale;

      for (let num = 1; num <= docPDF.numPages; num++) {

        docPDF.getPage(num).then( page => {
          let $page = $(`#page${num}`);

          if ( num === 1 ) {
            pageHeight = page.getViewport( $scope.scale / 100 ).height;

            if ( newScroll )
              currentPage = Math.floor( newScroll.y / pageHeight );
          }

          $page.css('height', pageHeight + 'px');
          $page.html(`  
                <i class="fa fa-cog fa-spin fa-3x fa-fw loading" id="loading${num}"></i>`);

          if( num > currentPage - 2 && num < currentPage + 2 )
            renderPage( page, num );

          if ( num === $scope.pageCount ) {
            elems.doc.scrollTop = oldScrollTop /  scale * $scope.scale;

            scale = $scope.scale;
            if ( newScroll ) {
              scroll = newScroll;
              elems.doc.scrollTop = scroll.y;
              elems.doc.scrollLeft = scroll.x;
            }
          }
        });
      }
    };


    const renderPage = function( page, num ) {
      const viewport = page.getViewport( $scope.scale / 100 );
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvas.className = 'page';

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);

      if( document.getElementById(`loading${ num }`))
        document.getElementById(`loading${ num }`).remove();
      document.getElementById( `page${ num }`).appendChild(canvas);


    }

  };
})();