let main = function() { //setPoint. когда инпут пустой, проверка не фурычит

  let editMode = 'line';
  let $container = $('#document');
  let sizes = {
    width: $container.prop('scrollWidth') - 20,
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
    .style('opacity', 0);

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

    pointsVal: {
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

        this.lengths.X = sizes.width - this.origin.x;
        this.lengths.Y = coords[1];

        this.setDomainOrigins();
    },

    setDomainOrigins( ) {
      this.domainOrigin.x = this.domainLength.x / this.lengths.X * ( this.lengths.X - sizes.width );
      this.domainOrigin.y = this.domainLength.y / this.lengths.Y * ( this.lengths.Y - sizes.height );
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

      this.pointsVal[ this.axisPoint.toLowerCase() ] = value;

      this.domainLength[ this.axisPoint.toLowerCase() ]
        = value  /
        this.points[ this.axisPoint.toLowerCase() ] * this.lengths[ this.axisPoint ];

      this.domainOrigin[ this.axisPoint.toLowerCase() ]
        = value  /
        this.points[ this.axisPoint.toLowerCase() ] * ( this.lengths[ this.axisPoint ] - sizes.width);


    },

    setScales() {
      this.scaleX
        .domain([ this.domainOrigin.x,  this.domainLength.x ])
        .range([ this.lengths.X - sizes.width, this.lengths.X ]);
      this.scaleY
        .domain([ this.domainLength.y , this.domainOrigin.y, ])
        .range([ this.lengths.Y - sizes.height, this.lengths.Y ]);
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
        .attr( 'transform', `translate( 0, ${ sizes.height  } )` );

      this.axisXgroup.select('.axisPoint')
        .attr('cx', this.points.x )
        .style('display', editMode === 'axis' && this.points.x && this.axisPoint === 'X' ? 'block' : 'none')
      ;

      this.axisXgroup.select('text.lbl')
        .text(`${this.label.X}, ${this.unit.X}`)
        .attr('x', this.lengths.X - 30 )
        .attr('y', - 30 );


      this.axisYgroup
        .call( this.axisY )
        .attr( 'transform', `translate( 0, ${ this.origin.y * 2 } )` );
;

      this.axisYgroup.select('.axisPoint')
        .attr('cy', - this.origin.y + this.lengths.Y - this.points.y)
        .style('display', editMode === 'axis' && this.points.y && this.axisPoint === 'Y' ? 'block' : 'none')
      ;

      this.axisYgroup.select('text.lbl')
        .text(`${this.label.Y}, ${this.unit.Y}`)
        .attr('x', 30 )
        .attr('y', 30 - this.origin.y );

      this.originPoint
        .attr('transform', `translate(${this.origin.x},${sizes.height - this.origin.y})`);

      plot.attr('transform', `translate( ${ this.origin.x }, ${  - this.origin.y } )` );

    },

    init() {

      this.axisXgroup.append('rect')
        .attr('x', 0)
        .attr('y', -5)
        .attr('width', sizes.width)
        .attr('height', 5)
        .attr('fill', 'transparent');


      this.axisXgroup.append('circle')
        .classed('axisPoint', true)
        .attr('id', 'apX')
        .attr('cy', 0)
        .attr('r', 8)
        .style('fill', 'blue');

      this.axisXgroup.append('text')
        .classed('lbl', true)
        .style('stroke', 'black')
        .style('font-size', 12)
        ;

      this.axisXgroup.append('rect')
        .attr('x', -5)
        .attr('y', -  sizes.height)
        .attr('width', 10)
        .attr('height',  sizes.height)
        .attr('fill', 'transparent');


      this.axisYgroup.append('circle')
        .classed('axisPoint', true)
        .attr('id', 'apY')
        .attr('cx', 0)
        .attr('r', 8)
        .style('fill', 'blue');

      this.axisYgroup.append('text')
        .classed('lbl', true)
        .style('stroke', 'black')
        .style('font-size', 12)
      ;

      this.originPoint = svg.append('g')
        .attr('transform', `translate(0,${sizes.height})`);

      this.originPoint.append('rect')
        .attr('x', -15)
        .attr('y', -15)
        .attr('width', 30)
        .attr('height', 30)
        .style('opacity', 0)
        .classed('origin-field', true);



      this.originPoint
        .append('circle')
        .attr('cx', 0 )
        .attr('cy', 0 )
        .attr('r', 5)
        .style('fill', 'black')
        .style('opacity', .7);

      let dragAxisPoint = d3.drag()
        .on('start', () => {
          this.axisPoint = d3.event.sourceEvent.originalTarget.id.slice(2);

        })
        .on('drag end', () => {
            this.setPoint(d3.mouse($('#plot')[0]), this.axisPoint );
            render();
        });

      svg.selectAll('.axisPoint').call(dragAxisPoint);


      let dragOrigin = d3.drag()
        .on('start', () => {

        })
        .on('drag end', () => {
          let coords = d3.mouse($('#plot')[0]);
          this.setOrigins( coords );
          render();
        });

      this.originPoint.call( dragOrigin );


      this.apply();
    },

    apply() {
      this.setScales();
      this.setAxes();
      this.drawAxes();
    }

  };


  let Line = function ( name ) {
    this.id = Math.floor( Math.random() * 10000 );
    this.name = name;
    this.points = [];
    this.group = svg.append('g').attr('id', 'l' + lines.length);

    svg.selectAll('.point' + this.id)
      .data(this.points)
      .enter()
      .append('circle')
      .classed('point', true)
      .classed('point' + this.id, true);

    svg.append('path')
      .classed('line' + this.id, true)
      .style('fill', 'transparent')
      .style('stroke', 'red')
      .style('stroke-width', 2);


    this.line = d3.line();

    this.target = false;

    this.drag = d3.drag()
      .on('start', () => {
        let ids = $(d3.event.sourceEvent.currentTarget).attr('id').split('_');
        currentLine = + ids[0].slice(2);
        currentPoint = + ids[1].slice(1);

        this.target = currentPoint;
      })
      .on('drag', () => {
        let coord = d3.mouse($('#plot')[0]);
        this.points[ this.target ] = coord;
        render();
      })
      .on('end', () => {
        this.target = false;
        render();
      } );


  };

  Line.prototype.addPoint = function( coords ) {
    this.points.push(coords);

    this.points.sort( (p1, p2) => p1[0] - p2[0] );

    let point = svg.append('circle')
      .classed('point', true)
      .classed('point' + this.id, true);

    point.call(this.drag);
  };

  Line.prototype.deletePoint = function( index ) {
    this.points.splice( index, 1 );
    svg.select('.point' + this.id +':last-child').remove();
  };

  Line.prototype.draw = function() {
    svg.selectAll('.point' + this.id)
      .data(this.points)
      .attr('id', (d, i) => 'gr' + currentLine + '_p' + i)
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 5)
      .style('fill', 'red');


    svg.select('.line' + this.id)
      .attr('d', this.line(this.points));
  };

  Line.prototype.apply = function() {
    if (!this.target) {
      this.points.sort( (p1, p2) => p1[0] - p2[0] );  ///Dont sort during dragging
    }


    this.draw();
  };

  lines.push(new Line('line1'));



  axes.init();

  let toolbar = {
    $els: {
      setPointOn: $('.setPointOn'),
      setPointOff: $('.setPointOff'),
      addPoint: $('.addPoint'),
      editPoint: $('.editPoint'),
    },
    $controls: {
      addPoint: $('#addPoint'),
      editPoint: $('#editPoint'),
      deletePoint: $('#deletePoint'),
      addLine: $('#addLine'),
      deleteLine: $('#deleteLine'),
      selectLine: $('#selectLine'),
      setAxisPoint: $('#setAxisPoint'),
      saveAxisPoint: $('#saveAxisPoint'),
      cancelAxisPoint: $('#cancelAxisPoint'),
      send: $('#send')
    },
    $inputs: {
      pointXadd: $('#pointXadd'),
      pointYadd: $('#pointYadd'),
      pointXedit: $('#pointXedit'),
      pointYedit: $('#pointYedit'),
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

    saveAxisPoint( ) {

      axes.setScale( this.$inputs.pointPosition.val() );
      axes.apply();
    },

    checkAxisPoint() {
      this.$controls.saveAxisPoint.attr('disabled', !axes.axisPoint || this.$inputs.pointPosition.val()== '' );
    },

    changeMode( mode ) {
      editMode = mode;
      render();
    },

    setOrigin( event ) {

      axes.setOrigins([ this.$inputs.originX.val(), this.$inputs.originY.val() ]);
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

      let name = this.$inputs.newLineName.val() || 'line' + ( lines.length + 1 );
      lines.push( new Line(name) );
      currentLine = lines.length - 1;
      currentPoint = false;
      render();
    },

    deleteLine() {
      lines.splice( currentLine, 1 );
      if( lines.length == currentLine )
        currentLine--;

      render();
    },

    addPoint() {
      let x = this.$inputs.pointXadd.val(),
        y = this.$inputs.pointYadd.val();

      if ( x && y ) {
        lines[ currentLine ].addPoint([axes.scaleX( x ) + axes.origin.x, axes.scaleY( y ) + axes.origin.y ]);
        this.$inputs.pointXadd.val('');
        this.$inputs.pointYadd.val('');

        render();
      }
    },

    editPoint() {
      let x = this.$inputs.pointXedit.val(),
        y = this.$inputs.pointYedit.val();

      if ( x && y ) {
        lines[ currentLine ].points[currentPoint] = [axes.scaleX( x ) + axes.origin.x, axes.scaleY( y ) + axes.origin.y ];
        render();
      }
    },

    deletePoint() {
      lines[currentLine].deletePoint(currentPoint);
      currentPoint = false;
      render();
    },


    delegateEvents() {
      this.$controls.addPoint.on('click', () => this.addPoint());
      this.$controls.editPoint.on('click', () => this.editPoint());
      this.$controls.deletePoint.on('click', () => this.deletePoint());
      this.$controls.addLine.on('click', () => this.addLine());
      this.$controls.deleteLine.on('click', () => this.deleteLine());

      this.$controls.selectLine.on('change', () => {
        currentLine = this.$controls.selectLine.val();
        render();
      });

      this.$controls.setAxisPoint.on('click', () => this.changeMode('axis'));
      this.$controls.saveAxisPoint.on('click', () => {
        this.saveAxisPoint();
        this.changeMode('line');
      });
      this.$controls.cancelAxisPoint.on('click', () => this.changeMode('line'));

      this.$controls.send.on('click', () => send() );

      this.$inputs.pointPosition.on('input', () => this.checkAxisPoint());

      this.$inputs.lineName.on('change', () => this.setName());
      this.$inputs.origin.on('change', ( event ) => this.setOrigin( event ));
      this.$inputs.label.on('change', ( event ) => this.setLabel( event ));
      this.$inputs.unit.on('change', ( event ) => this.setUnit( event ));
    },

    apply() {
      if( currentPoint !== false ) {
        this.$els.editPoint.css('display','block');
        this.$els.addPoint.css('display','none');
        this.$inputs.pointXedit.val(
          axes.scaleX.invert(lines[currentLine].points[currentPoint][0] - axes.origin.x) );
        this.$inputs.pointYedit.val(
          axes.scaleY.invert(lines[currentLine].points[currentPoint][1] - axes.origin.y) );
      } else {
        this.$els.addPoint.css('display','block');
        this.$els.editPoint.css('display','none');
      }


      this.$controls.deleteLine.attr('disabled', lines.length < 2 );


      this.$controls.selectLine.empty();
      lines.forEach( (line, index) => {
        let option = `<option value="${index}">${line.name}</option>`;
        this.$controls.selectLine.append( option );
      });

      this.$controls.selectLine.val(currentLine);

      this.$controls.saveAxisPoint.attr('disabled', !axes.axisPoint || this.$inputs.pointPosition.val()== '' );


      this.$inputs.lineName.val( lines[currentLine].name );
      this.$inputs.originX.val( axes.origin.x );
      this.$inputs.originY.val( sizes.height - axes.origin.y );
      this.$inputs.labelX.val( axes.label.X );
      this.$inputs.labelY.val( axes.label.Y );
      this.$inputs.unitX.val( axes.unit.X );
      this.$inputs.unitY.val( axes.unit.Y );

      this.$els.setPointOn.css( 'display', editMode === 'axis'  ? 'block' : 'none');
      this.$els.setPointOff.css('display', editMode === 'line' ? 'block' : 'none');
      this.$controls.saveAxisPoint.attr('disabled', !axes.axisPoint || this.$inputs.pointPosition.val()== '' );
    }
  };

  toolbar.delegateEvents();

  svg.on('click', () => {

    if( $(d3.event.target).hasClass('point') ) {
      let ids = $(d3.event.target).attr('id').split('_');
      currentLine = + ids[0].slice(2);
      currentPoint = + ids[1].slice(1);
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

          lines[currentLine].addPoint(coord);

          break;
      }
    }

    render();

  });

  svg.on('contextmenu', () => {
    if( $(d3.event.target).hasClass('point') ) {
      d3.event.preventDefault();
      let ids = $(d3.event.target).attr('id').split('_');
      currentLine = + ids[0].slice(2);
      lines[ currentLine ].deletePoint( + ids[1].slice(1) );
      render();
    }
  });


  render();

  function render() {
    axes.apply();
    lines[ currentLine ].apply();
    toolbar.apply();
  }

  function send() {
   let data = {
     axesOrigin: axes.origin,
     points: axes.points,
     pointsVal: axes.pointsVal,
     labels: axes.label,
     units: axes.unit,
     graphs: []
   };

   lines.forEach( line => data.graphs.push({ name: line.name, points: line.points }) );

   console.log( data );

  }




};

$(main);