let main = function() {

  let editMode = 'line';
  let $container = $('#document-container');
  let sizes = {
    width: $container.width(),
    height: $container.height()
  };
  let lines = [];


  let currentLine = 0;
  let currentPoint = false;


  let svg = d3.select('#document-container')
    .append('svg')
    .attr('id', 'plot')
    .attr( 'width', sizes.width )
    .attr( 'height', sizes.height );

  let overlay = svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', sizes.width)
    .attr('height', sizes.height)
    .style('fill', 'white')
    .style('opacity', .5);

  let plot = svg.append('g').attr('id', 'plotGr');

  let axes = {
    origin: {
      x: 0,
      y: 0
    },
    lengths: {
      X: sizes.width,
      Y: sizes.height
    },
    scaleX: d3.scaleLinear(),
    scaleY: d3.scaleLinear(),

    axisX: d3.axisTop(),
    axisY: d3.axisRight().scale( this.scaleY ),

    label: {
      X: 'X',
      Y: 'Y'
    },

    unit: {
      X: 'unit',
      Y: 'unit'
    },


    points: {
      x: false,
      y: false
    },

    domainOrigin: {
      x: 0,
      y: 0
    },

    domainLength: {
      x: sizes.width,
      y: sizes.height
    },

    scale: {
      x: 1,
      y: 1
    },

    axisXgroup: plot.append('g')
      .attr('id', 'axisX')
      .classed('axis', true),
    axisYgroup: plot.append('g')
      .attr('id', 'axisY')
      .classed('axis', true),

    arrowDrag: false,
    axisPoint: false,

    setOrigins( coords ) {
      this.origin.x = coords[0] ;
      this.origin.y = sizes.height - coords[1];

      if ( this.origin.x + this.lengths.X > sizes.width )
        this.lengths.X = sizes.width - this.origin.x;

      if ( this.origin.y + this.lengths.Y > sizes.height )
        this.lengths.Y = sizes.height - this.origin.y;
    },

    setDomainOrigins( coords ) {
      this.domainLength.x +=(- this.domainOrigin.x + +coords.x);
      this.domainLength.y +=( - this.domainOrigin.y + +coords.y);
      this.domainOrigin = coords;
    },

    setPoint( coord, axis ) {

      switch ( axis ) {
        case 'X':
          this.points.x = coord[0] - this.origin.x;
          break;
        case 'Y':
          this.points.y = this.origin.y - coord[1];
          break;
      }

      this.apply();
    },

    setLength( coord, axis ) {

      switch ( axis ) {
        case 'X':
          let length = coord[0] - this.origin.x + 25;
          this.domainLength.x = length * this.domainLength.x / this.lengths.X;
          this.lengths.X = length;
          break;
        case 'Y':
          this.lengths.Y = sizes.height - coord[1]- this.origin.y + 25;
          break;
      }

    },

    setPoint( coord, axis ) {
      this.axisPoint = axis;
      switch ( axis ) {
        case 'X':
          this.points.x = coord[0] - this.origin.x;
          break;
        case 'Y':
          this.points.y = - this.origin.y + sizes.height - coord[1];
          break;
      }

    },

    setScale( value ) {
      let oldScale = this.domainLength[ this.axisPoint.toLowerCase() ] / this.lengths[ this.axisPoint ];

      this.domainLength[ this.axisPoint.toLowerCase() ]
        = ( value -  +this.domainOrigin[ this.axisPoint.toLowerCase() ]) /
        this.points[ this.axisPoint.toLowerCase() ] * this.lengths[ this.axisPoint ]
        + +this.domainOrigin[ this.axisPoint.toLowerCase() ] ;

      console.log(  this.points[ this.axisPoint.toLowerCase() ] );

    },

    setScales() {
      this.scaleX
        .domain([ this.domainOrigin.x,  this.domainLength.x ])
        .range([ 0, this.lengths.X ]);
      this.scaleY
        .domain([ this.domainLength.y , this.domainOrigin.y, ])
        .range([ 0, this.lengths.Y ]);
    },

    setAxes() {
      this.axisX
        .scale( this.scaleX );

      this.axisY
        .scale( this.scaleY );
    },

    drawAxes() {
      this.axisXgroup
        .call( this.axisX )
        .attr( 'transform', `translate( 0, ${ sizes.height  } )` )
        .select('.arrow')
        .attr('transform', `translate( ${ this.lengths.X - 25 }, 0 )`);

      this.axisXgroup.select('.axisPoint')
        .attr('cx', this.points.x )
        .style('display', editMode === 'axis' && this.points.x ? 'block' : 'none')
      ;

      this.axisXgroup.select('text.lbl')
        .text(`${this.label.X}, ${this.unit.X}`)
        .attr('x', this.lengths.X - 30 )
        .attr('y', - 30 );


      this.axisYgroup
        .call( this.axisY )
        .attr( 'transform', `translate( 0, ${  sizes.height -  this.lengths.Y } )` )
        .select('.arrow')
        .attr('transform', `translate( 0, 25 )`);

      this.axisYgroup.select('.axisPoint')
        .attr('cy', this.lengths.Y - this.points.y )
        .style('display', editMode === 'axis' && this.points.y ? 'block' : 'none')
      ;

      this.axisYgroup.select('text.lbl')
        .text(`${this.label.Y}, ${this.unit.Y}`)
        .attr('x', 30 )
        .attr('y', 30 );

      plot.attr('transform', `translate( ${ this.origin.x }, ${  - this.origin.y } )` );

    },

    init() {

      this.axisXgroup.append('path')
        .attr('d', 'M 25 0 L -25 10 L -25 -10 z')
        .attr('id', 'arrowX')
        .style('fill', 'black')
        .classed('arrow', true);

      this.axisXgroup.append('circle')
        .classed('axisPoint', true)
        .attr('cy', 0)
        .attr('r', 5)
        .style('fill', 'blue');

      this.axisXgroup.append('text')
        .classed('lbl', true)
        .style('stroke', 'black')
        .style('font-size', 12)
        ;


      this.axisYgroup.append('path')
        .attr('d', 'M 0 -25 L 10 25 L -10 25 z')
        .attr('id', 'arrowY')
        .style('fill', 'black')
        .classed('arrow', true);

      this.axisYgroup.append('circle')
        .classed('axisPoint', true)
        .attr('cx', 0)
        .attr('r', 5)
        .style('fill', 'blue');

      this.axisYgroup.append('text')
        .classed('lbl', true)
        .style('stroke', 'black')
        .style('font-size', 12)
      ;

      this.originPoint = this.axisXgroup.append('circle')
        .attr('cx', 0 )
        .attr('cy', 0 )
        .attr('r', 15)
        .style('fill', 'black');


      let dragOrigin = d3.drag()
        .on('start', () => {

        })
        .on('drag', () => {
          let coords = d3.mouse($('#plot')[0]);
          this.setOrigins( coords );
          render();
        });

      this.originPoint.call( dragOrigin );



      let dragArrow = d3.drag()
        .on('start', () => {
          this.arrowDrag = d3.event.sourceEvent.originalTarget.id.slice(5);
        })
        .on('drag', () => {
          let coords = d3.mouse( $('#plot' )[0] );
          this.setLength( coords, this.arrowDrag );
          render();
        })
        .on('end', () => {
          this.arrowDrag = false;
        });

      d3.selectAll('.arrow')
        .call(dragArrow);

      this.apply();
    },

    apply() {
      this.setScales();
      this.setAxes();
      this.drawAxes();
    }

  };


  let Line = function ( name ) {
    this.name = name;
    this.points = [];
    this.group = plot.append('g').attr('id', 'l' + lines.length);

    this.group.selectAll('.point')
      .data(this.points)
      .enter()
      .append('circle')
      .classed('point', true);

    this.group.append('path')
      .classed('line', true)
      .style('fill', 'transparent')
      .style('stroke', 'red')
      .style('stroke-width', 2);


    this.line = d3.line();

    this.target = false;

    this.drag = d3.drag()
      .on('start', () => {
        currentLine = + d3.event.sourceEvent.currentTarget.parentNode.id.slice(1);
        currentPoint = + d3.event.sourceEvent.currentTarget.id.slice(1);

        this.target = d3.event.sourceEvent.currentTarget.id.slice(1);
      })
      .on('drag', () => {
        let coord = d3.mouse($('#plotGr')[0]);
        this.points[ this.target ] = coord;
        render();
      })
      .on('end', () => {
        this.target = false;
        render();
      });


  };

  Line.prototype.addPoint = function( coords ) {
    this.points.push(coords);

    this.points.sort( (p1, p2) => p1[0] - p2[0] );

    let point = this.group.append('circle')
      .classed('point', true);

    point.call(this.drag);
  };

  Line.prototype.deletePoint = function( index ) {
    this.points.splice( index, 1 );
    this.group.select('.point:last-child').remove();
  };

  Line.prototype.draw = function() {
    this.group.selectAll('.point')
      .data(this.points)
      .attr('id', (d, i) => 'p' + i)
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 5)
      .style('fill', 'red');


    this.group.select('.line')
      .attr('d', this.line(this.points));
  };

  Line.prototype.apply = function() {
    this.points.sort( (p1, p2) => p1[0] - p2[0] );
    this.draw();
  };

  lines.push(new Line('line1'));



  axes.init();

  let toolbar = {
    $els: {
      setPointOn: $('.setPointOn'),
      setPointOff: $('.setPointOff'),
    },
    $controls: {
      addPoint: $('#addPoint'),
      editPoint: $('#editPoint'),
      addLine: $('#addLine'),
      selectLine: $('#selectLine'),
      setAxisPoint: $('#setAxisPoint'),
      saveAxisPoint: $('#saveAxisPoint')
    },
    $inputs: {
      pointX: $('#pointX'),
      pointY: $('#pointY'),
      lineName: $('#lineName'),
      newLineName: $('#newLineName'),
      origin: $('.origin'),
      originX: $('#originX'),
      originY: $('#originY'),
      label: $('.labelAxis'),
      labelX: $('#labelX'),
      labelY: $('#labelY'),
      unit: $('.unit'),
      unitX: $('#unitX'),
      unitY: $('#unitY'),
      pointPosition: $('#pointPosition')
    },

    saveAxisPoint( event ) {
      axes.setScale( this.$inputs.pointPosition.val() );
      axes.apply();
    },

    changeMode( mode ) {
      editMode = mode;
      this.$els.setPointOn.css( 'display', mode === 'axis'  ? 'block' : 'none');
      this.$els.setPointOff.css('display', mode === 'line' ? 'block' : 'none');
    },

    setOrigin( event ) {

      axes.setDomainOrigins({ x: this.$inputs.originX.val(), y: this.$inputs.originY.val() });
      render();
    },

    setLabel( event ) {
      let val = $( event.target ).val();
      let axis = $( event.target ).attr('id').slice( 5 );
      axes.label[ axis ] = val;
      render();
    },

    setUnit( event ) {
      let val = $( event.target ).val();
      let axis = $( event.target ).attr('id').slice( 5 );
      axes.unit[ axis ] = val;
      render();
    },

    setName() {
      lines[currentLine].name = this.$inputs.lineName.val();
      render();
    },

    addLine() {

      let name = this.$inputs.newLineName.val() || 'line' + lines.length;
      lines.push( new Line(name) );
      currentLine = lines.length - 1;
      render();
    },

    addPoint() {
      let x = this.$inputs.pointX.val(),
        y = sizes.height - this.$inputs.pointY.val();

      if ( x && y ) {
        lines[ currentLine ].addPoint([x, y]);
        this.$inputs.pointX.val('');
        this.$inputs.pointY.val('');

      }
    },


    delegateEvents() {
      this.$controls.addPoint.on('click', () => this.addPoint());
      this.$controls.addLine.on('click', () => this.addLine());

      this.$controls.selectLine.on('change', () => {
        currentLine = this.$controls.selectLine.val();
        render();
      });

      this.$controls.setAxisPoint.on('click', () => this.changeMode('axis'));
      this.$controls.saveAxisPoint.on('click', () => {
        this.saveAxisPoint();
        this.changeMode('line');
      });

      this.$inputs.pointPosition.on('change', () => this.saveAxisPoint());

      this.$inputs.lineName.on('change', () => this.setName());
      this.$inputs.origin.on('change', ( event ) => this.setOrigin( event ));
      this.$inputs.label.on('change', ( event ) => this.setLabel( event ));
      this.$inputs.unit.on('change', ( event ) => this.setUnit( event ));
    },

    apply() {
      if( currentPoint !== false ) {
        this.$controls.editPoint.css('display','inline-block');
        this.$controls.addPoint.css('display','none');
        this.$inputs.pointX.val( lines[currentLine].points[currentPoint][0] );
        this.$inputs.pointY.val( lines[currentLine].points[currentPoint][1] );
      } else {
        this.$controls.addPoint.css('display','inline-block');
        this.$controls.editPoint.css('display','none');
      }


      this.$controls.selectLine.empty();
      lines.forEach( (line, index) => {
        let option = `<option value="${index}">${line.name}</option>`;
        this.$controls.selectLine.append( option );
      });

      this.$controls.selectLine.val(currentLine);



      this.$inputs.lineName.val( lines[currentLine].name );
      this.$inputs.originX.val( axes.domainOrigin.x );
      this.$inputs.originY.val( axes.domainOrigin.y );
      this.$inputs.labelX.val( axes.label.X );
      this.$inputs.labelY.val( axes.label.Y );
      this.$inputs.unitX.val( axes.unit.X );
      this.$inputs.unitY.val( axes.unit.Y );
    }
  };

  toolbar.delegateEvents();

  svg.on('click', () => {

    if( $(d3.event.target).hasClass('point') ) {
      currentLine = + $(d3.event.target).parent().attr('id').slice(1);
      currentPoint = + $(d3.event.target).attr('id').slice(1);
    } else {
      currentPoint = false;
      let coord = d3.mouse($('#plot')[0]);
      switch ( editMode ) {
        case 'axis':

          let axis = $(d3.event.target).parents('.axis')[0];
          if ( axis ) {
            let id = axis.id.slice( 4 );
            axes.setPoint( coord, id );

          }
          break;
        case 'line':
          lines[currentLine].addPoint( [coord[0] - axes.origin.x, coord[1] + axes.origin.y ]);

          break;
      }
    }

    render();

  });

  svg.on('contextmenu', () => {
    if( $(d3.event.target).hasClass('point') ) {
      d3.event.preventDefault();
      currentLine = + $(d3.event.target).parent().attr('id').slice(1);
      lines[ currentLine ].deletePoint( +$(d3.event.target).attr('id').slice(1) );
      render();
    }
  });


  render();

  function render() {
    axes.apply();
    lines[ currentLine ].apply();
    toolbar.apply();
  }




};

$(main);