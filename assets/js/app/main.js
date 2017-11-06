let main = function() {

    let app = {
    init( doc ) {

      this.doc = doc;
      this.docUrl = doc.url;

      this.mode = 'read';

      this.$container = $('#document');
      this.sizes = {
        width: this.$container.prop('scrollWidth'),
        height: this.$container.height()
      };

      this.svg = d3.select('#document-container')
        .append('svg')
        .attr('id', 'plot')
        .attr('width', this.sizes.width)
        .attr('height', this.sizes.height);

      this.overlay = this.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.sizes.width)
        .attr('height', this.sizes.height)
        .style('fill', 'white')
        .style('opacity', .5);

      this.plotGr = this.svg.append('g');
      this.pointsGr = this.svg.append('g');

      this.toolbar = new Toolbar( this );
      this.viewer = new Viewer( this );

      this.toolbar.init();
      this.viewer.init();

      this.currentPlot = 0;
      this.currentLine = 0;
      this.currentPoint = false;

      this.plots = [];
      if( doc.plots.length )
        doc.plots.forEach( plot => this.plots.push(new Plot(this, plot )) );
      else
        this.plots.push(new Plot( this ));

      this.plots[ 0 ].init();
    },

    delegateEvents()  {

      this.svg.on('click', () => {

        if( $(d3.event.target).hasClass('point') ) {
          let ids = $(d3.event.target).attr('id').split('_');
          this.selectPoint( ids );

        } else {
          let coord = d3.mouse($('#toolbar')[0]);
          this.addPoint( coord );
        }
      });

      this.svg.on('contextmenu', () => {
        let $target = $(d3.event.target);

        if( $target.hasClass('point') ) {
          let ids = $target.attr('id').split('_');
          d3.event.preventDefault();
          this.deletePoint( ids );
        }
      });

      $(window).on('resize', () => {
        this.plots.forEach( plot => {
          let oldSizes = plot.axes.correctSizes();
          this.sizes = oldSizes;
        });
        this.sizes = {
          width: this.$container.width(),
          height: $('#document-container').height()
        };
        this.render();

      });
    },

    removePlot() {

      this.plotGr.remove();
      this.pointsGr.remove();
      this.svg.select('.originPoint').remove();

      this.plotGr = this.svg.append('g');
      this.pointsGr = this.svg.append('g');

      this.currentLine = 0;
      this.currentPoint = false;
    },

    render() {
      this.svg.style('display', this.mode === 'plot' ? 'block' : 'none')
        .classed('crosshair', true);

      this.viewer.$toolbar.css('display', this.mode === 'read' ? 'block' : 'none');

      this.plots[ this.currentPlot ].lines[ this.currentLine ].render();
      this.plots[ this.currentPlot ].axes.render();
      this.toolbar.render();
    },

    addPlot( name ) {
      this.plots.push(new Plot( this ));
      this.currentPlot = this.plots.length - 1;
      this.plots[ this.currentPlot ].name = name || 'Plot' + this.plots.length;

      this.removePlot();
      this.plots[ this.currentPlot ].init();
      this.plots[ this.currentPlot ].axes.correctSizes();
      this.render();
    },

    selectPlot( ) {
      this.removePlot();
      this.jumpToPlot();

      this.plots[ this.currentPlot ].init();
      this.plots[ this.currentPlot ].axes.correctSizes();
      this.plots[ this.currentPlot ].lines.forEach( line => line.render() );
      this.render();
    },

    jumpToPlot() {
      if ( this.plots[ this.currentPlot ].location )
        this.viewer.scrollTo( this.plots[ this.currentPlot ].location );
    },

    deletePlot() {
      this.removePlot();
      this.plots.splice( this.currentPlot, 1 );
      if( this.plots.length === +this.currentPlot )
        this.currentPlot--;

      if ( this.plots[ this.currentPlot ].location )
        this.viewer.scrollTo( this.plots[ this.currentPlot ].location );

      this.plots[ this.currentPlot ].axes.correctSizes();
      this.plots[ this.currentPlot ].initDraw();
      this.plots[ this.currentPlot ].lines.forEach( line => line.render() );
      this.render();
    },


    selectPoint( ids ) {
      this.currentLine = + ids[0].slice(2);
      this.currentPoint = + ids[1].slice(1);

      this.toolbar.renderLinesSection();
      this.toolbar.renderPointSection();
    },

    addPoint( coord ) {
      this.plots[ this.currentPlot ].lines[ this.currentLine ].addPoint( coord );
      this.plots[ this.currentPlot ].lines[ this.currentLine ].render();
      this.toolbar.renderLinesSection();
      this.toolbar.renderPointSection();
    },

    deletePoint( ids ) {
      this.currentLine = + ids[0].slice(2);
      this.plots[ this.currentPlot ].lines[ this.currentLine ].deletePoint( + ids[1].slice(1) );

      this.plots[ this.currentPlot ].lines[ this.currentLine ].render();
      this.toolbar.renderPointSection();
      this.toolbar.renderLinesSection();
    },

    setPoint( coord, id ) {
      this.plots[ this.currentPlot ].axes.setPoint( coord, id );
      this.plots[ this.currentPlot ].axes.setScale( this.plots[ this.currentPlot ].axes.pointsVal[id], id );
      this.toolbar.renderAxesSection();
      this.plots[ this.currentPlot ].axes.render();
    },

    addLine( name ) {
      if ( name === '' )
        name = 'line' + ( this.plots[ this.currentPlot ].lines.length + 1 );

      this.plots[ this.currentPlot ].lines.push( new Line( name, this ) );
      this.currentLine = this.plots[ this.currentPlot ].lines.length - 1;

      this.plots[ this.currentPlot ].lines[ this.currentLine ].init();

      this.currentPoint = false;

      this.plots[ this.currentPlot ].lines[ this.currentLine ].render();
      this.toolbar.renderPointSection();
      this.toolbar.renderLinesSection();
    },

    setOrigins( coord )  {
      this.plots[ this.currentPlot ].axes.setOrigins( coord );

      this.plots[ this.currentPlot ].axes.render();
      this.toolbar.renderAxesSection();
      this.toolbar.renderPointSection();
    },

    send() {

      this.doc.plots = [];

      this.plots.forEach( plot => {
        if (!plot.location)
          plot.saveLocation();

        let data = {
          name: plot.name,
          location: plot.location,
          origin: [
            plot.axes.origin.x, this.sizes.height - plot.axes.origin.y ],
          points: plot.axes.points,
          pointsVal: plot.axes.pointsVal,
          label: plot.axes.label,
          unit: plot.axes.unit,
          lines: []
        };

        plot.lines.forEach(line =>
          data.lines.push({
            color: line.color,
            name: line.name,
            points: line.points
          }));

        this.doc.plots.push(data);

      });

      console.log( this.doc.plots );
      this.saveDoc();
    },

    saveDoc() {
      docList[id] = this.doc;
      window.localStorage.setItem('docListPlots', JSON.stringify(docList));
    }

  };


  let docList = JSON.parse( window.localStorage.getItem('docListPlots') );
  let doc = docList[id];

  app.init( doc );
  app.delegateEvents();
  app.render();






};

$(main);