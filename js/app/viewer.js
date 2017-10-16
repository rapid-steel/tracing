class Viewer {

  constructor( app ) {
    this.app = app;

  }

  init() {

    let ext = this.app.docUrl.split('.')[ this.app.docUrl.split('.').length - 1 ]
      .toLowerCase();

    this.mode = ext === 'pdf'
      ? 'pdf'
      : ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif'
        ? 'image'
        : 'none';

    this.doc = document.getElementById('document');
    this.$doc = $('#document');

    this.scroll = { top: 0, left: 0 };
    this.scale = 1;
    this.scales = [ .1, .25, .33, .5, .6, .7, .8, .9, 1, 1.1, 1.25, 1.5, 2, 3, 4, 5, 10 ];

    this.$controls = {
      zoomPlus: $('#zoom-plus'),
      zoomMinus: $('#zoom-minus'),
      zoomValue: $('#zoom-value'),
      pageControl: $('.page-control'),
      prevPage: $('#prev-page'),
      nextPage: $('#next-page'),
      pageNumber: $('#page-number'),
      pageCount: $('#page-count')
    };

    this.$toolbar = $('#view-toolbar');

    $('.view-control-mode').hide();
    $(`.view-control-${ this.mode }`).css('display', 'inline-block');

    this.$toolbar.css('left', this.doc.clientWidth + $('#toolbar').width()
      - $('#app-container').width() + 'px' );

    this.initMode();

  }

  initMode() {
    switch ( this.mode ) {
      case 'pdf':
        this.initPdf();
        this.delegateEventsPdf();
        break;

      case 'image':
        this.initImage();
        this.delegateEventsImage();
        break;
    }
  }

  initPdf() {


    PDFJS.getDocument( this.app.docUrl )
      .then( pdf => {
        this.docPDF = pdf;
        this.currentPageNumber = 1;
        this.pageCount = pdf.numPages;
        this.$controls.pageCount.html( pdf.numPages );

        for( let num = 1; num <= this.pageCount; num++ ) {
          let container = document.createElement('div');

          container.className = 'page-container';
          container.id = `page${ num }`;
          container.innerHTML =
            `<i class="fa fa-cog fa-spin fa-3x fa-fw loading"></i>`;

          this.doc.appendChild( container );

          pdf.getPage( num ).then( page => {
            if ( num === this.currentPageNumber) {
              this.pageWidth = page.getViewport( 1 ).width;
              this.scale = document.getElementById('document-container').clientWidth /
                this.pageWidth;
              this.renderPanel();
            }
            this.renderPage( page, num );
            this.$currentPage = $('#page' + this.currentPageNumber );
          });
        }
      });


  }

  delegateEventsPdf() {

    this.$doc.on('scroll', () =>  {
      let offset = this.$currentPage[0].offsetTop + this.$currentPage.height();

      this.scroll = {
        top: this.doc.scrollTop,
        left: this.doc.scrollLeft
      };

      if ( offset < this.doc.scrollTop ) {
        this.currentPageNumber++;
        this.renderPanel()
      } else if ( this.$currentPage[0].offsetTop > this.doc.scrollTop ) {
        this.currentPageNumber--;
        this.renderPanel();
      }
    });

    this.$controls.zoomPlus.on('click', () => {

      let newScale = this.setScale( 1 );

      this.renderPdf( newScale );
      this.renderPanel();
    });

    this.$controls.zoomMinus.on('click', () => {
      let newScale = this.setScale( - 1 );

      this.renderPdf( newScale );
      this.renderPanel();
    });

    this.$controls.zoomValue.on('change', () => {
      let newScale =  this.$controls.zoomValue.val() / 100;
      this.renderPdf( newScale );
      this.renderPanel();
    });

    this.$controls.pageControl.on('click', ( event ) => {
      let $target = $( event.currentTarget );
      let id = $target.attr('id');

      if ( ! $target.hasClass('disabled') ) {
        this.currentPageNumber += {
          'next-page': 1,
          'prev-page': -1
        }[ id ];
        this.$currentPage = $('#page' + this.currentPageNumber );
        this.renderPanel();
        this.doc.scrollTop = this.$currentPage[0].offsetTop;
      }

    });

    this.$controls.pageNumber.on('change', () => {
      let val = this.$controls.pageNumber.val();

      if( val > 0 && val <= this.pageCount ) {
        this.currentPageNumber = val;
        this.renderPanel();
        this.doc.scrollTop = this.$currentPage[0].offsetTop;
      }
    });

  }

  renderPdf( scale ) {
    let oldScale = this.scale;
    let oldScrollTop = this.doc.scrollTop;

    this.scale = scale;

    for (let num = 1; num <= this.docPDF.numPages; num++) {

      let $page = $(`#page${num}`).find('.page');

      $page.remove();
      $page.append(`  
                <i class="fa fa-cog fa-spin fa-3x fa-fw loading" id="loading${num}"></i>`);

      this.docPDF.getPage(num).then( page => {
        this.renderPage( page, num );
        $(`#loading${num}`).remove();
        if ( num === this.currentPageNumber )
          this.$currentPage = $('#page' + this.currentPageNumber );

        if ( num === this.pageCount ) {
          this.doc.scrollTop = oldScrollTop /  oldScale * this.scale;
        }
      });
    }
    this.$currentPage = $('#page' + this.currentPageNumber );
  }

  renderPage( page, num ) {
    let viewport = page.getViewport( this.scale );

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    canvas.className = 'page';

    let renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);

    $( `#page${ num }`)[0].appendChild(canvas);
    $(`#page${num}`).find('.loading').remove();

  }


  initImage() {

    this.img = document.createElement('img');
    this.img.id = 'doc-image';
    this.img.src = this.app.docUrl;

    this.img.onload = () => {
      this.$img = $(this.img);
      this.doc.appendChild(this.img);

      this.imgWidth = this.img.naturalWidth;
      this.scale = this.doc.clientWidth / this.imgWidth;
      this.img.style.width = this.doc.clientWidth + 'px';
    };



  }

  delegateEventsImage() {

    this.$controls.zoomPlus.on('click', () => {

      if ( !this.$controls.zoomPlus.hasClass('disabled') ) {
        this.scale = this.setScale( 1 );
        this.img.style.width = this.imgWidth * this.scale + 'px';
        this.renderPanel();
      }
    });

    this.$controls.zoomMinus.on('click', () => {
      if ( !this.$controls.zoomMinus.hasClass('disabled') ) {
        this.scale = this.setScale( - 1 );
        this.img.style.width = this.imgWidth * this.scale + 'px';
        this.renderPanel();
      }

    });

    this.$controls.zoomValue.on('change', () => {
      this.scale = this.$controls.zoomValue.val() / 100;
      this.img.style.width = this.imgWidth * this.scale + 'px';
      this.renderPanel();
    });

  }


  renderPanel() {

    this.scale <= this.scales[ 0 ]
      ? this.$controls.zoomMinus.addClass('disabled')
      : this.$controls.zoomMinus.removeClass('disabled');
    this.scale >= this.scales[ this.scales.length - 1 ]
      ? this.$controls.zoomPlus.addClass('disabled')
      : this.$controls.zoomPlus.removeClass('disabled');

    this.$controls.zoomValue.val( Math.floor(this.scale * 100) );

    if ( this.mode === 'pdf' ) {
      this.$currentPage = $('#page' + this.currentPageNumber );
      this.$controls.pageNumber.val( this.currentPageNumber );

      this.currentPageNumber === 1
        ? this.$controls.prevPage.addClass('disabled')
        : this.$controls.prevPage.removeClass('disabled');
      this.currentPageNumber === this.pageCount
        ? this.$controls.nextPage.addClass('disabled')
        : this.$controls.nextPage.removeClass('disabled');
    }
  }

  setScale( n ) {

    let index = this.scales.indexOf( this.scale );
    let scale = this.scale;


    if ( index !== -1 )
      scale = this.scales[ index + n ];
    else {
      let closest = 0;
      let step = n === 1 ? 0 : - 1;
      this.scales.forEach( scale => {
        if ( this.scale > scale )
          closest++;
      });
      if ( this.scales[ closest + step ])
        scale = this.scales[ closest + step ];
    }

    return scale;
  }




}