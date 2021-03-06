class Line {

  constructor( name, app, plot ) {
    this.name = name;
    this.app = app;
    this.plot = plot;

    this.id = Math.floor(Math.random() * 10000);
    this.setColor();

    this.points = [];
    this.line = d3.line();
    this.target = false;
  }

  setColor() {
    let letters = '0123456789ABCDEF';

    this.color = '#';
    for (let i = 0; i < 6; i++)
      this.color += letters[ Math.floor(Math.random() * 16) ];
  }

  init() {

    this.initDrag();

    this.app.pointsGr.append('path')
      .classed(`line${ this.id }`, true)
      .style('fill', 'none')
      .style('stroke', this.color)
      .style('stroke-width', 2);

    this.app.pointsGr.selectAll('.point' + this.id )
      .data(this.points)
      .enter()
      .append('circle')
      .classed('point', true )
      .classed(`point${ this.id }`, true )
      .call( this.drag );

  }

  initDrag() {
    let plot = $('#plot')[0];

    this.drag = d3.drag()
      .on('start', () => {
        let ids = $( d3.event.sourceEvent.currentTarget ).attr('id').split('_');
        this.app.selectPoint( +ids[0].slice(2), +ids[1].slice(1) );
        this.target = this.app.currentPoint;
      })

      .on('drag', () => {
        let coord = d3.mouse( plot );
        this.points[ this.target ] = coord;
        this.render();
        this.app.newPoint = this.app.plots[ this.app.currentPlot ].axes.invertPoint(
          this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].points[ this.app.currentPoint ]
        );
        this.app.update();
      })

      .on('end', () => {
        this.target = false;
        this.render();
      });
  }

  addPoint( coords ) {

    this.points.push( coords );
    this.points.sort((p1, p2) => p1[0] - p2[0]);

    let point = this.app.pointsGr.append('circle')
      .classed('point', true )
      .classed(`point${ this.id }`, true );

    point.call( this.drag );
  }

  deletePoint(index) {
    this.points.splice( index, 1 );
    this.app.pointsGr.select(`.point${ this.id }:last-child`)
      .remove();
  }

  draw() {
    this.app.pointsGr.select(`.line${ this.id }`)
      .attr('d', this.line(this.points) );

    this.app.pointsGr.selectAll(`.point${ this.id }`)
      .data(this.points)
      .attr('id', (d, i) => `gr${ this.app.plots[ this.app.currentPlot ].lines.indexOf( this ) }_p${ i }` )
      .attr('cx', (d) => d[0] )
      .attr('cy', (d) => d[1] )
      .attr('r', 5 )
      .style('fill', this.color );
  }

  render() {
    if (!this.target) {
      this.points.sort((p1, p2) => p1[0] - p2[0]);
    }
    this.draw();
  }

  remove() {
    this.app.pointsGr.selectAll(`.point${ this.id }`)
      .remove();
    this.app.pointsGr.select(`.line${ this.id }`)
      .remove();
  }
}