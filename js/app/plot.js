class Plot {
  constructor( app, data ) {
    this.id = Math.floor( Math.random() * 100000 );
    this.app = app;
    if ( data )
      this.loadPlot( data );
    else
      this.createPlot();
  }

  loadPlot( data ) {

    this.name = data.name;
    this.location = data.location;
    this.axes = new Axes( this.app, this );
    this.axes.initVals();


    ['points', 'label', 'unit'].forEach(
      key => this.axes[ key ] = data[ key ]
    );

    this.axes.setOrigins( data.origin );
    this.axes.setScale( data.pointsVal.x, 'x' );
    this.axes.setScale( data.pointsVal.y, 'y' );
    this.axes.correctSizes();

    this.axes.setScales();
    this.axes.setAxes();

    this.lines = [];

    data.lines.forEach( lineData => {
      let line =  new Line( lineData.name, this.app, this );
      line.points = lineData.points;
      line.color = lineData.color;
      this.lines.push( line );
    });

  }

  createPlot() {

    this.name = 'Plot' + ( this.app.plots.length + 1 );
    this.axes = new Axes( this.app, this );
    this.axes.initVals();
    this.lines = [];
    this.lines.push( new Line('line1', this.app, this ) );
  }

  init() {
    this.lines.forEach( line => {
      line.init();
      line.render();

    } );
    this.axes.initDraw();
  }

  initDraw() {
    this.lines.forEach( line => line.init() );
    this.axes.initDraw();
  }

  saveLocation() {
    this.location = {
      x: this.app.viewer.doc.scrollLeft,
      y: this.app.viewer.doc.scrollTop,
      scale: this.app.viewer.scale,
      width: this.app.viewer.mode === 'pdf'
        ? this.app.viewer.pageWidth
        : this.app.viewer.$img[0].naturalWidth,

      offsetX: this.app.viewer.mode === 'pdf'
        ? this.app.viewer.$currentPage.find('.page').position().left + this.app.viewer.doc.scrollLeft
        : this.app.viewer.$img.offset().left + this.app.viewer.doc.scrollLeft
    };

    console.log( this.location);
  }





}