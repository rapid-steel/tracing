let main = function() {

  let app = {
    init() {

      this.mode = 'read';
      this.editMode = 'line';

      this.currentLine = 0;
      this.currentPoint = false;

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

      this.pointsGr = this.svg.append('g')
        .attr('id', 'pointsGr');

      this.plot = this.svg.append('g')
        .attr('id', 'plotGr');

      this.axes = new Axes( this );
      this.toolbar = new Toolbar( this );
      this.lines = [new Line('line1', this)];

      this.lines[0].init();
      this.axes.init();
      this.toolbar.init();

    },

    delegateEvents()  {

      this.svg.on('click', () => {

        if( $(d3.event.target).hasClass('point') ) {
          let ids = $(d3.event.target).attr('id').split('_');
          this.selectPoint( ids );

        } else {
          let coord = d3.mouse($('#plot')[0]);
          this.currentPoint = false;

          switch ( this.editMode ) {
            case 'axis':
              let axis = $(d3.event.target).parents('.axis')[0];

              if ( axis ) {
                let id = axis.id.slice( 4 ).toLowerCase();
                this.setPoint( coord, id );
              }
              break;

            case 'line':
              this.addPoint( coord );

              break;
          }
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
        this.axes.correctSizes();
        this.axes.render();
      });
    },

    render() {
      this.svg.style('display', this.mode === 'plot' ? 'block' : 'none')
        .classed('crosshair', true);

      this.lines[ this.currentLine ].render();
      this.axes.render();
      this.toolbar.render();
    },


    selectPoint( ids ) {
      this.currentLine = + ids[0].slice(2);
      this.currentPoint = + ids[1].slice(1);

      this.toolbar.renderLinesSection();
      this.toolbar.renderPointSection();
    },


    addPoint( coord ) {
      this.lines[ this.currentLine ].addPoint( coord );

      this.lines[ this.currentLine ].render();
      this.toolbar.renderLinesSection();
      this.toolbar.renderPointSection();
    },

    deletePoint( ids ) {
      this.currentLine = + ids[0].slice(2);
      this.lines[ this.currentLine ].deletePoint( + ids[1].slice(1) );

      this.lines[ this.currentLine ].render();
      this.toolbar.renderPointSection();
      this.toolbar.renderLinesSection();
    },

    setPoint( coord, id ) {
      this.axes.setPoint( coord, id );
      this.axes.setScale( this.axes.pointsVal[id], id );
      this.toolbar.renderAxesSection();
      this.axes.render();
    },

    addLine( name ) {
      if ( name === '' )
        name = 'line' + ( this.lines.length + 1 );

      this.lines.push( new Line( name, this ) );
      this.currentLine = this.lines.length - 1;

      this.lines[ this.currentLine ].init();

      this.currentPoint = false;

      this.lines[ this.currentLine ].render();
      this.toolbar.renderPointSection();
      this.toolbar.renderLinesSection();
    },

    setOrigins( coord )  {
      this.axes.setOrigins( coord );

      this.axes.render();
      this.toolbar.renderAxesSection();
      this.toolbar.renderPointSection();
    },

    send() {
      let data = {
        axesOrigin: this.axes.origin,
        points: this.axes.points,
        point: this.axes.pointsVal,
        labels: this.axes.label,
        units: this.axes.unit,
        graphs: []
      };

      this.lines.forEach( line =>
        data.graphs.push({
          name: line.name,
          points: line.points
        }));

      console.log( data );
    }

  };

  app.init();
  app.delegateEvents();
  app.render();












};

$(main);