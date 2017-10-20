class Axes {

  constructor( app, plot ) {
    this.app = app;
    this.plot = plot;
  }

  init() {

    this.initVals();

    this.initDraw();
  }

  initVals() {

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
      x: 100,
      y: 100
    };
    this.pointsVal =  {
      x: 100,
      y: 100
    };
    this.axisPoint = false;

  }

  initDraw() {

    this.axisXgroup = this.app.plotGr.append('g')
      .attr('id', 'axisX')
      .classed('axis', true );

    this.axisXgroup
      .call( this.axis.x )
      .attr( 'transform', `translate( 0, ${ this.app.sizes.height  } )` );

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
      .classed('axisPointText', true )
      .text( this.pointsVal.x )
      .attr('y', - 20)
      .style('stroke', 'blue')
      .style('font-size', '14px');

    this.axisXgroup.append('text')
      .classed('lbl', true );

    this.axisYgroup = this.app.plotGr.append('g')
      .attr('id', 'axisY')
      .classed('axis', true );

    this.axisYgroup
      .call( this.axis.y )
      .attr( 'transform', `translate( 0, ${ this.origin.y * 2 } )` );

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
      .classed('axisPointText', true )
      .text( this.pointsVal.y )
      .attr('x', 20 )
      .style('stroke', 'blue')
      .style('font-size', '14px');

    this.axisYgroup.append('text')
      .classed('lbl', true );

    this.originPoint = this.app.svg.append('g')
      .classed('originPoint', true)
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

    this.originPoint.attr('transform',
      `translate(${ this.origin.x }, ${ this.app.sizes.height - this.origin.y })`);

    this.app.plotGr.attr('transform',
      `translate( ${ this.origin.x }, ${ - this.origin.y } )` );
  }

  callDrag() {
    let plot = $('#plot')[0];

    let dragAxisPoint = d3.drag()
      .on('start', () =>
          this.axisPoint =
            d3.event.sourceEvent.target.id.slice(2).toLowerCase()
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

    this.origin.x = coords[0] ;
    this.origin.y = this.app.sizes.height - coords[1];

    this.lengths.x = this.app.sizes.width - this.origin.x;
    this.lengths.y = coords[1];

    for ( let point in this.points) {
      if ( this.points[point] ) {
        this.setScale( this.pointsVal[point], point );
      }
    }

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

  setScale( value, axis ) {
    let size = axis==='x' ? 'width' : 'height';

    this.pointsVal[ axis ] = value;

    this.domainLength[ axis ] = value  /
      this.points[ axis ] * this.lengths[ axis ];

    this.domainOrigin[ axis ] = value  /
      this.points[ axis ] *
      ( this.lengths[ axis ] - this.app.sizes[ size ] );
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
      width: this.app.$container.width(),
      height: $('#document-container').height()
    };

    this.app.svg.attr('width', this.app.sizes.width )
      .attr('height', this.app.sizes.height );

    this.app.overlay.attr('width', this.app.sizes.width )
      .attr('height', this.app.sizes.height );

    this.lengths.x = this.lengths.x + this.app.sizes.width - oldSizes.width;
    this.origin.y = this.origin.y + this.app.sizes.height - oldSizes.height;

    this.domainLength.x += this.lengths.x - oldLengthX;
this.setScale( this.pointsVal.x, 'x');
    this.setScale( this.pointsVal.y, 'y');

  }

  drawAxes() {
    const axisXText = `${ this.label.x }, ${ this.unit.x }`;

    this.axisXgroup
      .call( this.axis.x )
      .attr( 'transform', `translate( 0, ${ this.app.sizes.height  } )` );

    this.axisXgroup.select('.axisPoint')
      .attr('cx', this.points.x );

    this.axisXgroup.select('text.lbl')
      .text( axisXText )
      .attr('x', this.lengths.x - axisXText.length * 5 )
      .attr('y', - 30 );

    this.axisXgroup.selectAll('.tick text')
      .attr('transform', 'translate(0, -5)')
      .style('display', 'block')

      .filter( text =>  text == this.pointsVal.x )
      .style('display', 'none');

      this.axisXgroup.select('.axisPointText')
        .attr('x', this.points.x )
        .text( this.pointsVal.x );

    this.axisYgroup
      .call( this.axis.y )
      .attr( 'transform', `translate( 0, ${ this.origin.y * 2 } )` );

    this.axisYgroup.select('.axisPoint')
      .attr('cy', - this.origin.y + this.lengths.y - this.points.y );

    this.axisYgroup.select('text.lbl')
      .text(`${this.label.y }, ${ this.unit.y }`)
      .attr('x', 30 )
      .attr('y', 30 - this.origin.y );

    this.axisYgroup.selectAll('.tick text')
      .attr('transform', 'translate(5, 0)')
      .style('display', 'block')

      .filter( text =>  text == this.pointsVal.y )
      .style('display', 'none');

    this.axisYgroup.select('.axisPointText')
      .attr('y', - this.origin.y + this.lengths.y - this.points.y + 4 )
      .text( this.pointsVal.y );

    this.originPoint.attr('transform',
      `translate(${ this.origin.x }, ${ this.app.sizes.height - this.origin.y })`);

    this.app.plotGr.attr('transform',
      `translate( ${ this.origin.x }, ${ - this.origin.y } )` );

  }


}