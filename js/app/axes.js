class Axes {

  constructor( app ) {
    this.app = app;
  }

  init() {

    this.origin = {
      x: this.app.sizes.width / 2,
      y: this.app.sizes.height / 2
    };
    this.label = {
      x: 'X',
      y: 'Y'
    };
    this.unit = {
      x: 'unit',
      y: 'unit'
    };

    this.lengths = {
      x: this.app.sizes.width / 2,
      y: this.app.sizes.height / 2
    };
    this.scale = {
      x: d3.scaleLinear(),
      y: d3.scaleLinear()
    };
    this.axis = {
      x: d3.axisTop()
        .scale( this.scale.x ),
      y: d3.axisRight()
        .scale( this.scale.y )
    };
    this.domainOrigin = {
      x: - this.app.sizes.width / 2,
      y: - this.app.sizes.height / 2
    };

    this.domainLength = {
      x: this.app.sizes.width / 2,
      y: this.app.sizes.height / 2
    };

    this.points = {
      x: false,
      y: false
    };
    this.pointsVal =  {
      x: false,
      y: false
    };
    this.axisPoint = false;

    this.axisXgroup = this.app.plot.append('g')
      .attr('id', 'axisX')
      .classed('axis', true );

    this.axisXgroup.append('rect')
      .attr('x', - this.app.sizes.width)
      .attr('y', - 5 )
      .attr('width', this.app.sizes.width * 2 )
      .attr('height', 10 )
      .classed('crosshair', true )
      .style('fill', 'transparent');

    this.axisXgroup.append('circle')
      .classed('axisPoint', true )
      .attr('id', 'apX')
      .attr('cy', 0 )
      .attr('r', 8 )
      .style('fill', 'blue');

    this.axisXgroup.append('text')
      .classed('lbl', true )
      .style('stroke', 'black')
      .style('font-size', 12 );

    this.axisYgroup = this.app.plot.append('g')
      .attr('id', 'axisY')
      .classed('axis', true );

    this.axisYgroup.append('rect')
      .attr('x', - 5 )
      .attr('y', - this.app.sizes.height )
      .attr('width', 10 )
      .attr('height', this.app.sizes.height * 2 )
      .classed('crosshair', true )
      .style('fill', 'transparent');


    this.axisYgroup.append('circle')
      .classed('axisPoint', true )
      .attr('id', 'apY')
      .attr('cx', 0 )
      .attr('r', 8 )
      .style('fill', 'blue');

    this.axisYgroup.append('text')
      .classed('lbl', true )
      .style('stroke', 'black')
      .style('font-size', 12 );

    this.originPoint = this.app.svg.append('g')
      .attr('transform', `translate(0,${ this.app.sizes.height })`);

    this.originPoint.append('rect')
      .attr('x', -15 )
      .attr('y', -15 )
      .attr('width', 30 )
      .attr('height', 30 )
      .style('opacity', 0 )
      .classed('originPoint', true);

    this.originPoint
      .append('circle')
      .attr('cx', 0 )
      .attr('cy', 0 )
      .attr('r', 5 )
      .style('fill', 'black')
      .style('opacity', .7 )
      .classed('originPoint', true);

    this.callDrag();
  }

  callDrag() {
    let plot = $('#plot')[0];

    let dragAxisPoint = d3.drag()
      .on('start', () =>
        this.axisPoint =
          d3.event.sourceEvent.originalTarget.id.slice(2).toLowerCase()
      )
      .on('drag end', () => {
        let coords = d3.mouse( plot );
        this.app.setPoint( coords, this.axisPoint );
      });

    let dragOrigin = d3.drag()
      .on('drag end', () => {
        let coords = d3.mouse( plot );
        this.app.setOrigins( coords );
      });

    this.app.svg.selectAll('.axisPoint')
      .call( dragAxisPoint );
    this.originPoint.call( dragOrigin );

  }

  render() {
    this.setScales();
    this.setAxes();
    this.drawAxes();
  }

  setOrigins( coords ) {
    let axisPoint = this.axisPoint;

    this.origin.x = coords[0] ;
    this.origin.y = this.app.sizes.height - coords[1];

    this.lengths.x = this.app.sizes.width - this.origin.x;
    this.lengths.y = coords[1];

    for ( let point in this.points) {
      if ( this.points[point] ) {
        this.axisPoint = point;
        this.setScale( this.pointsVal[point] );
      }
    }

    this.axisPoint = axisPoint;
    this.setDomainOrigins();
  }

  setDomainOrigins( ) {
    this.domainOrigin.x = this.domainLength.x /
      this.lengths.x * ( this.lengths.x - this.app.sizes.width );
    this.domainOrigin.y = this.domainLength.y /
      this.lengths.y * ( this.lengths.y - this.app.sizes.height );
  }

  setPoint( coord, axis ) {
    this.axisPoint = axis;

    switch ( axis ) {
      case 'x':
        this.points.x = coord[0] - this.origin.x;
        break;
      case 'y':
        this.points.y = - this.origin.y + this.app.sizes.height - coord[1];
        break;
    }
  }

  setScale( value ) {
    let size = this.axisPoint==='x' ? 'width' : 'height';

    this.pointsVal[ this.axisPoint ] = value;

    this.domainLength[ this.axisPoint ] = value  /
      this.points[ this.axisPoint ] * this.lengths[ this.axisPoint ];

    this.domainOrigin[ this.axisPoint ] = value  /
      this.points[ this.axisPoint ] *
      ( this.lengths[ this.axisPoint ] - this.app.sizes[ size ] );
  }

  setScales() {
    this.scale.x
      .domain([ this.domainOrigin.x,  this.domainLength.x ])
      .range([ this.lengths.x - this.app.sizes.width, this.lengths.x ]);
    this.scale.y
      .domain([ this.domainLength.y , this.domainOrigin.y, ])
      .range([ this.lengths.y - this.app.sizes.height, this.lengths.y ]);
  }

  setAxes() {
    for( let axis in this.axis )
      this.axis[ axis ]
        .scale( this.scale[axis] );
  }


  correctSizes() {
    let oldSizes = this.app.sizes;
    let oldLengthX = this.lengths.x;

    this.app.sizes = {
      width: this.app.$container.prop('scrollWidth'),
      height: this.app.$container.height()
    };

    this.app.svg.attr('width', this.app.sizes.width )
      .attr('height', this.app.sizes.height );

    this.app.overlay.attr('width', this.app.sizes.width )
      .attr('height', this.app.sizes.height );

    this.lengths.x = this.lengths.x + this.app.sizes.width - oldSizes.width;
    if (this.lengths.x < 0) {
      this.origin.x = this.app.sizes.width;
      this.lengths.x = 0;
    }

    this.origin.y = this.origin.y + this.app.sizes.height - oldSizes.height;
    if (this.origin.y < 0) {
      this.origin.y = 0;
      this.lengths.y = this.app.sizes.height;
    }

    this.domainLength.x = this.domainLength.x + this.lengths.x - oldLengthX;
    if ( this.points.x )
      this.setScale( this.pointsVal.x );

    this.setDomainOrigins();
  }

  drawAxes() {
    this.axisXgroup
      .call( this.axis.x )
      .attr( 'transform', `translate( 0, ${ this.app.sizes.height  } )` );

    this.axisXgroup.select('.axisPoint')
      .attr('cx', this.points.x )
      .style('display',
        this.app.editMode === 'axis' && this.axisPoint === 'x'
          ? 'block'
          : 'none' );

    this.axisXgroup.select('text.lbl')
      .text(`${ this.label.x }, ${ this.unit.x }`)
      .attr('x', this.lengths.x - 30 )
      .attr('y', - 30 );

    this.axisYgroup
      .call( this.axis.y )
      .attr( 'transform', `translate( 0, ${ this.origin.y * 2 } )` );

    this.axisYgroup.select('.axisPoint')
      .attr('cy', - this.origin.y + this.lengths.y - this.points.y )
      .style('display',
        this.app.editMode === 'axis' && this.axisPoint === 'y'
          ? 'block'
          : 'none' );

    this.axisYgroup.select('text.lbl')
      .text(`${this.label.y }, ${ this.unit.y }`)
      .attr('x', 30 )
      .attr('y', 30 - this.origin.y );

    this.originPoint.attr('transform',
      `translate(${ this.origin.x }, ${ this.app.sizes.height - this.origin.y })`);

    this.app.plot.attr('transform',
      `translate( ${ this.origin.x }, ${ - this.origin.y } )` );

  }


}